import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { icon: '🧺', label: 'Grocery', key: 'grocery', color: 'rgba(93, 93, 255, 0.1)' },
  { icon: '💊', label: 'Pharmacy', key: 'pharmacy', color: 'rgba(16, 185, 129, 0.1)' },
  { icon: '📱', label: 'Electronics', key: 'electronics', color: 'rgba(245, 158, 11, 0.1)' },
  { icon: '👗', label: 'Fashion', key: 'fashion', color: 'rgba(236, 72, 153, 0.1)' },
  { icon: '🧴', label: 'Beauty', key: 'beauty', color: 'rgba(139, 92, 246, 0.1)' },
  { icon: '🏠', label: 'Home', key: 'home', color: 'rgba(14, 165, 233, 0.1)' },
  { icon: '🍔', label: 'Food', key: 'food', color: 'rgba(239, 68, 68, 0.1)' },
  { icon: '✨', label: 'More', key: 'other', color: 'rgba(100, 116, 139, 0.1)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300 } }
};

const CategoriesPreview = () => {
  return (
    <section className="home-categories" style={{ padding: '20px 0', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>Shop by Category</h2>
        <Link to="/categories" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: '99px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background='rgba(93,93,255,0.2)'} onMouseOut={(e) => e.target.style.background='var(--primary-light)'}>
          See all
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '16px' 
        }}
      >
        {categories.map((cat) => (
          <motion.div key={cat.key} variants={itemVariants}>
            <Link to={`/stores?category=${cat.key}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '20px', 
                background: cat.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '32px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
              >
                {cat.icon}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default CategoriesPreview;
