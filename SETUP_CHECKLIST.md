# Yourwae - Setup Checklist ✅

Complete this checklist to launch your hyperlocal ecommerce platform.

## Pre-Launch Checklist

### Phase 1: Prepare Environment (5 minutes)
- [ ] Download/unzip the Yourwae files to your computer
- [ ] Verify all folders exist:
  - [ ] `frontend/` (HTML, CSS, JS files)
  - [ ] `backend/` (Database schema)
  - [ ] `docs/` (Documentation)
- [ ] Have a web browser ready (Chrome, Firefox, Safari, Edge)
- [ ] Have a text editor ready (VS Code, Notepad++, Sublime, etc.)

### Phase 2: Create Supabase Project (10 minutes)
- [ ] Go to https://supabase.com
- [ ] Click "Start your project"
- [ ] Create free account or sign in
- [ ] Click "New Project"
  - [ ] Project name: `fast-get`
  - [ ] Database password: (save this!)
  - [ ] Region: Choose closest to your location
  - [ ] Click "Create new project"
- [ ] Wait for database to initialize (2-3 minutes)
- [ ] Copy your project details:
  - [ ] **Project URL**: Copy from Settings → API
  - [ ] **Anon Key**: Copy from Settings → API
  - [ ] **Save these in a text file!**

### Phase 3: Setup Database Schema (5 minutes)
- [ ] In Supabase dashboard, go to **SQL Editor**
- [ ] Click "New Query"
- [ ] Open `backend/SUPABASE_SETUP.sql` in your text editor
- [ ] Copy entire SQL file contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button at bottom right
  - [ ] Wait for all queries to complete (tables created)
  - [ ] Check for green checkmarks (no red errors)
- [ ] Confirm 13 tables are created:
  - [ ] users
  - [ ] addresses
  - [ ] stores
  - [ ] products
  - [ ] cart_items
  - [ ] orders
  - [ ] payments
  - [ ] deliveries
  - [ ] wallets
  - [ ] wallet_transactions
  - [ ] reviews
  - [ ] categories
  - [ ] custom types

### Phase 4: Configure Frontend (5 minutes)
- [ ] Open `frontend/js/app.js` in text editor
- [ ] Find lines 1-2 (first 5 lines):
  ```javascript
  const SUPABASE_URL = 'https://your-project.supabase.co'
  const SUPABASE_ANON_KEY = 'your-anon-key'
  ```
- [ ] Replace `'https://your-project.supabase.co'` with your **actual Project URL**
  - Example: `'https://xyzabc123.supabase.co'`
- [ ] Replace `'your-anon-key'` with your **actual Anon Key**
  - Example: `'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'`
- [ ] Save the file **IMPORTANT!**
- [ ] Double-check the values are pasted correctly (no extra spaces, quotes intact)

### Phase 5: Start Local Server (2 minutes)
Choose ONE method based on your OS:

#### Windows (PowerShell):
- [ ] Open PowerShell
- [ ] Navigate to frontend folder:
  ```powershell
  cd "C:\Users\USER\Music\fast get\frontend"
  ```
- [ ] Start Python server:
  ```powershell
  python -m http.server 8000
  ```
- [ ] Wait for: `Serving HTTP on 0.0.0.0 port 8000`

#### Mac/Linux (Terminal):
- [ ] Open Terminal
- [ ] Navigate to frontend folder:
  ```bash
  cd ~/Music/fast\ get/frontend
  ```
- [ ] Start Python server:
  ```bash
  python3 -m http.server 8000
  ```
- [ ] Wait for: `Serving HTTP on 0.0.0.0 port 8000`

#### Alternative (Node.js):
- [ ] Open terminal in frontend folder
- [ ] Run:
  ```bash
  npx http-server -p 8000
  ```

#### Alternative (Simple HTTP Server):
- [ ] Download Brackets, VS Code, or LiveServer extension
- [ ] Open frontend folder in editor
- [ ] Click "Go Live" or equivalent button

### Phase 6: Access Your Platform (1 minute)
- [ ] Open web browser
- [ ] Go to: **http://localhost:8000**
- [ ] You should see the Yourwae home page with:
  - [ ] "Yourwae" logo at top
  - [ ] Search bar
  - [ ] "How It Works" section
  - [ ] Footer with company info

## Feature Testing Checklist

### Basic Navigation
- [ ] Home page loads successfully
- [ ] All navigation links work
- [ ] Responsive design works on mobile (zoom to 50%)
- [ ] Footer is visible at bottom of pages

### Authentication Flow
- [ ] Click "Sign Up" button
- [ ] Sign up as **Customer**:
  - [ ] Enter valid email
  - [ ] Enter password
  - [ ] Enter first name
  - [ ] Enter last name
  - [ ] Enter 10-digit phone number
  - [ ] Click "Sign Up"
  - [ ] See success message
  - [ ] Redirected to home page
- [ ] Click "Log Out" (top right menu)
- [ ] Sign up as **Store Owner**:
  - [ ] Select "Store Owner" radio button
  - [ ] Extra store fields appear
  - [ ] Fill all store fields
  - [ ] Click "Sign Up"
  - [ ] See success message

