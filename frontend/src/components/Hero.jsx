import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section-premium" style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      padding: '60px 20px', 
      background: 'linear-gradient(135deg, var(--bg-white) 0%, var(--bg-page) 100%)',
      borderRadius: '24px',
      margin: '20px 0',
      boxShadow: 'var(--shadow-soft)'
    }}>
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'var(--primary-light)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: '1 1 500px', maxWidth: '600px' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-white)', borderRadius: '99px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <Zap size={14} fill="var(--warning)" color="var(--warning)" /> Super Fast Delivery
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', lineHeight: 1.1, color: 'var(--secondary)', marginBottom: '20px', letterSpacing: '-1px' }}>
            Shop <span style={{ color: 'var(--primary)' }}>Local</span>, <br /> Get It <span style={{ color: 'var(--success)' }}>Fast.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: 1.6, maxWidth: '85%' }}>
            Your favorite neighborhood stores and restaurants, delivered straight to your door in minutes.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/stores" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(93, 93, 255, 0.3)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              <ShoppingBag size={20} /> Start Shopping
            </Link>
            <Link to="/categories" style={{ padding: '16px 24px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-primary)'}>
              Explore Categories <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--bg-white)', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}><ShieldCheck size={18} color="var(--success)" /></div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Secure Checkout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--bg-white)', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}><ShoppingBag size={18} color="var(--primary)" /></div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Quality Items</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '1/1', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/delivery-boy-riding-scooter-4439121-3728461.png" alt="Delivery illustration" style={{ width: '80%', height: 'auto', dropShadow: '0 20px 30px rgba(0,0,0,0.1)' }} />
            </motion.div>
            
            {/* Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              style={{ position: 'absolute', bottom: '30px', left: '-20px', background: 'var(--bg-white)', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '50%' }}>
                <span role="img" aria-label="star" style={{ fontSize: '18px' }}>⭐</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Customer Rating</p>
                <p style={{ margin: 0, fontWeight: '800', color: 'var(--secondary)' }}>4.9/5.0</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
