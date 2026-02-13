# Yourwae - Setup & Configuration Guide

## Overview
Yourwae is a hyperlocal e-commerce platform operating within three towns: **Hohoe**, **Dzodze**, and **Anloga**. This guide will help you set up the entire system.

## Project Structure
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML/CSS/JavaScript
- **Database**: MongoDB (local or cloud)

## Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas cloud)
- npm or yarn package manager

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the backend directory (copy from `env.config`):
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yourwae
JWT_SECRET=your_secret_key_here
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection in .env
```

### 4. Seed Initial Data (Towns)
```bash
npm run seed
```

This will create the three towns:
- Hohoe
- Dzodze
- Anloga

### 5. Start Backend Server
```bash
npm run dev  # Development mode with nodemon
# OR
npm start    # Production mode
```

Backend will run on: `http://localhost:5000`

## Frontend Setup

### 1. Start Local Server
```bash
cd frontend
npx http-server -p 8000
```

Frontend will run on: `http://localhost:8000`

### 2. Features Included
- **Home Page** (`index.html`): Browse featured stores by town
- **Stores Page** (`stores.html`): Browse and filter stores by town and category
- **Town Selector**: Available in navigation bar on all pages
- **Search**: Search stores and products

## API Endpoints

### Towns API
- `GET /api/towns` - Get all active towns
- `GET /api/towns/:id` - Get specific town
- `POST /api/towns` - Create town (admin)
- `PUT /api/towns/:id` - Update town (admin)
- `DELETE /api/towns/:id` - Delete town (admin)

### Stores API
- `GET /api/stores` - Get all stores (with filters)
- `GET /api/stores/:id` - Get specific store
- `GET /api/stores/town/:townId` - Get stores by town
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Query Parameters for Stores
- `town` - Filter by town ID
- `category` - Filter by category (grocery, electronics, pharmacy, fashion, beauty, home, food, other)

### Example API Calls
```bash
# Get all stores
curl http://localhost:5000/api/stores

# Get stores by town (Hohoe)
curl http://localhost:5000/api/stores?town=hohoe

# Get stores by category
curl http://localhost:5000/api/stores?category=grocery

# Get all towns
curl http://localhost:5000/api/towns
```

## Database Schema

### Towns Table
```
{
  _id: ObjectId,
  name: String (Hohoe, Dzodze, Anloga),
  description: String,
  latitude: Number,
  longitude: Number,
  deliveryFee: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Stores Table
```
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  town: ObjectId (ref: Town),
  storeName: String,
  storeDescription: String,
  category: String,
  address: Object,
  phone: String,
  email: String,
  operatingHours: Object,
  baseDeliveryFee: Number,
  deliveryFeePerKm: Number,
  minimumOrderValue: Number,
  rating: Number,
  totalReviews: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Usage

### Town Selection
1. Open any page (index.html or stores.html)
2. Select a town from the dropdown in the navigation bar
3. The page will automatically filter stores to that town
4. Selection is saved in localStorage and persists across page loads

### Store Filtering
- **Search**: Type store name in search box
- **Category**: Select category from dropdown
- **Town**: Select town from navigation dropdown

## Testing the Application

### Test Flow
1. Start backend: `npm run dev` (from backend folder)
2. Start frontend: `npx http-server -p 8000` (from frontend folder)
3. Open browser: `http://localhost:8000`
4. Select a town from the dropdown
5. Browse stores specific to that town
6. Click on a store to view details

## Next Steps

### To Extend the System
1. **Add Authentication**: Implement user signup/login
2. **Products**: Add product listing per store
3. **Cart & Checkout**: Implement shopping cart and payment
4. **Orders**: Add order management system
5. **Delivery Tracking**: Implement real-time delivery tracking
6. **Admin Dashboard**: Create store and super admin interfaces

## Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Ensure MongoDB is running or connection string is correct
- **Port 5000 in use**: Change PORT in .env or kill existing process
- **Module not found**: Run `npm install` to install dependencies

### Frontend Issues
- **Cannot connect to API**: Ensure backend is running on port 5000
- **CORS error**: Check backend CORS configuration
- **Blank store listings**: Check browser console for API errors

## Support
For issues or questions, check the logs in browser console (F12) and backend terminal for detailed error messages.

---
**Last Updated**: February 13, 2026
