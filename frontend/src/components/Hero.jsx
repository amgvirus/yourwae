import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section-premium">
      <div className="hero-banner">
        <div className="hero-content-text">
          <h1>Shop Local, Get it Fast</h1>
          <p>Order from your favourite local shop and get delivery fast</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href='/stores'}
          >
            Shop Now
          </button>
        </div>
        <div className="hero-visual">
          <span className="hero-emoji">🚚</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
