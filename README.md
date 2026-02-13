# Yourwae - Hyperlocal E-commerce Platform

A modern, fast, and secure hyperlocal e-commerce platform that connects customers with local stores for quick delivery of essentials.

## 🚀 Features

### Customer Features
- **User Authentication**: Sign up, login, and manage account
- **Browse Stores**: Discover local stores near you with filters by category
- **Product Browsing**: Search and filter products from stores
- **Shopping Cart**: Add/remove products, manage quantities
- **Checkout**: Easy checkout process with delivery address
- **Payment Options**: Multiple payment methods (Card, UPI, Wallet, COD)
- **Real-time Order Tracking**: Track deliveries in real-time
- **Order History**: View past orders and ratings
- **Wallet**: Digital wallet for future purchases

### Store Owner Features
- **Store Registration**: Register your store with full details
- **Product Management**: Add, edit, and manage inventory
- **Order Management**: View and manage customer orders
- **Analytics Dashboard**: Track sales, revenue, and ratings
- **Delivery Configuration**: Set delivery radius and fees
- **Performance Metrics**: Monitor store ratings and reviews

### Delivery System
- **Delivery Partner Tracking**: Real-time location tracking
- **OTP Verification**: Secure delivery verification
- **Automated Fee Calculation**: Distance-based dynamic pricing
- **Delivery History**: Track all deliveries

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Responsive Design)
- **JavaScript (Vanilla)** - Interactivity & Logic
- **Supabase JS Client** - Backend Integration

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication (Supabase Auth)
  - Real-time Subscriptions
  - Storage for Images
  - Row Level Security

### Payment Integration
- **Stripe** - Payment Processing
- **UPI Integration** - India-specific

### Maps & Location
- **Google Maps API** - Distance calculation & location services

## 📦 Project Structure

```
fast-get/
├── frontend/
│   ├── index.html                 # Home page
│   ├── login.html                 # User login
│   ├── signup.html                # User registration
│   ├── stores.html                # Browse stores
│   ├── store-detail.html          # Store & products
│   ├── cart.html                  # Shopping cart
│   ├── checkout.html              # Order checkout
│   ├── orders.html                # Order history
│   ├── css/
│   │   └── styles.css             # Main stylesheet
│   └── js/
│       ├── app.js                 # Core app logic & Supabase integration
│       ├── index.js               # Home page scripts
│       ├── auth.js                # Authentication scripts
│       ├── signup.js              # Signup scripts
│       ├── stores.js              # Stores listing scripts
│       ├── store-detail.js        # Store detail scripts
│       ├── cart.js                # Cart management
│       ├── checkout.js            # Checkout logic
│       └── orders.js              # Orders management
├── backend/
│   ├── SUPABASE_SETUP.sql        # Database schema
│   ├── .env.example               # Environment variables
│   └── package.json               # Dependencies (if needed for tooling)
├── docs/
│   ├── INSTALLATION.md            # Setup instructions
│   ├── API_DOCUMENTATION.md       # API endpoints
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── DATABASE.md                # Database schema details
└── SUPABASE_SCHEMA.md             # Complete database schema

```

## 🚀 Quick Start

### Prerequisites
- Supabase Account (https://supabase.com)
- Google Maps API Key
- Stripe Account (for payments)
- Modern web browser

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fast-get.git
   cd fast-get
   ```

2. **Setup Supabase Project**
   - Create a new project on Supabase
   - Copy your Supabase URL and Anon Key
   - Run the SQL schema from `backend/SUPABASE_SETUP.sql` in Supabase SQL Editor

3. **Configure Frontend**
   - Open `frontend/js/app.js`
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your credentials
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. **Setup Authentication**
   - Go to Supabase Dashboard → Authentication → Settings
   - Configure OAuth providers if needed
   - Set redirect URLs to your application domain

5. **Configure Payment (Optional)**
   - Sign up for Stripe
   - Add Stripe API keys to environment
   - Update payment processing logic in `checkout.js`

6. **Launch Application**
   - Serve frontend files using a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js
   npx http-server

   # Or use VS Code Live Server extension
   ```
   - Open `http://localhost:8000` in your browser

## 🔐 Security Features

- **User Authentication**: Secure password hashing with Supabase Auth
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure API token-based authentication
- **HTTPS Only**: All communications encrypted
- **Input Validation**: Client and server-side validation
- **OTP Verification**: Secure delivery verification
- **PCI Compliance**: Stripe handles secure payment processing

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🗄️ Database Schema

### Key Tables
- **users** - Customer and store owner accounts
- **stores** - Store information and details
- **products** - Product listings
- **orders** - Customer orders
- **payments** - Payment transactions
- **deliveries** - Delivery tracking
- **cart_items** - Shopping cart items
- **addresses** - User delivery addresses
- **wallets** - Digital wallet balances
- **reviews** - Product and store reviews

## 🔗 API Integration

### Supabase Functions
All database operations use Supabase REST API:
- Authentication: Via Supabase Auth
- CRUD Operations: REST endpoints
- Real-time: Supabase Realtime subscription
- File Storage: Supabase Storage

### Third-party APIs
- **Stripe**: Payment processing
- **Google Maps**: Distance calculation
- **SendGrid/Nodemailer**: Email notifications

## 📧 Email Notifications

The system sends automated emails for:
- Account verification
- Order confirmation
- Delivery updates
- Payment receipts
- Order reviews

## 🚚 Delivery System

### How it Works
1. **Calculation**: Distance calculated automatically
2. **Fee**: Base fee + (distance - 1km) × per km rate
3. **Assignment**: Assigned to available delivery partner
4. **Tracking**: Real-time location updates
5. **Verification**: OTP confirmation on delivery
6. **Feedback**: Customer can rate delivery experience

## 💳 Payment Methods

1. **Credit/Debit Card** - Via Stripe
2. **UPI** - Via Stripe or custom integration
3. **Digital Wallet** - Supabase hosted
4. **Cash on Delivery** - Manual verification

## 📊 Admin Dashboard (Future)

- Store verification and approval
- User account management
- Financial reports and analytics
- Customer support dashboard
- System monitoring

## 🧪 Testing

### Manual Testing Checklist
- [ ] User signup and login
- [ ] Store browsing and filtering
- [ ] Product search and viewing
- [ ] Cart management
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order tracking
- [ ] Mobile responsiveness

### Test Credentials
```
Customer:
Email: customer@test.com
Password: test123456

Store Owner:
Email: store@test.com
Password: test123456
```

## 🚀 Deployment

### Supabase Hosting
1. Database and Auth already hosted
2. Enable Row Level Security
3. Set up backup policies

### Frontend Deployment Options
- **Netlify**: GitHub integration, automatic deployment
- **Vercel**: Optimized for static sites
- **Firebase Hosting**: Google's platform
- **GitHub Pages**: Free hosting for static sites

### Environment Variables
```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
STRIPE_PUBLIC_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
```

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Email: support@fastget.com

## 🔗 Live Demo

[Coming Soon]

## 📞 Contact

- **Website**: https://www.fastget.com
- **Email**: support@fastget.com
- **Phone**: +91-XXXX-XXXX-XXXX

## 🎯 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] AI-based recommendations
- [ ] Multi-language support
- [ ] Loyalty program
- [ ] Subscription services
- [ ] Integration with logistics partners

---

Made with ❤️ for hyperlocal commerce
