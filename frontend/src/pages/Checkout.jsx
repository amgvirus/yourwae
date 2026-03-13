import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { townAPI } from '../api/api';

const Checkout = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [towns, setTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const [cartRes, townRes] = await Promise.all([
        supabase.from('cart_items').select('*, products(*)').eq('user_id', user.id),
        townAPI.getAllTowns()
      ]);

      setCartItems(cartRes.data || []);
      setTowns(townRes || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleTownChange = (e) => {
    const townName = e.target.value;
    setSelectedTown(townName);
    const town = towns.find(t => t.name.toLowerCase() === townName.toLowerCase());
    setDeliveryFee(town ? town.delivery_fee : 7.00);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.products?.price * item.quantity), 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedTown || !address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: calculateSubtotal() + deliveryFee,
          delivery_address: address,
          town: selectedTown,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to place order');
    }
  };

  if (loading) return <div className="loading">Preparing checkout...</div>;

  return (
    <div className="checkout-page container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>Checkout</h2>
      </header>

      <form className="checkout-content" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }} onSubmit={handlePlaceOrder}>
        <div className="delivery-info">
          <div className="premium-card">
            <h3>Delivery Details</h3>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Town / City</label>
              <select className="filter-select" value={selectedTown} onChange={handleTownChange} required style={{ width: '100%' }}>
                <option value="">Select your location</option>
                {towns.map(town => (
                  <option key={town.id || town.name} value={town.name}>{town.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Detailed Address</label>
              <textarea 
                className="search-input" 
                placeholder="House Number, Street Name, Landmarks..." 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ width: '100%', height: '100px', padding: '12px' }}
              />
            </div>
          </div>
        </div>

        <div className="order-summary premium-card" style={{ height: 'fit-content' }}>
          <h3>Order Summary</h3>
          <div className="info-divider"></div>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>{item.products?.name} x {item.quantity}</span>
              <span>₵{(item.products?.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="info-divider"></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>Subtotal</span>
            <span>₵{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>Delivery Fee</span>
            <span>₵{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: '800', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>₵{(calculateSubtotal() + deliveryFee).toFixed(2)}</span>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '24px' }}>Place Order</button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
