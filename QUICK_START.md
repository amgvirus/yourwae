# Yourwae - Quick Start Guide

## 5-Minute Setup

### Step 1: Create Supabase Project (2 min)
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Enter name: `fast-get`
5. Create strong password
6. Click "Create new project"

### Step 2: Get API Keys (1 min)
1. Wait for project creation (2-3 min)
2. Click on project
3. Go to Settings → API
4. Copy:
   - `Project URL` → Keep as `SUPABASE_URL`
   - `anon public key` → Keep as `SUPABASE_ANON_KEY`

### Step 3: Setup Database (1 min)
1. Go to SQL Editor
2. Create new query
3. Copy entire SQL from `backend/SUPABASE_SETUP.sql`
4. Paste and click "Run"
5. Wait for completion ✓

### Step 4: Configure App (30 sec)
1. Open `frontend/js/app.js`
2. Find these lines (top of file):
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Replace with your copied values
4. Save file

### Step 5: Start Server (30 sec)
```bash
# Navigate to frontend folder
cd "frontend"

# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000
```

### Step 6: Open App!
1. Go to http://localhost:8000
2. Click "Sign Up"
3. Create test account
4. Explore! 🚀

## Testing the Platform

### Create Test Data

**Add a Test Store:**
1. Sign up as store owner
2. In database, manually add store details:
   ```sql
   INSERT INTO stores (owner_id, store_name, category, address, phone, email)
   VALUES (
     'your-user-id',
     'Test Grocery Store',
     'grocery',
     '{"street": "123 Main St", "city": "Bangalore", "latitude": 12.9716, "longitude": 77.5946}',
     '9876543210',
     'store@test.com'
   );
   ```

**Add Test Products:**
```sql
INSERT INTO products (store_id, name, price, stock, category, images)
VALUES (
  'store-id',
  'Fresh Tomatoes',
  50,
  100,
  'vegetables',
  ARRAY['https://via.placeholder.com/300']
);
```

**Create Test Customer:**
- Sign up normally through app
- Test browsing stores
- Add to cart
- Checkout

## Common Tasks

### Add a New Store
1. Sign up with email
2. Choose "Store Owner" role
3. Fill in store details
4. Store created!

### Add Products (as Store Owner)
1. Database: Insert products with your store_id
2. Or use admin panel (future feature)

### Make an Order (as Customer)
1. Sign up as customer
2. Browse stores
3. Click store
4. Choose products
5. Add to cart
6. Checkout
7. Enter address
8. Select payment method
9. Place order!

### Track Order
1. Go to "My Orders"
2. Click on order
3. See real-time tracking

## Project Structure

```
fast-get/
├── frontend/                      # All frontend files
│   ├── index.html                # Home page
│   ├── login.html                # Login
│   ├── signup.html               # Sign up
│   ├── stores.html               # Browse stores
│   ├── store-detail.html         # Store & products
│   ├── cart.html                 # Shopping cart
│   ├── checkout.html             # Order checkout
│   ├── orders.html               # View orders
│   ├── css/
│   │   └── styles.css            # All styling
│   └── js/
│       ├── app.js                # Core functions ⭐
│       └── [page-name].js        # Page-specific logic
│
├── backend/
│   ├── SUPABASE_SETUP.sql       # Database schema
│   └── .env.example              # Environment template
│
├── docs/
│   ├── INSTALLATION.md           # Detailed setup
│   ├── API_DOCUMENTATION.md      # API reference
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── DATABASE.md               # Database details
│
├── README.md                      # Project overview
└── SUPABASE_SCHEMA.md            # Database schema
```

## Key Features

✅ **User Authentication**
- Email/password signup
- Login/logout
- Role-based access

✅ **Store Browsing**
- View all stores
- Filter by category
- Search functionality

✅ **Shopping System**
- Browse products
- Add to cart
- Manage quantities

✅ **Ordering**
- Delivery address
- Multiple payment methods
- Order confirmation

✅ **Order Tracking**
- View order status
- Delivery tracking
- Order history

✅ **Payment**
- Stripe integration ready
- Multiple payment methods
- Secure transactions

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Database | PostgreSQL |
| Hosting | Netlify/Vercel/Firebase |
| Payments | Stripe (optional) |

## User Roles

### 👤 Customer
- Browse stores
- Search products
- Add to cart
- Checkout
- Track orders
- View history

### 🏪 Store Owner
- Register store
- Add products
- Manage inventory
- View orders
- Track revenue

### 👨‍💼 Admin (Future)
- Verify stores
- Manage categories
- View analytics
- Handle disputes

## Next Steps

### Immediate
1. ✅ Setup Supabase ← You're here
2. ✅ Create database
3. ✅ Configure frontend
4. Test all features

### Short Term (1-2 weeks)
- Add test data
- Style customization
- Setup payments
- Deploy to production

### Medium Term (1 month)
- Mobile app
- Admin dashboard
- Advanced features
- Marketing

### Long Term (3-6 months)
- Scale infrastructure
- Analytics
- AI features
- Marketplace expansion

## Troubleshooting

### Page won't load
- Check browser console (F12)
- Verify server is running
- Check SUPABASE_URL and key

### Can't sign up
- Check email format
- Verify phone format (10 digits)
- Check database for duplicate email

### Cart shows empty
- Make sure you're logged in
- Check browser localStorage
- Verify product exists

### Payment not working
- Add Stripe keys (optional)
- Check payment method selected
- See browser console for errors

## Rate Limiting

Current limits:
- 100 requests/minute per user
- 1000 requests/hour per user

## Support

Need help?
1. Check documentation in `/docs`
2. Look at browser console errors (F12)
3. Check Supabase logs
4. Review GitHub issues
5. Email: support@fastget.com

## Useful Links

- Supabase Docs: https://supabase.com/docs
- JavaScript Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- CSS Reference: https://developer.mozilla.org/en-US/docs/Web/CSS
- HTTP Server: https://expressjs.com

## What You Can Do Now

✨ **Right Now at Localhost 8000:**
- Sign up as customer or store owner
- Browse stores (once you add them)
- Practice the complete flow
- Test all pages
- Check console for errors

## Production Deployment

When ready to go live:
1. Choose hosting (Netlify recommended)
2. Push code to GitHub
3. Connect to Supabase production
4. Set environment variables
5. Deploy!

See `docs/DEPLOYMENT.md` for detailed instructions.

---

**Congratulations!** You now have a working hyperlocal e-commerce platform. 🎉

Start by exploring the app at http://localhost:8000
