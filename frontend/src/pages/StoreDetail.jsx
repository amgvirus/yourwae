import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { storeAPI } from '../api/api';

const StoreDetail = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      const storeData = await storeAPI.getStoreById(id);
      const productData = await storeAPI.getProductsByStore(id);
      setStore(storeData);
      setProducts(productData);
      setLoading(false);
    };
    fetchStoreData();
  }, [id]);

  if (loading) return <div className="loading">Loading store details...</div>;
  if (!store) return <div className="container">Store not found</div>;

  return (
    <div className="store-detail-page">
      <header className="store-detail-header" style={{ marginBottom: '32px' }}>
        <div className="premium-card store-detail-header-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <img 
            src={store.image || 'https://via.placeholder.com/150'} 
            alt={store.name} 
            style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <h1>{store.name}</h1>
            <p className="badge" style={{ display: 'inline-block', marginBottom: '8px' }}>{store.category}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{store.description}</p>
          </div>
        </div>
      </header>

      <section className="products-section">
        <h2 style={{ marginBottom: '20px' }}>Our Products</h2>
        <div className="products-grid products-grid-premium" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '24px' 
        }}>
          {products.length > 0 ? (
            products.map(product => <ProductCard key={product._id || product.id} product={product} />)
          ) : (
            <p>No products available for this store yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoreDetail;
