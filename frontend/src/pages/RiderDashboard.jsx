import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle, Package } from 'lucide-react';
import { io } from 'socket.io-client';
import { Loader } from '@googlemaps/js-api-loader';

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
      // Polling as fallback if socket not fully implemented on backend
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  useEffect(() => {
    // Socket setup
    const newSocket = io(window.location.origin.includes('localhost') ? 'http://localhost:5000' : '/');
    
    newSocket.on('new_pickup', (order) => {
      setAvailableOrders(prev => [order, ...prev]);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (activeOrder && mapRef.current) {
      const loader = new Loader({
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Note to user: Replace with actual key
        version: "weekly",
      });

      loader.load().then((google) => {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 5.6037, lng: -0.1870 }, // Default Accra coords
          zoom: 13,
          styles: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        });

        // Add markers for store and customer (placeholders for now)
        new google.maps.Marker({
          position: { lat: 5.6047, lng: -0.1880 },
          map: map,
          title: "Pickup Location",
          label: "S"
        });

        new google.maps.Marker({
          position: { lat: 5.6137, lng: -0.1970 },
          map: map,
          title: "Delivery Location",
          label: "C"
        });
      });
    }
  }, [activeOrder]);

  const handlePickUp = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivering' })
        .eq('id', activeOrder.id);
      
      if (error) throw error;
      setActiveOrder({ ...activeOrder, status: 'delivering' });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelivered = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', activeOrder.id);

      if (error) throw error;
      setActiveOrder(null);
      alert('Delivery Confirmed!');
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="rider-dashboard container" style={{ paddingTop: '20px' }}>
      <header className="section-header-premium">
        <h2>Rider Dashboard</h2>
        <button 
          className={`btn ${isOnline ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </header>

      {!activeOrder ? (
        <div className="orders-container">
          <h3>Available Pickups</h3>
          <div className="orders-list" style={{ marginTop: '16px' }}>
            {availableOrders.length > 0 ? (
              availableOrders.map(order => (
                <div key={order.id} className="premium-card" style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => setActiveOrder(order)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Order #{order.id.slice(0, 8)}</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{order.town}</p>
                    </div>
                    <span className="badge">₵{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="premium-card centered" style={{ textAlign: 'center', padding: '60px' }}>
                <Package size={64} color="var(--text-muted)" />
                <h3 style={{ marginTop: '20px' }}>No active orders</h3>
                <p>Go online to receive new delivery requests</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="premium-card">
          <div className="card-header">
            <span className="badge">New Order</span>
            <h3>Delivery Details</h3>
          </div>
          
          <div className="order-details" style={{ marginBottom: '24px' }}>
            <div className="p-info-item">
              <span className="label">Customer Address</span>
              <span className="value">123 Street, Accra</span>
            </div>
            <div className="p-info-item">
              <span className="label">Store Location</span>
              <span className="value">Local Grocery, Town Center</span>
            </div>
          </div>

          <div className="google-map-placeholder" ref={mapRef} style={{ 
            height: '250px', 
            background: '#eee', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <MapPin size={32} />
            <span>Map Integration Here</span>
          </div>

          <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {activeOrder.status !== 'delivering' ? (
              <button className="btn btn-primary" onClick={handlePickUp}>
                Confirm Pick Up
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleDelivered} style={{ gridColumn: 'span 2' }}>
                <CheckCircle size={18} /> Confirm Delivered
              </button>
            )}
            {activeOrder.status !== 'delivering' && (
              <button className="btn btn-secondary" onClick={() => setActiveOrder(null)}>
                Decline
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
