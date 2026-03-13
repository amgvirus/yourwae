import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

const Orders = () => {
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={20} color="var(--warning)" />;
      case 'delivering': return <Truck size={20} color="var(--primary)" />;
      case 'delivered': return <CheckCircle size={20} color="var(--success)" />;
      default: return <Package size={20} color="var(--text-muted)" />;
    }
  };

  if (!user) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Please log in to view your orders.</div>;

  return (
    <div className="orders-page container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>My Orders</h2>
        <span className="badge">{orders.length} Total</span>
      </header>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="premium-card centered" style={{ textAlign: 'center', padding: '60px' }}>
          <Package size={64} color="var(--text-muted)" />
          <h3 style={{ marginTop: '20px' }}>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="premium-card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusIcon(order.status)}
                  <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '14px' }}>{order.status}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Order #{order.id.slice(0, 8)}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{order.delivery_address}, {order.town}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>₵{order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