### Login & Logout
- [ ] Click "Log In" on home page
- [ ] Enter your email and password
- [ ] Click "Log In"
- [ ] See user menu appear (top right)
- [ ] Click user menu
- [ ] Click "Log Out"
- [ ] Return to login page

### Store Browsing
- [ ] Go to "Stores" page
- [ ] See list of stores (if stores exist in database)
- [ ] Try **Category Filter**:
  - [ ] Select a category from dropdown
  - [ ] Store list filters
- [ ] Try **Search**:
  - [ ] Type store name in search box
  - [ ] Results filter in real-time
- [ ] Try **Pagination**:
  - [ ] Click "Next" button
  - [ ] See different stores
  - [ ] Click "Previous"
  - [ ] Return to first page

### Product Browsing
- [ ] Click on any store card
- [ ] See store details (name, rating, delivery fee)
- [ ] See store's products in grid
- [ ] Click on any product
- [ ] Modal opens with:
  - [ ] Product image
  - [ ] Product name
  - [ ] Price
  - [ ] Quantity selector
  - [ ] "Add to Cart" button
- [ ] Change quantity to 2-3
- [ ] Click "Add to Cart"
- [ ] See success message
- [ ] Close modal

### Shopping Cart
- [ ] Click "Cart" in navigation
- [ ] See products you added
- [ ] See quantity, price, subtotal
- [ ] Try **Increase Quantity**:
  - [ ] Click + button next to item
  - [ ] Quantity increases
  - [ ] Price updates
- [ ] Try **Decrease Quantity**:
  - [ ] Click - button
  - [ ] Quantity decreases
- [ ] See **Cart Summary**:
  - [ ] Subtotal
  - [ ] Tax (10%)
  - [ ] Delivery Fee (₹50)
  - [ ] Total
- [ ] Try **Remove Item**:
  - [ ] Click "Remove" button
  - [ ] Item disappears
  - [ ] Totals update

### Checkout Process
- [ ] Click "Proceed to Checkout"
- [ ] Fill in **Delivery Address**:
  - [ ] Street address
  - [ ] City
  - [ ] State
  - [ ] Zip code
- [ ] Try **Payment Methods**:
  - [ ] Select "Credit Card"
  - [ ] Card fields appear (CC, expiry, CVV)
  - [ ] Select "UPI"
  - [ ] UPI field appears
  - [ ] Select "Wallet"
  - [ ] Wallet info appears
  - [ ] Select "Cash on Delivery"
  - [ ] No additional fields
- [ ] See **Order Summary**:
  - [ ] Items list with quantities
  - [ ] Subtotal
  - [ ] Tax
  - [ ] Delivery fee
  - [ ] Total amount
- [ ] Enter special instructions (optional)
- [ ] Click "Place Order"
- [ ] See success message
- [ ] Redirected to orders page

### Order History
- [ ] Click "My Orders"
- [ ] See your placed order:
  - [ ] Order number
  - [ ] Date
  - [ ] Amount
  - [ ] Status (Pending, Confirmed, etc.)
- [ ] Try **Filtering**:
  - [ ] Click "Pending" filter
  - [ ] See only pending orders
  - [ ] Click "All" filter
- [ ] Click on order card
- [ ] Modal opens with full details:
  - [ ] Order items with quantities
  - [ ] Delivery address
  - [ ] Amount breakdown
  - [ ] Delivery tracking status

## Data Testing Checklist

### Create Test Data Manually (Optional)

**Add a Sample Store:**
- [ ] Go to Supabase Dashboard
- [ ] Click "Table Editor"
- [ ] Click "stores" table
- [ ] Click "Insert row"
- [ ] Fill in:
  - [ ] name: "Fresh Groceries"
  - [ ] owner_id: Use your store account user ID
  - [ ] description: "Fresh vegetables and groceries"
  - [ ] category: "grocery"
  - [ ] rating: 4.5
  - [ ] is_verified: true
  - [ ] base_delivery_fee: 50
- [ ] Click "Save"

**Add Sample Products:**
- [ ] Click "products" table
- [ ] Insert row:
  - [ ] store_id: Select the store you created
  - [ ] name: "Tomatoes (1kg)"
  - [ ] price: 40
  - [ ] description: "Fresh red tomatoes"
  - [ ] stock: 100
- [ ] Repeat for 3-4 more products
- [ ] Refresh frontend pages to see new data

## Troubleshooting Checklist

### "Cannot connect to Supabase"
- [ ] Check internet connection
- [ ] Verify Supabase Project URL in app.js is correct
- [ ] Verify Anon Key is correct (copy without extra spaces)
- [ ] Check Supabase project is "Active" not "Paused"
- [ ] Wait 2-3 minutes for database to initialize
- [ ] Check browser console for errors (F12 → Console)

### "Port 8000 already in use"
- [ ] Change port: `python -m http.server 8001`
- [ ] Or close other application using port 8000
- [ ] Open browser to http://localhost:8001

