import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle, Package, Navigation, Phone, Clock } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const RiderDashboard = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const { user, supabase } = useAuth();
  const mapRef = useRef(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false });
    
    if (!error) setAvailableOrders(data);
  };

  useEffect(() => {
    if (isOnline) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        const newOrder = payload.new;
        if (newOrder.status === 'pending' || newOrder.status === 'confirmed') {
          setAvailableOrders(prev => [newOrder, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (activeOrder && mapRef.current) {
      const loader = new Loader({
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
        version: "weekly",
      });

      loader.load().then((google) => {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 5.6037, lng: -0.1870 },
          zoom: 14,
          styles: [
            { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{"color": "#7c93a3"},{"lightness": "-10"}] },
            { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{"visibility": "on"}] },
            { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{"color": "#a0a4a5"}] },
            { "featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#e0e3e5"}] }
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });

        const storeIcon = {
           path: google.maps.SymbolPath.CIRCLE,
           scale: 10,
           fillColor: "#5d5dff",
           fillOpacity: 1,
           strokeWeight: 2,
           strokeColor: "#ffffff",
        };

        const customerIcon = {
           path: google.maps.SymbolPath.CIRCLE,
           scale: 10,
           fillColor: "#10b981",
           fillOpacity: 1,
           strokeWeight: 2,
           strokeColor: "#ffffff",
        };

        new google.maps.Marker({
          position: { lat: 5.6047, lng: -0.1880 },
          map: map,
          icon: storeIcon,
          title: "Pickup Location"
        });

        new google.maps.Marker({
          position: { lat: 5.6137, lng: -0.1970 },
          map: map,
          icon: customerIcon,
          title: "Delivery Location"
        });
      });
    }
  }, [activeOrder]);

  const handlePickUp = async () => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'delivering' }).eq('id', activeOrder.id);
      if (error) throw error;
      setActiveOrder({ ...activeOrder, status: 'delivering' });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelivered = async () => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', activeOrder.id);
      if (error) throw error;
      setActiveOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="rider-dashboard container" style={{ paddingTop: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: isOnline ? 'var(--primary)' : 'var(--bg-white)',
          padding: '24px',
          borderRadius: '24px',
          color: isOnline ? 'white' : 'var(--text-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-premium)',
          marginBottom: '30px',
          transition: 'all 0.4s ease'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Rider Central</h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#10b981' : '#94a3b8' }}></span>
            {isOnline ? 'Online • Finding Orders' : 'Offline'}
          </p>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          style={{
            background: isOnline ? 'white' : 'var(--primary)',
            color: isOnline ? 'var(--primary)' : 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '99px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isOnline ? 'Go Offline' : 'GO ONLINE'}
        </button>
      </motion.header>

      <AnimatePresence mode='wait'>
        {!activeOrder ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--primary)" /> Available Pickups ({availableOrders.length})
            </h3>
            
            <div className="orders-list">
              {availableOrders.length > 0 ? (
                availableOrders.map((order, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={order.id} 
                    className="premium-card" 
                    style={{ marginBottom: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setActiveOrder(order)}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={24} color="var(--primary)" />
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>{order.town}</p>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order #{order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>₵{order.total_amount?.toFixed(2)}</span>
                        <p style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>5.2 mi away</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="premium-card centered" style={{ textAlign: 'center', padding: '60px', opacity: 0.7 }}>
                  <Package size={64} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                  <h3 style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
                    {isOnline ? 'Waiting for orders...' : 'You are offline'}
                  </h3>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card glass-card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Map Area */}
            <div className="google-map-placeholder" ref={mapRef} style={{ 
              height: '300px', 
              background: '#e0e3e5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              {!window.google && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Navigation size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                  <p>Initializing Navigation...</p>
                </div>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className={`status-badge status-${activeOrder.status}`}>
                  {activeOrder.status === 'delivering' ? 'En Route' : 'Pick Up Ready'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>#{activeOrder.id.slice(0, 8)}</span>
              </div>
              
              <div className="delivery-timeline" style={{ position: 'relative', margin: '0 0 30px 10px', paddingLeft: '24px', borderLeft: '2px dashed var(--border)' }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', left: '-33px', top: '2px', background: 'white', padding: '4px' }}>
                    <Store size={16} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Pick Up At</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Local Grocery, {activeOrder.town}</p>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-33px', top: '2px', background: 'white', padding: '4px' }}>
                    <MapPin size={16} color="var(--success)" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Deliver To</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Customer Address, {activeOrder.town}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <Phone size={18} color="var(--primary)" /> Call Client
                </button>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <Navigation size={18} color="var(--primary)" /> Directions
                </button>
              </div>

              <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeOrder.status !== 'delivering' ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={handlePickUp}
                    style={{ padding: '16px', fontSize: '1.1rem', width: '100%', borderRadius: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                  >
                    <Package size={20} /> Swipe to Confirm Pick Up
                  </button>
                ) : (
                  <button 
                    className="btn" 
                    onClick={handleDelivered} 
                    style={{ padding: '16px', fontSize: '1.1rem', width: '100%', borderRadius: '16px', background: 'var(--success)', color: 'white', display: 'flex', justifyContent: 'center', gap: '10px' }}
                  >
                    <CheckCircle size={20} /> Mark as Delivered
                  </button>
                )}
                {activeOrder.status !== 'delivering' && (
                  <button className="btn" onClick={() => setActiveOrder(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                    Cancel Delivery
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiderDashboard;
