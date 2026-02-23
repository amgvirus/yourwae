-- ============================================================
-- FIX_SCHEMA.sql - Run this in Supabase SQL Editor to fix
-- signup trigger failures and store loading issues.
-- ============================================================

-- ==========================================
-- 1. FIX PHONE UNIQUE CONSTRAINT
-- The phone column has UNIQUE NOT NULL, which causes the 
-- handle_new_user trigger to fail when multiple users send
-- empty or duplicate phone numbers.
-- ==========================================

-- Drop the unique constraint on phone (if it exists)
DO $$ 
BEGIN
  -- Find and drop any unique constraint on the phone column
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
    AND contype = 'u'
    AND EXISTS (
      SELECT 1 FROM unnest(conkey) k
      JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = k
      WHERE a.attname = 'phone'
    )
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.users DROP CONSTRAINT ' || conname
      FROM pg_constraint 
      WHERE conrelid = 'public.users'::regclass 
      AND contype = 'u'
      AND EXISTS (
        SELECT 1 FROM unnest(conkey) k
        JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = k
        WHERE a.attname = 'phone'
      )
      LIMIT 1
    );
    RAISE NOTICE 'Dropped unique constraint on users.phone';
  ELSE
    RAISE NOTICE 'No unique constraint on users.phone found';
  END IF;
END $$;

-- Also drop the unique index on phone if it exists separately
DROP INDEX IF EXISTS idx_users_phone;

-- Make phone nullable with a default empty string
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN phone SET DEFAULT '';

-- Re-create a non-unique index on phone for lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ==========================================
-- 2. ADD UNIQUE CONSTRAINT ON stores.owner_id
-- The handle_new_user trigger uses ON CONFLICT (owner_id)
-- which requires a unique constraint/index.
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.stores'::regclass 
    AND contype = 'u'
    AND EXISTS (
      SELECT 1 FROM unnest(conkey) k
      JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = k
      WHERE a.attname = 'owner_id'
    )
  ) THEN
    ALTER TABLE public.stores ADD CONSTRAINT stores_owner_id_unique UNIQUE (owner_id);
    RAISE NOTICE 'Added unique constraint on stores.owner_id';
  ELSE
    RAISE NOTICE 'Unique constraint on stores.owner_id already exists';
  END IF;
END $$;

-- ==========================================
-- 3. FIX / ADD MISSING RLS POLICIES
-- ==========================================

-- Ensure stores can be read by anyone (even unauthenticated)
DROP POLICY IF EXISTS "Anyone can view active verified stores" ON stores;
CREATE POLICY "Anyone can view active verified stores" ON stores
  FOR SELECT USING (is_active = true AND is_verified = true);

-- Ensure products can be read by anyone
DROP POLICY IF EXISTS "Anyone can view products of active stores" ON products;
CREATE POLICY "Anyone can view products of active stores" ON products
  FOR SELECT USING (is_active = true);

-- Wallets: users can view their own wallet
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Wallets: users can update their own wallet (for balance changes)
DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Payments: users can view their own payments
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = customer_id);

-- Payments: users can create payments
DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Deliveries: users can view their order deliveries
DROP POLICY IF EXISTS "Users can view their deliveries" ON deliveries;
CREATE POLICY "Users can view their deliveries" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- ==========================================
-- 4. RE-CREATE THE TRIGGER FUNCTION
-- Updated to handle phone gracefully (no error on empty)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, phone, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'store' THEN 'store'::role_type
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::role_type
      WHEN NEW.raw_user_meta_data->>'role' = 'delivery_partner' THEN 'delivery_partner'::role_type
      ELSE 'customer'::role_type
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

  -- Create wallet if it doesn't exist
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create store if role is 'store'
  IF (NEW.raw_user_meta_data->>'role' = 'store') THEN
    INSERT INTO public.stores (owner_id, store_name, category, is_verified, is_active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'store_name', 'My Store'),
      CAST(COALESCE(NEW.raw_user_meta_data->>'store_category', 'other') AS store_category),
      true,
      true
    )
    ON CONFLICT (owner_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'handle_new_user trigger error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. SYNC EXISTING AUTH USERS (fix any missing public.users rows)
-- ==========================================
INSERT INTO public.users (id, email, phone, first_name, last_name, role)
SELECT 
  id, 
  email,
  COALESCE(NULLIF(raw_user_meta_data->>'phone', ''), phone, ''),
  COALESCE(raw_user_meta_data->>'first_name', 'User'),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  CASE 
    WHEN raw_user_meta_data->>'role' = 'store' THEN 'store'::role_type
    WHEN raw_user_meta_data->>'role' = 'admin' THEN 'admin'::role_type
    WHEN raw_user_meta_data->>'role' = 'delivery_partner' THEN 'delivery_partner'::role_type
    ELSE 'customer'::role_type
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

-- Sync wallets
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Sync stores for store owners
INSERT INTO public.stores (owner_id, store_name, category, is_verified, is_active)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'store_name', 'My Store'),
  CAST(COALESCE(raw_user_meta_data->>'store_category', 'other') AS store_category),
  true,
  true
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'store'
ON CONFLICT (owner_id) DO NOTHING;

-- ==========================================
-- 6. VERIFY
-- ==========================================
SELECT 'Auth users' as table_name, count(*) as count FROM auth.users
UNION ALL
SELECT 'Public users', count(*) FROM public.users
UNION ALL
SELECT 'Stores', count(*) FROM public.stores
UNION ALL
SELECT 'Wallets', count(*) FROM public.wallets;
