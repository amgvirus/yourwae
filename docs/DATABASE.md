# Yourwae - Database Documentation

## Database Overview

Yourwae uses **PostgreSQL** (hosted on Supabase) as the primary database with the following features:

- Row Level Security (RLS) for data protection
- Real-time subscriptions support
- Full-text search capabilities
- JSON/JSONB support for flexible data structures
- Automatic timestamps on all tables

## Entity Relationship Diagram

```
users (1) ──── (N) stores
       │
       ├──── (N) orders
       ├──── (N) cart_items
       ├──── (N) addresses
       └──── (1) wallets

stores (1) ──── (N) products
      │
      └──── (N) orders

products (1) ──── (N) cart_items
        │
        ├──── (N) orders
        └──── (N) reviews

orders (1) ──── (1) payments
     │
     ├──── (1) delivery
     └──── (N) reviews

payments (1) ──── (1) orders

delivery (1) ──── (1) orders
      │
      └──── (1) users (delivery_partner)

wallets (1) ──── (N) wallet_transactions
```

## Table Schemas

### users

Stores user account information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password TEXT NOT NULL, -- Handled by Supabase Auth
  role role_type DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `email`: User email (unique)
- `phone`: Phone number (unique)
- `first_name`: User's first name
- `last_name`: User's last name
- `password`: Hashed password (managed by Supabase Auth)
- `role`: User role (customer, store, admin, delivery_partner)
- `avatar_url`: Profile picture URL
- `is_active`: Account status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### addresses

User delivery addresses.

```sql
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

-- Index for finding user addresses
CREATE INDEX idx_addresses_user ON addresses(user_id);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `type`: Address type (home, work, other)
- `street`: Street address
- `city`: City name
- `state`: State/Province
- `zip_code`: Postal code
- `country`: Country name
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `is_default`: Is this the default address
- `created_at`: Creation timestamp

### stores

Store owner information and store details.

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  store_image TEXT,
  category store_category NOT NULL,
  address JSONB NOT NULL,
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

-- Indexes
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_stores_is_active ON stores(is_active);
```

**Address JSONB Structure:**
```json
{
  "street": "123 Main St",
  "city": "Bangalore",
  "state": "Karnataka",
  "zip_code": "560001",
  "country": "India",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Operating Hours JSONB Structure:**
```json
{
  "monday": { "open": "08:00", "close": "22:00" },
  "tuesday": { "open": "08:00", "close": "22:00" },
  "wednesday": { "open": "08:00", "close": "22:00" },
  "thursday": { "open": "08:00", "close": "22:00" },
  "friday": { "open": "08:00", "close": "22:00" },
  "saturday": { "open": "08:00", "close": "23:00" },
  "sunday": { "open": "09:00", "close": "22:00" }
}
```

### products

Product listings.

```sql
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

-- Indexes for search
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('english', name));
```

**Specifications JSONB Example:**
```json
{
  "color": "red",
  "size": "large",
  "material": "cotton",
  "weight": "500g"
}
```

### cart_items

User shopping cart items.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE UNIQUE INDEX idx_cart_unique ON cart_items(user_id, product_id);
```

### orders

Customer orders.

```sql
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

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

**Items JSONB Structure:**
```json
[
  {
    "product_id": "uuid",
    "product_name": "Tomatoes",
    "quantity": 2,
    "price": 50,
    "discount": 0
  }
]
```

### payments

Payment transactions.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
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

-- Indexes
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### deliveries

Delivery tracking information.

```sql
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

-- Indexes
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_partner ON deliveries(delivery_partner_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
```

**Tracking Updates JSONB:**
```json
[
  {
    "status": "picked_up",
    "timestamp": "2024-02-11T10:15:00Z",
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "note": "Package picked up"
  }
]
```

### wallets

User digital wallets.

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_wallets_user ON wallets(user_id);
```

### wallet_transactions

Wallet transaction history.

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_wallet_trans_wallet ON wallet_transactions(wallet_id);
```

### reviews

Product and delivery reviews.

```sql
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

-- Indexes
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
```

## Queries & Views

### Popular Stores
```sql
SELECT * FROM stores
WHERE is_active = true
ORDER BY rating DESC, total_reviews DESC
LIMIT 10;
```

### Orders by Status
```sql
SELECT order_number, status, created_at
FROM orders
WHERE customer_id = 'user-id'
ORDER BY created_at DESC;
```

### Store Revenue
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as orders,
  SUM(total_amount) as revenue
FROM orders
WHERE store_id = 'store-id'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Product Search
```sql
SELECT * FROM products
WHERE to_tsvector('english', name || ' ' || description) 
  @@ plainto_tsquery('english', 'search query')
LIMIT 50;
```

## Row Level Security Policies

### Users Table
```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### Orders Table
```sql
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Store owners can view own store orders"
ON orders FOR SELECT
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
```

### Products Table
```sql
CREATE POLICY "Everyone can view active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "Store owners can modify own products"
ON products FOR UPDATE
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
```

## Backup & Recovery

### Manual Backup
```bash
# Export all data
pg_dump -d postgresql://user:password@db.supabase.co/postgres > backup.sql

# Restore from backup
psql -d postgresql://user:password@db.supabase.co/postgres < backup.sql
```

### Automated Backups
- Supabase provides daily automated backups
- Available from Project Settings → Backups
- Can restore to any point in time (for paid plans)

## Performance Optimization

### Query Optimization
1. Always use indexes on frequently queried columns
2. Use EXPLAIN ANALYZE to check query plans
3. Avoid N+1 queries by using joins
4. Use pagination for large result sets

### Common Slow Queries
```sql
-- Slow: Multiple queries
SELECT * FROM orders;
-- Then for each order, query for store details

-- Fast: Use join
SELECT o.*, s.store_name
FROM orders o
JOIN stores s ON o.store_id = s.id;
```

## Data Maintenance

### Cleanup Queries
```sql
-- Delete old cart items
DELETE FROM cart_items
WHERE created_at < NOW() - INTERVAL '30 days';

-- Archive old orders
DELETE FROM orders
WHERE status = 'cancelled'
  AND created_at < NOW() - INTERVAL '1 year';

-- Update store ratings
UPDATE stores
SET rating = (
  SELECT AVG(rating)
  FROM reviews
  WHERE product_id IN (SELECT id FROM products WHERE store_id = stores.id)
)
WHERE total_reviews > 0;
```

## Monitoring & Alerts

### Setup Database Monitoring
1. Go to Supabase Dashboard
2. Check Database → Usage
3. Monitor:
   - Disk usage
   - Connections
   - Query performance
   - Error rates

### Key Metrics to Monitor
- Database size growth
- Query execution time
- Connection count
- Disk usage
- CPU usage

---

**Database Maintenance Schedule:**
- Daily: Check backups
- Weekly: Analyze query performance
- Monthly: Cleanup old data
- Quarterly: Full audit and optimization
