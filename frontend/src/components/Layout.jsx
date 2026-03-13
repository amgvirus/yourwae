import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="container main-content" style={{ marginTop: '24px', paddingBottom: '100px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
