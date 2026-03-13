import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Package, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stores?search=${searchQuery}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button 
          className="hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="navbar-logo">
          <Link to="/">
            <strong>Your<span className="brand-wae">Wae</span></strong>
          </Link>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search products, brands and categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" type="submit">SEARCH</button>
        </form>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          
          {role === 'rider' && (
            <Link to="/rider" className="nav-link" style={{color: 'var(--primary)', fontWeight: 'bold'}}>
              <Package size={16} /> Rider
            </Link>
          )}
          
          {role === 'admin' && (
            <Link to="/admin" className="nav-link" style={{color: 'var(--success)', fontWeight: 'bold'}}>
              <Shield size={16} /> Admin
            </Link>
          )}

          <Link to="/orders" className="nav-link">Orders</Link>
          
          <div className="navbar-actions" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <Link to="/cart" className="nav-cart" aria-label="Cart">
              <span className="nav-icon"><ShoppingCart size={20} /></span>
              <span className="cart-label">Cart</span>
            </Link>

            {user ? (
              <div className="user-nav" style={{display: 'flex', gap: '8px'}}>
                <Link to="/profile" className="nav-link"><User size={20} /></Link>
                <button onClick={logout} className="nav-link" title="Logout"><LogOut size={20} /></button>
              </div>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}
    </nav>
  );
};

export default Navbar;
