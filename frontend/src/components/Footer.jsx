import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-main-grid">
          <div className="footer-col branding-col">
            <Link to="/" className="footer-logo">Your<span className="brand-wae">Wae</span></Link>
            <p className="footer-description">
              YourWae is your premium hyperlocal marketplace, connecting you with the best local shops for lightning-fast delivery.
            </p>
          </div>

          <div className="footer-col">
            <h5 className="footer-title">Marketplace</h5>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/stores">All Stores</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/signup?role=store">Become a Seller</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-title">Support</h5>
            <ul className="footer-links-list">
              <li><Link to="#">Help Center</Link></li>
              <li><Link to="#">Safety Tips</Link></li>
              <li><Link to="#">Contact Us</Link></li>
              <li><Link to="#">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h5 className="footer-title">Contact Us</h5>
            <div className="contact-methods">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>0599882214</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>zhilakcodes@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-premium">
          <p>&copy; 2026 Your<span className="brand-wae">Wae</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
