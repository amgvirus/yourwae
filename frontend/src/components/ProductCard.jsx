import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { user, supabase } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert([
          { user_id: user.id, product_id: product._id || product.id, quantity: 1 }
        ]);

      if (error) throw error;
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart');
    }
  };

  return (
    <div className="product-card">
      <img src={product.image || 'https://via.placeholder.com/200'} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span className="price">₵{product.price}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>+ Add</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
