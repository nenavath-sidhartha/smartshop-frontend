import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import deliveryService from '../../services/deliveryService';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';

const DeliveryOrderDetailPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const watchIdRef = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'success' });

  const fetchDetails = useCallback(async () => {
    if (!orderId || !user) return;
    setLoading(true);
    try {
      const res = await deliveryService.getOrderDetails(orderId, user.email);
      if (res.data) {
        setAssignment(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve order delivery assignment.');
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Clean up watchPosition
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const toggleLocationSharing = () => {
    if (isSharingLocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharingLocation(false);
      showToast('Live GPS sharing stopped.', 'info');
      return;
    }

    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentCoords({ latitude, longitude, accuracy, time: new Date() });

        try {
          await deliveryService.updateLocation(orderId, {
            latitude,
            longitude,
            accuracy,
            recordedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(err);
        }
      },
      (err) => {
        showToast(`Location error: ${err.message}`, 'error');
        setIsSharingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    watchIdRef.current = watchId;
    setIsSharingLocation(true);
    showToast('Broadcasting live GPS coordinates to customer tracking map.', 'success');
  };

  const handleStartDelivery = async () => {
    try {
      await deliveryService.startDelivery(orderId);
      showToast('Delivery started! Order is now OUT FOR DELIVERY.', 'success');
      fetchDetails();
      toggleLocationSharing();
    } catch (err) {
      showToast(err.message || 'Failed to start delivery', 'error');
    }
  };

  const handleMarkDelivered = async () => {
    if (!window.confirm('Confirm that this delivery has been completed?')) return;
    try {
      await deliveryService.completeDelivery(orderId);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharingLocation(false);
      showToast('Order marked as DELIVERED successfully! 🎉', 'success');
      fetchDetails();
    } catch (err) {
      showToast(err.message || 'Failed to mark as delivered', 'error');
    }
  };

  const openNavigation = () => {
    if (!assignment) return;
    const lat = assignment.destinationLatitude;
    const lng = assignment.destinationLongitude;
    const addr = encodeURIComponent(assignment.shippingAddress);
    const url = lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${addr}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="container" style={{ padding: '3rem' }}><Loading message="Loading delivery manifest..." /></div>;
  if (error || !assignment) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h3>Error: {error || 'Delivery not found'}</h3>
        <Link to="/delivery/dashboard" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isDelivered = assignment.deliveryStatus === 'DELIVERED';
  const isOutForDelivery = assignment.deliveryStatus === 'OUT_FOR_DELIVERY';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/delivery/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Driver Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Delivery Manifest • #{assignment.orderNumber}
          </h1>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.85rem',
              backgroundColor: isDelivered ? '#dcfce7' : isOutForDelivery ? '#ffedd5' : '#eff6ff',
              color: isDelivered ? '#15803d' : isOutForDelivery ? '#c2410c' : '#1d4ed8',
            }}
          >
            {assignment.deliveryStatus}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left: Customer, Address & Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer & Address Details */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              👤 Customer & Delivery Info
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>CUSTOMER NAME</span>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{assignment.customerName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>CONTACT PHONE</span>
                {assignment.customerPhone ? (
                  <a href={`tel:${assignment.customerPhone}`} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                    📞 {assignment.customerPhone}
                  </a>
                ) : (
                  <span>N/A</span>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>DESTINATION ADDRESS</span>
              <p style={{ margin: '0.2rem 0', fontSize: '0.95rem', color: '#334155', lineHeight: 1.5 }}>
                {assignment.shippingAddress}
              </p>
              {assignment.deliveryInstructions && (
                <div style={{ marginTop: '0.5rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e' }}>
                  <strong>Special Instructions:</strong> {assignment.deliveryInstructions}
                </div>
              )}
            </div>

            {/* Navigation Button */}
            <button
              onClick={openNavigation}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              🧭 Open Google Maps Turn-by-Turn Navigation
            </button>
          </div>

          {/* Workflow Action Panel */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              ⚡ Driver Action Controls
            </h3>

            {!isDelivered ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isOutForDelivery && (
                  <button
                    onClick={handleStartDelivery}
                    className="btn-primary"
                    style={{ padding: '0.9rem', fontSize: '1rem', backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                  >
                    🚀 Start Delivery & Begin Tracking
                  </button>
                )}

                {isOutForDelivery && (
                  <>
                    <button
                      onClick={toggleLocationSharing}
                      style={{
                        padding: '0.85rem',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        borderRadius: '10px',
                        backgroundColor: isSharingLocation ? '#fee2e2' : '#ecfdf5',
                        color: isSharingLocation ? '#b91c1c' : '#059669',
                        border: isSharingLocation ? '2px solid #fca5a5' : '2px solid #6ee7b7',
                        cursor: 'pointer',
                      }}
                    >
                      {isSharingLocation ? '⏸ Pause GPS Transmission' : '📡 Start Sharing Live GPS Coordinates'}
                    </button>

                    <button
                      onClick={handleMarkDelivered}
                      className="btn-primary"
                      style={{ padding: '0.9rem', fontSize: '1rem', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                    >
                      ✅ Mark Order as Delivered
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '1rem', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>
                ✓ This parcel was marked DELIVERED on {assignment.completedAt ? new Date(assignment.completedAt).toLocaleString() : 'recently'}.
              </div>
            )}
          </div>
        </div>

        {/* Right: GPS Telemetry & Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* GPS Telemetry Monitor */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📡</span> GPS Telemetry Live Monitor
            </h4>

            {currentCoords ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Latitude:</span>
                  <strong>{currentCoords.latitude.toFixed(6)}° N</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Longitude:</span>
                  <strong>{currentCoords.longitude.toFixed(6)}° E</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Accuracy:</span>
                  <strong>±{Math.round(currentCoords.accuracy)} meters</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Last Ping:</span>
                  <span>{currentCoords.time.toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                GPS streaming is currently idle. Click "Start Sharing Live GPS" to stream device telemetry.
              </p>
            )}
          </div>

          {/* Items Summary */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
              📦 Items Manifest ({assignment.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignment.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
                  <img src={item.productImage || 'https://via.placeholder.com/40'} alt={item.productName} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.productName}
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>Total Amount:</span>
              <span style={{ color: '#2563eb' }}>₹{assignment.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
};

export default DeliveryOrderDetailPage;
