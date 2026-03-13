import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Shield, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, role, logout, supabase } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (!user) return <div className="container" style={{padding: '40px', textAlign: 'center'}}>Please log in to view your profile.</div>;

  return (
    <div className="profile-page container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>My Account</h2>
      </header>

      <div className="profile-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div className="profile-sidebar">
          <div className="premium-card" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '100px', height: '100px', background: 'var(--bg-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid var(--primary)' }}>
              <User size={48} color="var(--primary)" />
            </div>
            <h3 style={{ textTransform: 'capitalize' }}>{profile?.first_name} {profile?.last_name}</h3>
            <p className="badge" style={{ marginTop: '8px' }}>{role}</p>
            <button onClick={logout} className="btn btn-secondary btn-full" style={{ marginTop: '24px', color: 'var(--danger)' }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="profile-main">
          <div className="premium-card">
            <h3>Personal Information</h3>
            <div className="info-divider"></div>
            
            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="p-info-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <Mail size={16} /> <span>Email</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>{user.email}</div>
              </div>
              
              <div className="p-info-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <Phone size={16} /> <span>Phone</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>{profile?.phone || 'Not set'}</div>
              </div>

              <div className="p-info-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <Calendar size={16} /> <span>Joined</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>{new Date(user.created_at).toLocaleDateString()}</div>
              </div>

              <div className="p-info-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <Shield size={16} /> <span>Account Status</span>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>Verified</div>
              </div>
            </div>

            <button className="btn btn-outline" style={{ marginTop: '32px' }}>Edit Profile</button>
          </div>

          <div className="premium-card" style={{ marginTop: '24px' }}>
            <h3>Settings</h3>
            <div className="info-divider"></div>
            <p style={{ color: 'var(--text-muted)' }}>Notification preferences and security settings coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
