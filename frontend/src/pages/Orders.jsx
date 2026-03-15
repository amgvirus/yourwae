import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

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

    // Real-time listener for order updates
    if (user) {
      const subscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, payload => {
          setOrders(current => current.map(o => o.id === payload.new.id ? payload.new : o));
        })
        .subscribe();
      return () => { supabase.removeChannel(subscription); };
    }
  }, [user]);

  const getStatusIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'delivering': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const trackingSteps = ['Placed', 'Confirmed', 'Out for Delivery', 'Delivered'];

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
          {orders.map(order => {
            const currentStep = getStatusIndex(order.status);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
                className="premium-card" 
                style={{ marginBottom: '24px', overflow: 'hidden', padding: 0 }}
              >
                {/* Order Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-light)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Order ID</span>
                    <p style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '16px' }}>#{order.id.slice(0, 8)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Amount</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>₵{order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Details & Tracking */}
                <div style={{ padding: '24px' }}>
                  
                  {/* Delivery Location */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '50%' }}>
                      <MapPin size={20} color="var(--danger)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Delivery Destination</p>
                      <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>{order.delivery_address}</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.town}</p>
                    </div>
                  </div>

                  {/* Visual Tracker */}
                  <div style={{ position: 'relative', padding: '20px 0', marginTop: '10px' }}>
                    {/* Background Track */}
                    <div style={{ position: 'absolute', top: '34px', left: '10%', right: '10%', height: '4px', background: 'var(--border-light)', zIndex: 0, borderRadius: '2px' }} />
                    
                    {/* Active Track (Fill) */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / 3) * 80}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ position: 'absolute', top: '34px', left: '10%', height: '4px', background: 'var(--success)', zIndex: 1, borderRadius: '2px' }} 
                    />

                    {/* Tracking Steps Nodes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                      {trackingSteps.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isActive = index === currentStep;
                        
                        return (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0.5 }}
                              animate={{ scale: isActive ? 1.2 : 1, opacity: isCompleted ? 1 : 0.4 }}
                              style={{ 
                                width: '32px', height: '32px', 
                                borderRadius: '50%', 
                                background: isCompleted ? 'var(--success)' : 'var(--bg-white)',
                                border: isCompleted ? 'none' : '3px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', marginBottom: '8px',
                                boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
                                transition: 'all 0.3s'
                              }}
                            >
                              {index === 0 && <Clock size={16} />}
                              {index === 1 && <Package size={16} />}
                              {index === 2 && <Truck size={16} />}
                              {index === 3 && <CheckCircle size={16} />}
                            </motion.div>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: isActive ? '800' : '600', 
                              color: isCompleted ? 'var(--secondary)' : 'var(--text-muted)',
                              textAlign: 'center',
                              lineHeight: 1.2
                            }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
