import React, { useState } from 'react';
import { Users, TrendingUp, Map, Briefcase } from 'lucide-react';

const SuperAdmin = () => {
  const { supabase } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalRiders: 0,
    bestTown: 'Accra',
    ordersThisMonth: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      
      setStats(prev => ({
        ...prev,
        totalUsers: userCount || 0,
        ordersThisMonth: orderCount || 0
      }));
    };
    fetchStats();
  }, []);

  return (
    <div className="super-admin container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>Super Admin Dashboard</h2>
        <span className="badge">System Overview</span>
      </header>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="premium-card">
          <Users size={24} color="var(--primary)" />
          <h4 style={{ marginTop: '10px' }}>Total Registered</h4>
          <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.totalUsers + stats.totalSellers + stats.totalRiders}</p>
        </div>
        <div className="premium-card">
          <TrendingUp size={24} color="var(--success)" />
          <h4 style={{ marginTop: '10px' }}>Best Town</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.bestTown}</p>
        </div>
        <div className="premium-card">
          <Map size={24} color="var(--warning)" />
          <h4 style={{ marginTop: '10px' }}>Active Areas</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>12 Regions</p>
        </div>
        <div className="premium-card">
          <Briefcase size={24} color="var(--secondary)" />
          <h4 style={{ marginTop: '10px' }}>Monthly Orders</h4>
          <p style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.ordersThisMonth}</p>
        </div>
      </div>

      <div className="admin-tables" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="premium-card">
          <div className="card-header">
            <h3>Recent Registrations</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 0' }}>Name</th>
                <th>Role</th>
                <th>Town</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 0' }}>John Doe</td>
                <td>Rider</td>
                <td>Accra</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 0' }}>Local Mart</td>
                <td>Seller</td>
                <td>Kumasi</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="premium-card">
          <div className="card-header">
            <h3>Town Performance</h3>
          </div>
          <div className="performance-chart-placeholder" style={{ 
            height: '200px', 
            background: 'var(--bg-light)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'end',
            padding: '20px',
            gap: '20px'
          }}>
            <div style={{ flex: 1, height: '80%', background: 'var(--primary)', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '60%', background: 'var(--primary)', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '40%', background: 'var(--primary)', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '90%', background: 'var(--primary)', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Accra</span>
            <span>Kumasi</span>
            <span>Tamale</span>
            <span>Tema</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
