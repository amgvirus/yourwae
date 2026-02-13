# Installation Guide for Yourwae

## Prerequisites

Before you begin, ensure you have the following:

1. **Supabase Account**
   - Go to https://supabase.com
   - Sign up for a free account
   - Create a new project

2. **Google Maps API Key** (Optional but recommended)
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Maps JavaScript API
   - Create an API key

3. **Stripe Account** (Optional for payments)
   - Go to https://stripe.com
   - Sign up for a Stripe account
   - Get your API keys

4. **Text Editor or IDE**
   - VS Code (recommended)
   - Sublime Text
   - Any modern code editor

5. **Local Server** (for development)
   - Python 3.x installed
   - Or Node.js with `http-server`
   - Or VS Code Live Server extension

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to https://supabase.com and log in
2. Click "New Project"
3. Fill in project details:
   - Project Name: `fast-get`
   - Database Password: Create a strong password
   - Region: Choose closest to your location
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

### 2. Get Supabase Credentials

1. Once project is created, go to Project Settings
2. Find "API" section on the left sidebar
3. Copy:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public key**: This is your `SUPABASE_ANON_KEY`
4. Save these values securely

### 3. Create Database Tables

1. Go to SQL Editor in Supabase
2. Click "New Query"
3. Copy the entire SQL from `backend/SUPABASE_SETUP.sql`
4. Paste it in the SQL editor
5. Click "Run"
6. Wait for all tables to be created
7. You should see success messages

### 4. Setting Up Row Level Security (RLS)

For security, enable RLS policies:

```sql
-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS for stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Enable RLS for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- And so on for other tables
```

Basic policies can be configured in Supabase dashboard.

### 5. Setup Authentication

1. Go to Authentication → Policies in Supabase
2. Click "Enable email authentication"
3. Configure email templates (optional)
4. Go to Authentication → URL Configuration
5. Add your application URL:
   - Development: `http://localhost:8000`
   - Production: `https://yourdomain.com`

### 6. Update Frontend Configuration

1. Open `frontend/js/app.js`
2. Find these lines at the top:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Replace with your actual credentials from Step 2

### 7. Configure Google Maps (Optional)

1. Open `frontend/js/store-detail.js`
2. Look for distance calculation functions
3. Add your Google Maps API key when needed:
   ```javascript
   // Add to app.js or separate file
   const GOOGLE_MAPS_API_KEY = 'your-key-here';
   ```

### 8. Setup Local Development Server

**Option A: Using Python**
```bash
cd "c:\Users\USER\Music\fast get\frontend"
python -m http.server 8000
```

**Option B: Using Node.js**
```bash
cd "c:\Users\USER\Music\fast get\frontend"
npm install -g http-server
http-server -p 8000
```

**Option C: Using VS Code**
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Click "Open with Live Server"

### 9. Access the Application

1. Open your browser
2. Go to `http://localhost:8000`
3. You should see the Yourwae homepage

### 10. Test Basic Functionality

1. Click "Sign Up"
2. Create a test customer account:
   - Email: test@example.com
   - Password: test123456
   - Phone: 9999999999
   - Role: Customer
3. Go back and login
4. You should see the dashboard

## Configuration Files

### Environment Variables

Create a `.env` file in the frontend directory (optional):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
STRIPE_PUBLIC_KEY=pk_test_xxx
GOOGLE_MAPS_API_KEY=your-key
```

Load these in your app if using a build tool.

## Supabase Database Configuration

### Create Storage Buckets

For storing product and store images:

1. Go to Storage in Supabase
2. Click "Create a new bucket"
3. Create buckets:
   - `store-images` - For store logos/banners
   - `product-images` - For product photos
4. Set these as public buckets for easy access

### Storage Policies

```sql
-- Allow public read
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated insert
CREATE POLICY "Authenticated can upload products"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Testing the Platform

### Test User Accounts

**Customer Account:**
- Email: customer@test.com
- Password: Password123!
- Role: Customer

**Store Owner Account:**
- Email: storeowner@test.com
- Password: Password123!
- Role: Store

### Test Data

You can manually insert test data, or run:

```sql
-- Insert test store owner user
INSERT INTO users (email, phone, first_name, last_name, role)
VALUES ('storeowner@test.com', '9876543210', 'John', 'Doe', 'store');

-- Insert test store
INSERT INTO stores (owner_id, store_name, category, address, ...)
VALUES (...);

-- Add test products
INSERT INTO products (store_id, name, price, stock, ...)
VALUES (...);
```

## Common Issues & Solutions

### Issue: "Cannot find Supabase client"
**Solution**: Make sure the Supabase JS library script is loaded:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0"></script>
```

### Issue: 401 Unauthorized errors
**Solution**: 
- Check your SUPABASE_ANON_KEY
- Verify RLS policies are not blocking access
- Check browser console for token issues

### Issue: CORS errors
**Solution**:
1. Go to Supabase project → Settings → API
2. Scroll to "CORS settings"
3. Add your development URL (e.g., `http://localhost:8000`)

### Issue: Images not loading
**Solution**:
- Verify storage buckets are public
- Check image paths in database
- Make sure signed URLs haven't expired

## Next Steps

1. **Customize Branding**
   - Update logo in navbar
   - Change colors in `styles.css`
   - Update footer information

2. **Add Real Data**
   - Add real stores and products
   - Upload product images
   - Configure delivery settings

3. **Setup Payments**
   - Get Stripe API keys
   - Integrate Stripe library
   - Test payment flow

4. **Deploy to Production**
   - Choose hosting platform (Netlify, Vercel, etc.)
   - Set production Supabase credentials
   - Configure domain/SSL

5. **Monitoring & Maintenance**
   - Set up email logging
   - Monitor Supabase usage
   - Regular backups
   - Security audits

## Getting Help

1. Check Supabase documentation: https://supabase.com/docs
2. Visit GitHub Issues in the repository
3. Check browser console for errors (F12)
4. Look at Supabase logs for database errors

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/HTTPS
- [ ] Set up RLS policies
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable Supabase backups
- [ ] Implement rate limiting
- [ ] Set up audit logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Performance Optimization

1. **Database**: Add indexes for frequently queried columns
2. **Images**: Compress product images before upload
3. **Caching**: Implement browser caching for static assets
4. **CDN**: Use CDN for image delivery
5. **Lazy Loading**: Implement lazy loading for product images

---

**Congratulations!** Your Yourwae platform is now set up and ready to use. 🎉
