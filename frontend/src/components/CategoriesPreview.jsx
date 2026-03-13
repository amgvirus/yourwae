import React from 'react';
import { Link } from 'react-router-dom';
import CategoryChip from './CategoryChip';

const categories = [
  { icon: '🧺', label: 'Grocery', key: 'grocery' },
  { icon: '💊', label: 'Pharmacy', key: 'pharmacy' },
  { icon: '📱', label: 'Electronics', key: 'electronics' },
  { icon: '👗', label: 'Fashion', key: 'fashion' },
  { icon: '🧴', label: 'Beauty', key: 'beauty' },
  { icon: '🏠', label: 'Home', key: 'home' },
  { icon: '🍔', label: 'Food', key: 'food' },
  { icon: '✨', label: 'More', key: 'other' },
];

const CategoriesPreview = () => {
  return (
    <section className="home-categories">
      <div className="section-header-premium" style={{ marginBottom: '12px' }}>
        <h2>Shop by Category</h2>
        <Link className="see-all-link" to="/categories">See all</Link>
      </div>

      <div className="category-preview-grid">
        {categories.map((cat) => (
          <CategoryChip 
            key={cat.key}
            icon={cat.icon}
            label={cat.label}
            category={cat.key}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoriesPreview;
