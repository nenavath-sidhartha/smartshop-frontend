import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import deliveryService from '../../services/deliveryService';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Live Location Tracking State
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);
  const [latestCoordinates, setLatestCoordinates] = useState(null);
  const watchIdRef = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'success' });

  // Role Guard
  useEffect(() => {
    if (user && user.role !== 'ROLE_DELIVERY_AGENT' && user.role !== 'ROLE_ADMIN') {
      navigate('/delivery/login');
    }
  }, [user, navigate]);

  const fetchAssignedOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await deliveryService.getMyAssignedOrders(user.email);
      if (res.data) {
        setAssignments(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch assigned delivery orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedOrders();
  }, [fetchAssignedOrders]);

  // Clean up geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ── Geolocation Location Sharing Workflow ──────────────────────────────────
  const startLiveLocationSharing = (orderId) => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    if (activeTrackingOrderId === orderId) {
      // Toggle OFF
      stopLiveLocationSharing();
      showToast('Live location sharing paused.', 'info');
      return;
    }

    // Explicit browser permission request
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLatestCoordinates({ latitude, longitude, accuracy, time: new Date() });

        try {
          await deliveryService.updateLocation(orderId, {
            latitude,
            longitude,
            accuracy,
            recordedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Failed to post live location update:', err);
        }
      },
      (err) => {
        showToast(`Location error: ${err.message}. Check browser permissions.`, 'error');
        stopLiveLocationSharing();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    watchIdRef.current = watchId;
    setActiveTrackingOrderId(orderId);
    showToast(`Live GPS tracking started for Order #${orderId}. Location is transmitting.`, 'success');
  };

  const stopLiveLocationSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setActiveTrackingOrderId(null);
  };

  // ── Workflow Action Handlers ───────────────────────────────────────────────
  const handleStartDelivery = async (orderId) => {
    try {
      await deliveryService.startDelivery(orderId);
      showToast('Delivery started! Order is now OUT FOR DELIVERY.', 'success');
      fetchAssignedOrders();
      // Promptly start location updates
      startLiveLocationSharing(orderId);
    } catch (err) {
      showToast(err.message || 'Failed to start delivery.', 'error');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm('Confirm that this order has been successfully delivered to the customer?')) {
      return;
    }
    try {
      await deliveryService.completeDelivery(orderId);
      if (activeTrackingOrderId === orderId) {
        stopLiveLocationSharing();
      }
      showToast('Order marked as DELIVERED successfully! Great job! 🎉', 'success');
      fetchAssignedOrders();
    } catch (err) {
      showToast(err.message || 'Failed to mark order as delivered.', 'error');
    }
  };

  const openGoogleMapsNavigation = (assignment) => {
    const lat = assignment.destinationLatitude;
    const lng = assignment.destinationLongitude;
    const address = encodeURIComponent(assignment.shippingAddress);

    let url;
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    }
    window.open(url, '_blank');
  };

  // Filter assignments by active tab
  const activeDeliveries = assignments.filter((a) => a.deliveryStatus !== 'DELIVERED' && a.deliveryStatus !== 'CANCELLED');
  const completedDeliveries = assignments.filter((a) => a.deliveryStatus === 'DELIVERED');
  const displayedAssignments = activeTab === 'ACTIVE' ? activeDeliveries : activeTab === 'COMPLETED' ? completedDeliveries : assignments;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Driver Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              border: '2px solid #fdba74',
            }}
          >
            🛵
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
              SMARTSHOP DRIVER FLEET
            </span>
            <h1 style={{ margin: '0.1rem 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {user?.fullName || 'Delivery Partner'}
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Logged in as: <strong>{user?.email}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Active GPS Status Beacon */}
          {activeTrackingOrderId ? (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                color: '#16a34a',
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: '1.1rem', animation: 'pulse 1.5s infinite' }}>📡</span>
              <div>
                <span>Broadcasting GPS for Order #{activeTrackingOrderId}</span>
                {latestCoordinates && (
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                    {latestCoordinates.latitude.toFixed(4)}°, {latestCoordinates.longitude.toFixed(4)}° (±{Math.round(latestCoordinates.accuracy)}m)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.6rem 1rem',
                fontSize: '0.82rem',
                color: '#64748b',
              }}
            >
              GPS Transmission Inactive
            </div>
          )}

          <button onClick={logout} className="btn-outline" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Driver Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ACTIVE DELIVERIES</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#ea580c' }}>
            {activeDeliveries.length}
          </h3>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>DELIVERED TODAY</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>
            {completedDeliveries.length}
          </h3>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL ASSIGNED</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>
            {assignments.length}
          </h3>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
        {[
          { key: 'ACTIVE', label: `Pending & In Transit (${activeDeliveries.length})` },
          { key: 'COMPLETED', label: `Completed Orders (${completedDeliveries.length})` },
          { key: 'ALL', label: `All Orders (${assignments.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px 10px 0 0',
              fontWeight: 700,
              fontSize: '0.92rem',
              backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#ea580c' : '#64748b',
              border: activeTab === tab.key ? '1px solid #e2e8f0' : 'none',
              borderBottom: activeTab === tab.key ? '3px solid #ea580c' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assigned Orders List */}
      {loading ? (
        <Loading message="Fetching your assigned runs..." />
      ) : displayedAssignments.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>📦</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>
            No assigned deliveries in this category
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Check back shortly or contact dispatcher.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedAssignments.map((assignment) => {
            const isTrackingThis = activeTrackingOrderId === assignment.orderId;
            const isOutForDelivery = assignment.deliveryStatus === 'OUT_FOR_DELIVERY';
            const isDelivered = assignment.deliveryStatus === 'DELIVERED';

            return (
              <div
                key={assignment.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: isTrackingThis ? '2px solid #ea580c' : '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.85rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                      ORDER ID:{' '}
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                      #{assignment.orderNumber}
                    </strong>
                    <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Assigned:{' '}
                      {assignment.assignedAt
                        ? new Date(assignment.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recently'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        backgroundColor: isDelivered
                          ? '#dcfce7'
                          : isOutForDelivery
                          ? '#ffedd5'
                          : '#eff6ff',
                        color: isDelivered
                          ? '#15803d'
                          : isOutForDelivery
                          ? '#c2410c'
                          : '#1d4ed8',
                      }}
                    >
                      {assignment.deliveryStatus}
                    </span>

                    {isTrackingThis && (
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        ● GPS Streaming
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                      CUSTOMER & CONTACT
                    </span>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', margin: '0.1rem 0' }}>
                      {assignment.customerName}
                    </strong>
                    {assignment.customerPhone ? (
                      <a
                        href={`tel:${assignment.customerPhone}`}
                        style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                      >
                        📞 {assignment.customerPhone}
                      </a>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Phone on parcel</span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                      DELIVERY ADDRESS
                    </span>
                    <p style={{ margin: '0.1rem 0', fontSize: '0.92rem', color: '#334155' }}>
                      {assignment.shippingAddress}
                    </p>
                    {assignment.deliveryInstructions && (
                      <div
                        style={{
                          marginTop: '0.4rem',
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#92400e',
                        }}
                      >
                        <strong>Note:</strong> {assignment.deliveryInstructions}
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                      PAYMENT & TOTAL
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                      ₹{assignment.totalAmount?.toLocaleString('en-IN')}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Method: <strong>{assignment.paymentMethod}</strong> • Status:{' '}
                      <span style={{ color: assignment.paymentStatus === 'PAID' ? '#16a34a' : '#ea580c', fontWeight: 700 }}>
                        {assignment.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in Delivery */}
                <div style={{ marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    PARCEL CONTENTS:
                  </span>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {assignment.items?.map((item) => (
                      <span key={item.id} style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        • {item.quantity}× {item.productName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate(`/delivery/orders/${assignment.orderId}`)}
                      className="btn-outline"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      View Order Details
                    </button>

                    <button
                      onClick={() => openGoogleMapsNavigation(assignment)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: '10px',
                        border: '1.5px solid #0284c7',
                        backgroundColor: '#f0f9ff',
                        color: '#0284c7',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      🧭 Open in Google Maps
                    </button>
                  </div>

                  {!isDelivered && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {!isOutForDelivery && (
                        <button
                          onClick={() => handleStartDelivery(assignment.orderId)}
                          style={{
                            padding: '0.55rem 1.25rem',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            borderRadius: '10px',
                            backgroundColor: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          🚀 Start Delivery
                        </button>
                      )}

                      {isOutForDelivery && (
                        <>
                          <button
                            onClick={() => startLiveLocationSharing(assignment.orderId)}
                            style={{
                              padding: '0.55rem 1.1rem',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              borderRadius: '10px',
                              backgroundColor: isTrackingThis ? '#fee2e2' : '#ecfdf5',
                              color: isTrackingThis ? '#b91c1c' : '#059669',
                              border: isTrackingThis ? '1.5px solid #fca5a5' : '1.5px solid #6ee7b7',
                              cursor: 'pointer',
                            }}
                          >
                            {isTrackingThis ? '⏸ Stop GPS Stream' : '📡 Share Live Location'}
                          </button>

                          <button
                            onClick={() => handleMarkDelivered(assignment.orderId)}
                            className="btn-primary"
                            style={{
                              padding: '0.55rem 1.25rem',
                              fontSize: '0.88rem',
                              backgroundColor: '#16a34a',
                              borderColor: '#16a34a',
                            }}
                          >
                            ✅ Mark Delivered
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
};

export default DeliveryDashboard;
