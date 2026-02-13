# Yourwae API Documentation

## Overview

Yourwae uses Supabase as the backend, which provides:
- REST API for CRUD operations
- Real-time subscriptions
- Authentication via JWT
- File storage
- PostgreSQL database

## Authentication

### Sign Up
```javascript
const result = await window.fastGetApp.signup(
  email,
  password,
  firstName,
  lastName,
  phone,
  role // 'customer' or 'store'
);
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Login
```javascript
const result = await window.fastGetApp.login(email, password);
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Logout
```javascript
const result = await window.fastGetApp.logout();
```

## Store Endpoints

### Get All Stores
```javascript
const result = await window.fastGetApp.getStores(limit, offset);
```

**Parameters:**
- `limit`: Number of stores to return (default: 20)
- `offset`: Number of stores to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "store_name": "ABC Store",
      "category": "grocery",
      "rating": 4.5,
      "total_reviews": 120,
      "base_delivery_fee": 50,
      "delivery_radius": 5
    }
  ]
}
```

### Get Store by ID
```javascript
const result = await window.fastGetApp.getStoreById(storeId);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "store_name": "ABC Store",
    "store_description": "Fresh groceries",
    "category": "grocery",
    "address": {
      "street": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "operating_hours": {...},
    "base_delivery_fee": 50,
    "delivery_fee_per_km": 2
  }
}
```

## Product Endpoints

### Get Products by Store
```javascript
const result = await window.fastGetApp.getProductsByStore(storeId, limit);
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "name": "Organic Tomatoes",
      "price": 50,
      "original_price": 60,
      "discount": 16.67,
      "stock": 100,
      "rating": 4.8,
      "images": ["url1", "url2"],
      "category": "vegetables"
    }
  ]
}
```

### Search Products
```javascript
const result = await window.fastGetApp.searchProducts(query);
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Organic Tomatoes",
      "price": 50,
      "store_id": "uuid"
    }
  ]
}
```

## Cart Endpoints

### Add to Cart
```javascript
const result = await window.fastGetApp.addToCart(productId, quantity);
```

**Parameters:**
- `productId`: UUID of the product
- `quantity`: Number of items to add

**Response:**
```json
{
  "success": true
}
```

### Get Cart Items
```javascript
const result = await window.fastGetApp.getCartItems();
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "products": {
        "id": "uuid",
        "name": "Organic Tomatoes",
        "price": 50,
        "images": ["url"]
      }
    }
  ]
}
```

### Remove from Cart
```javascript
const result = await window.fastGetApp.removeFromCart(cartItemId);
```

### Clear Cart
```javascript
const result = await window.fastGetApp.clearCart();
```

## Order Endpoints

### Create Order
```javascript
const result = await window.fastGetApp.createOrder(
  storeId,
  deliveryAddress,
  paymentMethod,
  specialInstructions
);
```

**Request:**
```json
{
  "storeId": "uuid",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "paymentMethod": "card",
  "specialInstructions": "Ring doorbell twice"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "FG-1234567890-1",
    "customer_id": "uuid",
    "store_id": "uuid",
    "items": [...],
    "subtotal": 500,
    "tax": 50,
    "delivery_fee": 50,
    "total_amount": 600,
    "status": "pending",
    "payment_status": "pending"
  }
}
```

### Get User Orders
```javascript
const result = await window.fastGetApp.getUserOrders();
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "FG-123",
      "status": "delivered",
      "total_amount": 600,
      "created_at": "2024-02-11T10:00:00Z",
      "stores": {
        "store_name": "ABC Store"
      },
      "deliveries": [
        {
          "status": "delivered",
          "estimated_delivery_time": "2024-02-11T10:30:00Z"
        }
      ]
    }
  ]
}
```

## Payment Endpoints

### Process Payment
```javascript
const result = await window.fastGetApp.processPayment(
  orderId,
  amount,
  paymentMethodId
);
```

**Request:**
```json
{
  "orderId": "uuid",
  "amount": 600,
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "order_id": "uuid",
    "amount": 600,
    "status": "completed",
    "transaction_id": "TXN-123456"
  }
}
```

## Delivery Endpoints

### Get Delivery Tracking
```javascript
const result = await window.fastGetApp.getDeliveryTracking(orderId);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_id": "uuid",
    "delivery_partner_id": "uuid",
    "status": "in_transit",
    "estimated_delivery_time": "2024-02-11T11:00:00Z",
    "tracking_updates": [
      {
        "status": "picked_up",
        "timestamp": "2024-02-11T10:15:00Z",
        "location": {
          "latitude": 12.9716,
          "longitude": 77.5946
        }
      }
    ]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Error | Status | Description |
|-------|--------|-------------|
| Unauthorized | 401 | User not authenticated |
| Forbidden | 403 | User doesn't have permission |
| Not Found | 404 | Resource doesn't exist |
| Bad Request | 400 | Invalid request data |
| Conflict | 409 | Resource already exists |
| Server Error | 500 | Internal server error |

## Database Tables

### users
```sql
{
  id: UUID,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  role: 'customer' | 'store' | 'admin',
  avatar_url: string,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### stores
```sql
{
  id: UUID,
  owner_id: UUID (FK users.id),
  store_name: string,
  category: string,
  address: JSONB,
  phone: string,
  email: string,
  rating: decimal,
  total_reviews: integer,
  delivery_radius: decimal,
  base_delivery_fee: decimal,
  delivery_fee_per_km: decimal,
  is_verified: boolean,
  is_active: boolean,
  created_at: timestamp
}
```

### products
```sql
{
  id: UUID,
  store_id: UUID (FK stores.id),
  name: string,
  price: decimal,
  stock: integer,
  images: text[],
  category: string,
  rating: decimal,
  total_reviews: integer,
  is_active: boolean,
  created_at: timestamp
}
```

### orders
```sql
{
  id: UUID,
  order_number: string,
  customer_id: UUID (FK users.id),
  store_id: UUID (FK stores.id),
  items: JSONB,
  subtotal: decimal,
  tax: decimal,
  delivery_fee: decimal,
  total_amount: decimal,
  status: string,
  payment_status: string,
  created_at: timestamp
}
```

## Rate Limiting

Current rate limits:
- 100 requests per minute per user
- 1000 requests per hour per user

## Pagination

All list endpoints support pagination:

```javascript
// Get first 20 items
getStores(20, 0);

// Get next 20 items
getStores(20, 20);

// Get next 20 items
getStores(20, 40);
```

## Best Practices

1. **Error Handling**: Always check `success` field before accessing `data`
2. **Caching**: Cache store and product data to reduce API calls
3. **Validation**: Validate input data before sending to API
4. **Authentication**: Store JWT token securely in localStorage
5. **Updates**: Check for updates using timestamps

## API Versioning

Current API Version: 1.0.0

All endpoints are stable and backward compatible.

## Support

For API issues:
1. Check browser console for errors
2. Verify Supabase project is running
3. Check network tab in DevTools
4. Review Supabase logs in dashboard
