import React from 'react';
import { Link } from 'react-router-dom';

const StoreCard = ({ store }) => {
  return (
    <div className="store-card-jumia">
      <Link to={`/stores/${store._id || store.id}`}>
        <img src={store.image || 'https://via.placeholder.com/200'} alt={store.name} />
        <div className="store-details">
          <h3>{store.name}</h3>
          <p className="price">{store.category || 'Local Store'}</p>
        </div>
      </Link>
    </div>
  );
};

export default StoreCard;
