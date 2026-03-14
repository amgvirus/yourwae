import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Package, ShoppingBag, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const SellerDashboard = () => {
  const { user, supabase } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!user) return;
      
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
        
      if (store) {
        setStoreData(store);
        
        const { data: storeProducts } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id);
        if (storeProducts) setProducts(storeProducts);
        
        // Fetch orders for this store (simplified)
        const { data: storeOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
        if (storeOrders) setOrders(storeOrders);
      }
      setLoading(false);
    };
    
    fetchSellerData();
  }, [user, supabase]);

  if (loading) {
    return <div className="container centered" style={{ minHeight: '60vh' }}><div className="loading" /></div>;
  }

  if (!storeData) {
    return (
      <div className="container centered" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <Store size={64} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
        <h2>You don't have a store yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Set up your store to start selling.</p>
        <button className="btn btn-primary">Create Store</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <header className="section-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2>Seller Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {storeData.store_name}</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--primary)" />
            </div>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Total Revenue</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>₵0.00</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <ShoppingBag size={24} color="var(--success)" />
            </div>
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Total Orders</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{orders.length}</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Package size={24} color="var(--warning)" />
            </div>
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Total Products</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{products.length}</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="premium-card">
          <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--primary)" /> Recent Orders
            </h3>
          </div>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No recent orders found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 10px' }}>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', cursor: 'pointer' }} className="table-row-hover">
                      <td style={{ padding: '15px 10px', fontWeight: '600' }}>#{order.id.substring(0, 8)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '700' }}>₵{order.total_amount?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status || 'pending'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SellerDashboard;
