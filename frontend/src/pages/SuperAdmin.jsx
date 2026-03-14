import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, TrendingUp, Map, Briefcase, Activity, Store, Bike, PieChart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { createClient } from '@supabase/supabase-js';

// Secondary client for creating users without signing out the admin
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SuperAdmin = () => {
  const { supabase, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalRiders: 0,
    bestTown: 'Accra',
    ordersThisMonth: 0,
    activeRegions: 4,
    revenue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Rider State
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRider, setNewRider] = useState({ name: '', email: '', password: '', phone: '', town: '' });
  const [riderLoading, setRiderLoading] = useState(false);
  const [riderMessage, setRiderMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAdminData = async () => {
      // Add realistic dummy/fetched stats
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { data: stores } = await supabase.from('stores').select('*');
      
      // Fetch operational towns
      const { data: townsData } = await supabase.from('towns').select('*');
      if (townsData) setTowns(townsData);
      else setTowns([{name: 'Hohoe'}, {name: 'Ho'}, {name: 'Kpando'}]); // fallback

      setStats({
        totalUsers: userCount || 24,
        totalSellers: stores?.length || 8,
        totalRiders: 15,
        bestTown: 'Accra',
        ordersThisMonth: orderCount || 102,
        activeRegions: 5,
        revenue: 14500.50
      });

      setRecentUsers([
        { id: 1, name: 'John Doe', role: 'Customer', town: 'Accra', date: '2023-10-25' },
        { id: 2, name: 'Jane Smith', role: 'Seller', town: 'Kumasi', date: '2023-10-24' },
        { id: 3, name: 'Max Rider', role: 'Rider', town: 'Tema', date: '2023-10-23' },
        { id: 4, name: 'Super Mart', role: 'Seller', town: 'Accra', date: '2023-10-22' },
      ]);
      setLoading(false);
    };
    fetchAdminData();
  }, [supabase]);

  const handleAddRider = async (e) => {
    e.preventDefault();
    setRiderLoading(true);
    setRiderMessage({ type: '', text: '' });

    try {
      // 1. Create auth user with secondary client
      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: newRider.email,
        password: newRider.password,
        options: {
          data: {
            full_name: newRider.name,
            role: 'rider', // standardizing lowercase role
            phone: newRider.phone,
            town: newRider.town
          }
        }
      });

      if (authError) throw authError;

      // 2. Add to public users tracking
      if (authData.user) {
        await supabase.from('users').insert([{
           id: authData.user.id,
           email: newRider.email,
           full_name: newRider.name,
           role: 'rider',
           phone: newRider.phone,
           town: newRider.town
        }]);
      }

      setRiderMessage({ type: 'success', text: `Rider ${newRider.name} successfully created!` });
      setNewRider({ name: '', email: '', password: '', phone: '', town: '' });
      
      // Refresh list (optimistic update)
      setRecentUsers(prev => [{ id: Date.now(), name: newRider.name, role: 'Rider', town: newRider.town, date: new Date().toISOString() }, ...prev]);
      setStats(prev => ({...prev, totalRiders: prev.totalRiders + 1}));

    } catch (error) {
      setRiderMessage({ type: 'error', text: error.message || 'Failed to create rider.' });
    } finally {
      setRiderLoading(false);
    }
  };

  if (loading) {
     return <div className="container centered" style={{ minHeight: '60vh' }}><div className="loading" /></div>;
  }

  const chartData = [
    { town: 'Hohoe', value: 80 },
    { town: 'Ho', value: 55 },
    { town: 'Kpando', value: 40 }
  ];

  return (
    <div className="dashboard-layout container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      <header className="section-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Shield color="var(--primary)" /> Super Admin</h2>
          <p style={{ color: 'var(--text-secondary)' }}>System Overview & Analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddRider(!showAddRider)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Bike size={18} /> {showAddRider ? 'Close Form' : 'Add New Rider'}
          </button>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
            <Activity size={16} style={{ display: 'inline', marginRight: '6px' }}/> 
            Live Mode
          </span>
        </div>
      </header>

      {/* Add Rider Form Section */}
      {showAddRider && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '30px' }}>
          <div className="premium-card glass-card" style={{ padding: '24px', border: '1px solid var(--primary-light)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
              <Bike size={20} /> Register Official Rider
            </h3>
            
            {riderMessage.text && (
              <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: riderMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: riderMessage.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                {riderMessage.text}
              </div>
            )}

            <form onSubmit={handleAddRider} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <input type="text" className="form-control" placeholder="Full Name" required value={newRider.name} onChange={(e) => setNewRider({...newRider, name: e.target.value})} />
              <input type="email" className="form-control" placeholder="Email Address" required value={newRider.email} onChange={(e) => setNewRider({...newRider, email: e.target.value})} />
              <input type="password" className="form-control" placeholder="Temporary Password" required value={newRider.password} onChange={(e) => setNewRider({...newRider, password: e.target.value})} />
              <input type="tel" className="form-control" placeholder="Phone Number" required value={newRider.phone} onChange={(e) => setNewRider({...newRider, phone: e.target.value})} />
              <select className="form-control" required value={newRider.town} onChange={(e) => setNewRider({...newRider, town: e.target.value})}>
                <option value="">Select Operational Town</option>
                {towns.map((town, idx) => (
                  <option key={idx} value={town.name}>{town.name}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" disabled={riderLoading} style={{ gridColumn: '1 / -1' }}>
                {riderLoading ? 'Registering...' : 'Create Rider Account'}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Top Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { icon: <Users size={24} color="var(--primary)" />, title: 'Total Customers', val: stats.totalUsers, bg: 'var(--primary-light)', delay: 0 },
          { icon: <Store size={24} color="var(--success)" />, title: 'Total Sellers', val: stats.totalSellers, bg: 'rgba(16, 185, 129, 0.1)', delay: 0.1 },
          { icon: <Bike size={24} color="var(--warning)" />, title: 'Total Riders', val: stats.totalRiders, bg: 'rgba(245, 158, 11, 0.1)', delay: 0.2 },
          { icon: <Briefcase size={24} color="var(--secondary)" />, title: 'Monthly Orders', val: stats.ordersThisMonth, bg: 'var(--border-light)', delay: 0.3 }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: stat.delay }} 
            className="premium-card glass-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ background: stat.bg, padding: '12px', borderRadius: '12px' }}>
                {stat.icon}
              </div>
            </div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>{stat.title}</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="admin-tables" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
        {/* Recent Registrations Table */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="premium-card glass-card">
          <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" /> Recent Registrations
            </h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View All</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 10px' }}>Name</th>
                  <th>Role</th>
                  <th>Town</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', cursor: 'pointer' }} className="table-row-hover">
                    <td style={{ padding: '15px 10px', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge`} style={{ 
                        background: user.role.toLowerCase() === 'seller' ? 'rgba(16, 185, 129, 0.1)' : user.role.toLowerCase() === 'rider' ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-light)',
                        color: user.role.toLowerCase() === 'seller' ? 'var(--success)' : user.role.toLowerCase() === 'rider' ? 'var(--warning)' : 'var(--primary)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.town}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Town Performance Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="premium-card glass-card">
          <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--success)" /> Town Performance
            </h3>
            <span className="badge bg-light">This Month</span>
          </div>

          <div className="performance-chart-container" style={{ 
            height: '240px', 
            background: 'var(--bg-light)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '24px',
            gap: '15px',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}>
            {chartData.map((data, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{data.value}%</span>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.value}%` }}
                  transition={{ delay: 0.6 + (idx * 0.1), duration: 0.8, type: 'spring' }}
                  style={{ 
                    width: '100%', 
                    background: idx === 3 ? 'var(--primary)' : 'var(--primary-light)', 
                    borderRadius: '6px 6px 0 0',
                    boxShadow: idx === 3 ? '0 4px 12px rgba(93, 93, 255, 0.3)' : 'none'
                  }} 
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '0 10px' }}>
            {chartData.map((data, idx) => (
              <span key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {data.town}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdmin;
