-- Run this script in the Supabase SQL Editor to fix users who exist in Auth but not in public.users

-- 1. Sync users
INSERT INTO public.users (id, email, phone, first_name, last_name, role)
SELECT 
  id, 
  email,
  COALESCE(raw_user_meta_data->>'phone', phone, ''),
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

-- 2. Sync wallets
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Sync stores for store owners
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

-- 4. Verify
SELECT count(*) FROM public.users;
SELECT count(*) FROM public.stores;

