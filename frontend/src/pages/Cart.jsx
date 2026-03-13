import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { user, supabase } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    
    if (!error) setCartItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const removeFromCart = async (id) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (!error) fetchCart();
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.products?.price * item.quantity), 0).toFixed(2);
  };

  if (!user) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Please log in to view your cart.</div>;

  return (
    <div className="cart-page container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>Your Shopping Cart</h2>
        <span className="badge">{cartItems.length} Items</span>
      </header>

      {loading ? (
        <div className="loading">Loading cart...</div>
      ) : cartItems.length === 0 ? (
        <div className="premium-card centered" style={{ textAlign: 'center', padding: '60px' }}>
          <ShoppingBag size={64} color="var(--text-muted)" />
          <h3 style={{ marginTop: '20px' }}>Your cart is empty</h3>
          <p>Add some products from our local stores!</p>
          <Link to="/stores" className="btn btn-primary" style={{ marginTop: '20px' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-content" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item.id} className="premium-card" style={{ marginBottom: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img 
                  src={item.products?.image || 'https://via.placeholder.com/100'} 
                  alt={item.products?.name} 
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4>{item.products?.name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>₵{item.products?.price} x {item.quantity}</p>
                </div>
                <div style={{ fontWeight: '800' }}>₵{(item.products?.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.id)} className="btn btn-secondary" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary premium-card" style={{ height: 'fit-content' }}>
            <h3>Order Summary</h3>
            <div className="info-divider"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Subtotal</span>
              <span>₵{calculateTotal()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '800', fontSize: '1.2rem' }}>
              <span>Total</span>
              <span>₵{calculateTotal()}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
