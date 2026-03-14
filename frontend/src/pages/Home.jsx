import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import CategoriesPreview from '../components/CategoriesPreview';
import StoreCard from '../components/StoreCard';
import { storeAPI } from '../api/api';

const Home = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const data = await storeAPI.getAllStores();
      setStores(Array.isArray(data) ? data.slice(0, 6) : []);
      setLoading(false);
    };
    fetchStores();
  }, []);

  return (
    <div className="home-page container">
      <Hero />
      <CategoriesPreview />
      
      {/* How It Works Section */}
      <section className="how-it-works-premium" style={{ padding: '60px 0', marginBottom: '40px' }}>
        <div className="section-header-premium centered" style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          <span style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Simple Process</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '16px' }}>How YourWae Works</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Get what you need in three easy steps, delivered right to your door.</p>
        </div>

        <div className="how-grid-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {[
            { step: '01', icon: '🏪', title: 'Stores Join Us', desc: 'Local businesses list their best products on our premium platform.', color: 'var(--primary)', bg: 'rgba(93, 93, 255, 0.1)' },
            { step: '02', icon: '🛒', title: 'You Shop & Pay', desc: 'Browse through categories and add items to your secure cart.', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
            { step: '03', icon: '⚡', title: 'Fast Delivery', desc: 'Our riders pick up your order and deliver it in minutes.', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              className="premium-card glass-card"
              style={{ position: 'relative', overflow: 'visible', padding: '40px 24px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ position: 'absolute', top: '-24px', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-white)', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: `2px solid ${item.color}` }}>
                {item.step}
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '20px', transition: 'transform 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: 'var(--secondary)' }}>{item.title}</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="featured-stores" style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>Featured Stores</h2>
          <Link to="/stores" style={{ padding: '8px 16px', background: 'var(--secondary)', color: 'white', borderRadius: '99px', fontSize: '14px', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background='var(--primary)'} onMouseOut={(e) => e.target.style.background='var(--secondary)'}>SEE ALL</Link>
        </div>
        
        {loading ? (
          <div className="loading" style={{ margin: '60px auto' }}></div>
        ) : stores.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}
          >
            {stores.map(store => <StoreCard key={store._id || store.id} store={store} />)}
          </motion.div>
        ) : (
          <div className="premium-card centered" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p>No featured stores available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
