import React, { useEffect, useState } from 'react';
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
      setStores(data.slice(0, 6)); // Show first 6 stores
      setLoading(false);
    };
    fetchStores();
  }, []);

  return (
    <div className="home-page">
      <Hero />
      <CategoriesPreview />
      
      {/* How It Works Section */}
      <section className="how-it-works-premium">
        <div className="section-header-premium centered">
          <span className="section-badge">Simple Process</span>
          <h2>How YourWae Works</h2>
          <p>Get what you need in three easy steps</p>
        </div>

        <div className="how-grid-premium">
          <div className="how-card">
            <div className="step-indicator">01</div>
            <div className="how-icon-wrapper blue"><span>🏪</span></div>
            <h4>Stores Join Us</h4>
            <p>Local businesses list their best products on our premium platform.</p>
          </div>
          <div className="how-card">
            <div className="step-indicator">02</div>
            <div className="how-icon-wrapper orange"><span>🛒</span></div>
            <h4>You Shop & Pay</h4>
            <p>Browse through categories and add items to your secure cart.</p>
          </div>
          <div className="how-card">
            <div className="step-indicator">03</div>
            <div className="how-icon-wrapper green"><span>⚡</span></div>
            <h4>Fast Delivery</h4>
            <p>Our riders pick up your order and deliver it to your doorstep in minutes.</p>
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="featured-stores" style={{ marginTop: '32px' }}>
        <div className="section-header-jumia" style={{ padding: '16px', borderRadius: '8px 8px 0 0' }}>
          <h2>Featured Stores</h2>
          <Link className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }} to="/stores">SEE ALL</Link>
        </div>
        <div className="stores-grid-jumia" style={{ padding: '20px' }}>
          {loading ? (
            <div className="loading">Finding stores...</div>
          ) : stores.length > 0 ? (
            stores.map(store => <StoreCard key={store._id || store.id} store={store} />)
          ) : (
            <p>No featured stores available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
