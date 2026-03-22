import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Store, MapPin, Phone, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    role: 'customer',
    // Seller specific
    storeName: '',
    storeCategory: 'grocery',
    storeDescription: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.role === 'seller' && (!formData.storeName || !formData.storeCategory)) {
      setError('Store Name and Category are required for Sellers.');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
            phone: formData.phone,
            address: formData.address
          }
        }
      });
      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Auth creation failed.");

      const { error: userError } = await supabase.from('users').insert([{
        id: userId,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      }]);
      if (userError) throw userError;

      if (formData.role === 'seller') {
        const { error: storeError } = await supabase.from('stores').insert([{
          owner_id: userId,
          name: formData.storeName,
          category: formData.storeCategory,
          description: formData.storeDescription || `Welcome to ${formData.storeName}`,
          rating: 5.0,
          location: formData.address
        }]);
        if (storeError) throw storeError;
      }

      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '85vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, var(--bg-page) 0%, #e2e8f0 100%)',
      padding: '40px 16px' 
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="premium-card glass-card" 
        style={{ 
          maxWidth: '540px', 
          width: '100%', 
          padding: '40px', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: formData.role === 'seller' ? 'var(--warning)' : 'var(--primary)', transition: 'background 0.3s' }} />
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div 
            key={formData.role}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' }}
            style={{ 
              width: '72px', height: '72px', 
              background: formData.role === 'seller' ? 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', 
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              color: 'white',
              boxShadow: formData.role === 'seller' ? '0 10px 25px rgba(245, 158, 11, 0.3)' : '0 10px 25px rgba(93, 93, 255, 0.3)'
            }}>
            {formData.role === 'seller' ? <Store size={36} /> : <UserPlus size={36} />}
          </motion.div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--secondary)' }}>
            {formData.role === 'seller' ? 'Create a Vendor Account' : 'Join YourWae'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>{formData.role === 'seller' ? 'Start selling your products to thousands of locals' : 'Create your customer account today for seamless shopping'}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="badge badge-danger" style={{ display: 'block', marginBottom: '24px', textAlign: 'center', padding: '12px' }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group" style={{ 
            background: 'var(--bg-light)', 
            padding: '16px', 
            borderRadius: '16px', 
            border: '1px solid var(--border-light)' 
          }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '12px', display: 'block' }}>Account Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'customer'})}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
                  background: formData.role === 'customer' ? 'var(--primary)' : 'transparent',
                  color: formData.role === 'customer' ? 'white' : 'var(--text-secondary)',
                  border: formData.role === 'customer' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                Customer
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'seller'})}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
                  background: formData.role === 'seller' ? 'var(--warning)' : 'transparent',
                  color: formData.role === 'seller' ? 'white' : 'var(--text-secondary)',
                  border: formData.role === 'seller' ? '1px solid var(--warning)' : '1px solid var(--border)'
                }}
              >
                Seller (Vendor)
              </button>
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '12px', textAlign: 'center', fontSize: '12px' }}>*Rider accounts are exclusively created by the Super Admin.</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Full Name</label>
              <input type="text" className="search-input" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} name="full_name" value={formData.full_name} onChange={handleInputChange} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="tel" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="050 000 0000" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} name="password" value={formData.password} onChange={handleInputChange} required minLength="6" placeholder="At least 6 characters" />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Location / Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }} name="address" value={formData.address} onChange={handleInputChange} required placeholder="e.g. 24 Spintex Rd, Accra" />
            </div>
          </div>

          <AnimatePresence>
            {formData.role === 'seller' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.05)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  marginTop: '10px', 
                  border: '1px solid rgba(245, 158, 11, 0.2)' 
                }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                    <Store size={18} /> Store Configuration
                  </h4>
                  
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Store Name</label>
                    <input type="text" className="search-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', fontSize: '14px', background: 'white' }} name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="Your Business Name" required={formData.role === 'seller'} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Primary Category</label>
                    <select className="filter-select" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', fontSize: '14px', background: 'white' }} name="storeCategory" value={formData.storeCategory} onChange={handleInputChange} required={formData.role === 'seller'}>
                      <option value="grocery">Grocery & Supermarket</option>
                      <option value="food">Restaurants & Food</option>
                      <option value="pharmacy">Pharmacy & Health</option>
                      <option value="fashion">Fashion & Apparel</option>
                      <option value="electronics">Electronics & Tech</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Short Description</label>
                    <textarea className="search-input" style={{ width: '100%', padding: '12px', height: '80px', resize: 'vertical', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', fontSize: '14px', background: 'white' }} name="storeDescription" value={formData.storeDescription} onChange={handleInputChange} placeholder="What do you sell?" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading} 
            style={{ 
              marginTop: '16px', 
              background: formData.role === 'seller' ? 'var(--warning)' : 'var(--primary)',
              padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              border: 'none',
              boxShadow: formData.role === 'seller' ? '0 8px 20px rgba(245, 158, 11, 0.3)' : '0 8px 20px rgba(93, 93, 255, 0.3)'
            }}>
            {loading ? 'Processing...' : formData.role === 'seller' ? 'Open Store Account' : 'Create Customer Account'}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
