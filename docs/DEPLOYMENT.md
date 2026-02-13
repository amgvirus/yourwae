# Yourwae - Deployment Guide

## Deployment Options

### 1. Netlify Deployment (Recommended)

**Advantages:**
- Free tier available
- GitHub integration
- Automatic SSL
- Good performance
- Easy to use

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Connect Netlify**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select GitHub and choose repository
   - Build command: `npm install` (if needed) or leave blank
   - Publish directory: `frontend`

3. **Add Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add:
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_ANON_KEY`: Your Supabase key

4. **Deploy**
   - Netlify will automatically deploy on git push

### 2. Vercel Deployment

**Steps:**

1. **Create vercel.json**
   ```json
   {
     "buildCommand": "exit 0",
     "outputDirectory": "frontend"
   }
   ```

2. **Deploy**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add Supabase credentials

### 3. Firebase Hosting

**Steps:**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "frontend",
       "ignore": ["firebase.json", "**/.*"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

### 4. AWS S3 + CloudFront

**Steps:**

1. **Create S3 Bucket**
   - Go to AWS Console
   - Create new S3 bucket
   - Enable static website hosting

2. **Upload Frontend Files**
   ```bash
   aws s3 sync frontend/ s3://your-bucket-name/
   ```

3. **Create CloudFront Distribution**
   - Point to your S3 bucket
   - Configure SSL certificate
   - Set Cache behaviors

4. **Set Custom Domain**
   - Route 53 → Create hosted zone
   - Point to CloudFront distribution

### 5. GitHub Pages

**Steps:**

1. **Create gh-pages branch**
   ```bash
   git checkout -b gh-pages
   git push -u origin gh-pages
   ```

2. **Configure Settings**
   - Go to GitHub Repo → Settings → Pages
   - Source: Select `gh-pages` branch
   - Save

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Supabase Production Setup

### 1. Backup Strategy

```sql
-- Automatic daily backups enabled in Supabase dashboard
-- Manual backup:
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql
```

### 2. Row Level Security (RLS)

Enable for all tables:

```sql
-- For users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- For orders table
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (customer_id = auth.uid());

-- For products table
CREATE POLICY "Products are public"
ON products FOR SELECT
USING (is_active = true);
```

### 3. Performance Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
```

### 4. Database Monitoring

1. Go to Supabase Dashboard
2. Check:
   - Database size
   - Query performance
   - Connection count
   - Error logs

## Frontend Optimization

### 1. Asset Optimization

```css
/* Minify CSS */
/* Use minified versions in production */

/* Optimize images */
- Use WebP format where possible
- Compress images before upload
- Use responsive images (srcset)
```

### 2. Caching Strategy

```javascript
// Add cache control headers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
```

### 3. Content Delivery

- Use CDN for static assets
- Enable gzip compression
- Minify JavaScript and CSS
- Lazy load images

## Environment Configuration

### Development (.env.development)
```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Staging (.env.staging)
```
SUPABASE_URL=https://staging.supabase.co
SUPABASE_ANON_KEY=your-staging-key
```

### Production (.env.production)
```
SUPABASE_URL=https://prod.supabase.co
SUPABASE_ANON_KEY=your-production-key
STRIPE_PUBLIC_KEY=pk_live_xxx
```

## Security Checklist

Before deployment:

- [ ] All dependencies updated
- [ ] No API keys in code
- [ ] HTTPS enabled
- [ ] RLS policies implemented
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Rate limiting enabled
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] SSL certificate valid
- [ ] Security headers set

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## Monitoring & Analytics

### 1. Error Tracking

Use services like:
- Sentry
- LogRocket
- Rollbar

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: "production"
});
```

### 2. Performance Monitoring

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Analytics

- Google Analytics
- Mixpanel
- Amplitude

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## Rollback Procedure

If something goes wrong:

### 1. Quick Rollback
```bash
# For GitHub/Netlify
git revert HEAD
git push origin main

# For other platforms, redeploy previous version
```

### 2. Database Rollback
```bash
# Restore from backup
psql -h db.supabase.co -U postgres -d postgres < backup.sql
```

## Scaling Strategies

### 1. Database Scaling
- Upgrade Supabase plan for more connections
- Implement connection pooling
- Optimize queries

### 2. API Scaling
- Implement caching
- Use CDN for assets
- Optimize images

### 3. Load Balancing
- Use service like Cloudflare
- Implement rate limiting
- Monitor performance

## Upgrade Path

### Version Upgrades

1. **Test in Development**
   - Test all features
   - Check compatibility

2. **Deploy to Staging**
   - Run full test suite
   - Monitor for errors

3. **Deploy to Production**
   - Schedule maintenance window
   - Plan rollback strategy
   - Monitor closely

## Cost Optimization

### Supabase
- Use free tier for development
- Monitor database size
- Optimize queries for fewer operations
- Clean up old data

### Hosting
- Choose appropriate plan
- Monitor bandwidth usage
- Optimize assets
- Use caching

### Stripe
- Monitor transaction volume
- Optimize for lower fees
- Use test keys in development

## Disaster Recovery

### Backup Plan
1. Daily automated backups
2. Weekly full database exports
3. Monthly disaster recovery test

### Recovery Procedures
1. Database recovery
2. Asset recovery
3. Configuration recovery

## Communication Plan

When deploying:
1. Notify users of maintenance window
2. Monitor during deployment
3. Have rollback plan ready
4. Post-deployment verification
5. Communication after deployment

---

**Deployment Checklist:**
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Security verified
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Team notified