### "Database table doesn't exist"
- [ ] Go to Supabase SQL Editor
- [ ] Run SUPABASE_SETUP.sql again
- [ ] Check for errors in output
- [ ] Verify all 13 tables created in Table Editor

### "Sign up fails with error"
- [ ] Check browser console (F12 → Console) for error message
- [ ] Verify email format is valid
- [ ] Verify password is at least 6 characters
- [ ] Verify phone number is exactly 10 digits
- [ ] Try different email address

### "Cart is empty after adding product"
- [ ] Ensure you're logged in (check top right menu)
- [ ] Check browser console for errors
- [ ] Verify app.js has correct Supabase credentials
- [ ] Try browser "Clear Cache" and refresh

### "Checkout fails to place order"
- [ ] Ensure all delivery address fields are filled
- [ ] Ensure item is actually in cart
- [ ] Check browser console for error details
- [ ] Verify database tables were created (cart_items, orders)

### "Page is blank/white"
- [ ] Refresh browser (Ctrl+R or Cmd+R)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check internet connection
- [ ] Check console for JavaScript errors (F12)
- [ ] Verify localhost:8000 shows file listing

## Performance Checklist

After launching, verify performance:
- [ ] Home page loads in < 2 seconds
- [ ] Store search responds instantly (< 500ms)
- [ ] Adding to cart responds immediately
- [ ] Checkout completes in < 3 seconds
- [ ] Orders page loads quickly
- [ ] No console errors when navigating
- [ ] No console warnings

## Security Checklist

Before going to production:
- [ ] Reset SUPABASE_ANON_KEY (rotate in Supabase Settings)
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Set strong database password
- [ ] Enable CORS for your domain
- [ ] Set environment variables (don't hardcode in code)
- [ ] Use HTTPS in production
- [ ] Enable audit logging in Supabase
- [ ] Set up database backups
- [ ] Review user permissions in database

## Deployment Checklist

Ready to go live? Follow these steps:

### Choose Platform
- [ ] Netlify (easiest, recommended)
- [ ] Vercel
- [ ] Firebase Hosting
- [ ] AWS S3 + CloudFront
- [ ] GitHub Pages
- [ ] Your own server

### Before Deploying
- [ ] All tests pass locally
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificate ready (HTTPS)

### Deploy Steps
- [ ] Read `docs/DEPLOYMENT.md`
- [ ] Follow platform-specific instructions
- [ ] Test live version thoroughly
- [ ] Monitor uptime and errors
- [ ] Setup monitoring & alerts

See `docs/DEPLOYMENT.md` for detailed deployment instructions for each platform.

## Post-Launch Checklist

After going live:
- [ ] Monitor error logs daily
- [ ] Check database for orphaned data
- [ ] Review user feedback
- [ ] Check payment processing
- [ ] Verify email notifications work
- [ ] Monitor storage usage
- [ ] Check database backup schedule
- [ ] Review performance metrics
- [ ] Update feature documentation

## Quick Reference

**URLs to Remember:**
```
Local Development: http://localhost:8000
Supabase Dashboard: https://supabase.com
Supabase Project: https://app.supabase.com
Vercel Deployment: https://vercel.com
Netlify Deployment: https://netlify.com
```

**Key Files to Know:**
```
Configuration: frontend/js/app.js
               (Lines 1-2: Supabase credentials)

Database Schema: backend/SUPABASE_SETUP.sql
                 (Run once in Supabase)

Documentation: docs/QUICK_START.md
               docs/INSTALLATION.md
               docs/API_DOCUMENTATION.md
```

**Common Commands:**
```
Start Server:     python -m http.server 8000
Stop Server:      Press Ctrl+C in terminal
Clear Cache:      Ctrl+Shift+Delete (Chrome)
View Console:     F12 → Console tab
View Code:        Right-click → Inspect
```

## Support Resources

Still need help? Check these files:
- [ ] `QUICK_START.md` - Fast 5-minute setup
- [ ] `INSTALLATION.md` - Detailed step-by-step setup
- [ ] `docs/API_DOCUMENTATION.md` - API endpoint reference
- [ ] `docs/DATABASE.md` - Database schema documentation
- [ ] `FILE_LISTING.md` - Complete file inventory
- [ ] Browser console - Error messages (F12)

## Final Verification

Before marking complete, verify:
- [ ] ✅ Supabase project created
- [ ] ✅ Database schema imported
- [ ] ✅ Frontend configured with credentials
- [ ] ✅ Server running on localhost:8000
- [ ] ✅ Home page loads
- [ ] ✅ Can sign up as customer
- [ ] ✅ Can sign up as store owner
- [ ] ✅ Can browse stores
- [ ] ✅ Can view products
- [ ] ✅ Can add to cart
- [ ] ✅ Can place order
- [ ] ✅ Can view order history

## Success Confirmation

🎉 **If all checkboxes above are checked, your Yourwae platform is ready!**

Next steps:
1. Customize branding (logo, colors, name)
2. Add your stores and products to database
3. Invite store owners to sign up
4. Deploy to production
5. Start accepting customer orders!

---

**Estimated Total Time: 30-45 minutes**

**Need help? Check the documentation folder or review the error in browser console (F12)**
