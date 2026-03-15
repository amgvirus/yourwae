import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Store, MapPin, Phone } from 'lucide-react';
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
      // 1. Create Auth User
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

      // 2. Insert into public.users table for tracking
      const { error: userError } = await supabase.from('users').insert([{
        id: userId,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      }]);
      if (userError) throw userError;

      // 3. If Seller, insert into public.stores table
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
    <div className="auth-page container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 16px' }}>
      <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Dynamic header styling based on role */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: formData.role === 'seller' ? 'var(--warning)' : 'var(--primary)' }} />
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: formData.role === 'seller' ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-light)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            color: formData.role === 'seller' ? 'var(--warning)' : 'var(--primary)'
          }}>
            {formData.role === 'seller' ? <Store size={32} /> : <UserPlus size={32} />}
          </div>
          <h2>{formData.role === 'seller' ? 'Become a Vendor' : 'Join YourWae'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{formData.role === 'seller' ? 'Start selling your products locally' : 'Create your customer account today'}</p>
        </div>

        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '20px', textAlign: 'center', whiteSpace: 'normal' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group">
            <label>Registration Type</label>
            <select className="filter-select" style={{ width: '100%', padding: '12px' }} name="role" value={formData.role} onChange={handleInputChange}>
              <option value="customer">Customer (Buy Products)</option>
              <option value="seller">Seller (Open a Store)</option>
            </select>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>*Rider accounts are exclusively created by the Super Admin.</small>
          </div>

          <div className="info-divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="search-input" style={{ width: '100%', padding: '12px' }} name="full_name" value={formData.full_name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input type="tel" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px' }} name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="050 000 0000" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="search-input" style={{ width: '100%', padding: '12px' }} name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="search-input" style={{ width: '100%', padding: '12px' }} name="password" value={formData.password} onChange={handleInputChange} required minLength="6" />
          </div>

          <div className="form-group">
            <label>Postal Address / Delivery Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input type="text" className="search-input" style={{ width: '100%', padding: '12px 12px 12px 36px' }} name="address" value={formData.address} onChange={handleInputChange} required placeholder="e.g. 24 Spintex Rd, Accra" />
            </div>
            <small style={{ color: 'var(--text-muted)' }}>Crucial for accurate delivery routing.</small>
          </div>

          {/* Jumia-Style Premium Vendor Section */}
          <AnimatePresence>
            {formData.role === 'seller' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -10 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ background: 'var(--bg-page)', padding: '20px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={18} /> Store Details</h4>
                  
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Store Name</label>
                    <input type="text" className="search-input" style={{ width: '100%', padding: '12px' }} name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="Your Business Name" required={formData.role === 'seller'} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Primary Category</label>
                    <select className="filter-select" style={{ width: '100%', padding: '12px' }} name="storeCategory" value={formData.storeCategory} onChange={handleInputChange} required={formData.role === 'seller'}>
                      <option value="grocery">Grocery & Supermarket</option>
                      <option value="food">Restaurants & Food</option>
                      <option value="pharmacy">Pharmacy & Health</option>
                      <option value="fashion">Fashion & Apparel</option>
                      <option value="electronics">Electronics & Tech</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Short Description (Optional)</label>
                    <textarea className="search-input" style={{ width: '100%', padding: '12px', height: '80px', resize: 'vertical' }} name="storeDescription" value={formData.storeDescription} onChange={handleInputChange} placeholder="What do you sell?" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '16px', background: formData.role === 'seller' ? 'var(--warning)' : 'var(--primary)' }}>
            {loading ? 'Processing...' : formData.role === 'seller' ? 'Open Store Account' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
