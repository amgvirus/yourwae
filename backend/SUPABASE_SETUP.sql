# CREATE DATABASE SCHEMA - SUPABASE SQL

-- Create enum types
CREATE TYPE role_type AS ENUM ('customer', 'store', 'admin', 'delivery_partner');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('card', 'wallet', 'upi', 'netbanking', 'cod');
CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE store_category AS ENUM ('grocery', 'electronics', 'pharmacy', 'fashion', 'beauty', 'home', 'food', 'other');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role role_type DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type address_type DEFAULT 'home',
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  store_image TEXT,
  category store_category NOT NULL,
  address JSONB,
  phone VARCHAR(20),
  email VARCHAR(255),
  operating_hours JSONB,
  delivery_radius DECIMAL(5, 2) DEFAULT 5,
  base_delivery_fee DECIMAL(10, 2) DEFAULT 5,
  delivery_fee_per_km DECIMAL(10, 2) DEFAULT 2,
  minimum_order_value DECIMAL(10, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  bank_details JSONB,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount DECIMAL(5, 2) DEFAULT 0,
  images TEXT[],
  category VARCHAR(100),
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  tags TEXT[],
  specifications JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax DECIMAL(15, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_applied DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  delivery_address JSONB,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method_type DEFAULT 'card',
  payment_id VARCHAR(255),
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  rating DECIMAL(3, 2),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',
  payment_method payment_method_type NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  status payment_status DEFAULT 'pending',
  refund_amount DECIMAL(15, 2) DEFAULT 0,
  refund_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  delivery_partner_id UUID REFERENCES users(id),
  pickup_location JSONB,
  delivery_location JSONB,
  distance DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2) NOT NULL,
  status delivery_status DEFAULT 'assigned',
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  pickup_time TIMESTAMP,
  delivery_time TIMESTAMP,
  otp VARCHAR(10),
  otp_verified BOOLEAN DEFAULT false,
  tracking_updates JSONB,
  rating DECIMAL(3, 2),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  rating DECIMAL(3, 2) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, phone, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CAST(COALESCE(NEW.raw_user_meta_data->>'role', 'customer') AS role_type)
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES --

-- Users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Stores
CREATE POLICY "Anyone can view active verified stores" ON stores
  FOR SELECT USING (is_active = true AND is_verified = true);

CREATE POLICY "Owners can manage their own stores" ON stores
  FOR ALL USING (auth.uid() = owner_id);

-- Products
CREATE POLICY "Anyone can view products of active stores" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage their products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()
    )
  );

-- Cart Items
CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Wallets
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

