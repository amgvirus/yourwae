import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StoreCard from '../components/StoreCard';
import { storeAPI } from '../api/api';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const category = params.get('cat');
      const search = params.get('search');
      
      let data = [];
      if (category || search) {
        data = await storeAPI.getStoresByFilter({ category, search });
      } else {
        data = await storeAPI.getAllStores();
      }
      setStores(data);
      setLoading(false);
    };
    fetchStores();
  }, [location.search]);

  return (
    <div className="stores-page">
      <header className="section-header-premium">
        <h2>Local Stores</h2>
        <span className="badge">{stores.length} Found</span>
      </header>

      <div className="stores-grid-jumia" style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="loading">Finding stores...</div>
        ) : stores.length > 0 ? (
          stores.map(store => <StoreCard key={store._id || store.id} store={store} />)
        ) : (
          <div className="no-results premium-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>No stores found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;
