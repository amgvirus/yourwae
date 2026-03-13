import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Smartphone, HeartPulse, Shirt, Sparkles, Home as HomeIcon, Utensils, Store } from 'lucide-react';

const categories = [
  { id: 'grocery', name: 'Grocery', icon: <ShoppingBasket size={32} />, sub: 'Supermarkets & daily needs' },
  { id: 'pharmacy', name: 'Pharmacy', icon: <HeartPulse size={32} />, sub: 'Medicines & health items (18+)' },
  { id: 'electronics', name: 'Electronics', icon: <Smartphone size={32} />, sub: 'Phones, gadgets & accessories' },
  { id: 'fashion', name: 'Fashion', icon: <Shirt size={32} />, sub: 'Clothing, shoes & more' },
  { id: 'beauty', name: 'Beauty', icon: <Sparkles size={32} />, sub: 'Skincare & cosmetics' },
  { id: 'home', name: 'Home', icon: <HomeIcon size={32} />, sub: 'Household & essentials' },
  { id: 'food', name: 'Food', icon: <Utensils size={32} />, sub: 'Restaurants & fast food' },
  { id: 'all', name: 'All Stores', icon: <Store size={32} />, sub: 'Browse everything' },
];

const Categories = () => {
  return (
    <div className="categories-page container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>Explore Categories</h2>
        <p style={{ color: 'var(--text-muted)' }}>Choose a category to view available stores.</p>
      </header>

      <div className="category-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginTop: '32px'
      }}>
        {categories.map(cat => (
          <Link 
            key={cat.id} 
            to={cat.id === 'all' ? '/stores' : `/stores?cat=${cat.id}`} 
            className="premium-card category-tile" 
            style={{ 
              textDecoration: 'none', 
              textAlign: 'center', 
              padding: '40px 24px',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{cat.icon}</div>
            <h3 style={{ marginBottom: '8px' }}>{cat.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{cat.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
