import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import GoogleMapTracker from '../components/GoogleMapTracker';
import Loading from '../components/Loading';

const TIMELINE_STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: '📝' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
  { key: 'PROCESSING', label: 'Processing', icon: '📦' },
  { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Polling ref to clear interval safely on unmount
  const pollIntervalRef = useRef(null);

  const fetchTrackingData = useCallback(async (isSilent = false) => {
    if (!orderId) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await orderService.getOrderTracking(orderId, user?.email);
      if (res.data) {
        setTracking(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve order tracking information.');
    } finally {
      if (!isSilent) setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    fetchTrackingData(false);
  }, [fetchTrackingData]);

  // Setup auto-polling every 8 seconds when out for delivery
  useEffect(() => {
    if (tracking && tracking.orderStatus === 'OUT_FOR_DELIVERY') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const locRes = await orderService.getLatestTrackingLocation(orderId, user?.email);
          if (locRes && locRes.data) {
            setTracking((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                latestLocation: locRes.data,
                lastUpdatedTimestamp: locRes.data.recordedAt || new Date().toISOString(),
                isLiveTrackingActive: true,
              };
            });
          }
        } catch {
          fetchTrackingData(true);
        }
      }, 8000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [tracking?.orderStatus, orderId, user?.email, fetchTrackingData]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <Loading message="Connecting to live delivery dispatch satellite..." />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '1rem 0 0.5rem' }}>
            Tracking Information Unavailable
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            {error || 'The requested order could not be located.'}
          </p>
          <Link to="/orders" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const {
    orderNumber,
    orderStatus,
    createdAt,
    estimatedDeliveryTime,
    shippingAddress,
    destinationLatitude,
    destinationLongitude,
    deliveryInstructions,
    items,
    deliveryAgent,
    latestLocation,
    isLiveTrackingActive,
    lastUpdatedTimestamp,
    cancellationReason,
    cancellationNote,
    cancelledAt,
  } = tracking;

  // Find index of current stage in timeline
  const currentStageIndex = TIMELINE_STAGES.findIndex((s) => s.key === orderStatus);
  const isCancelled = orderStatus === 'CANCELLED';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Breadcrumb & Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '0.5rem' }}>
          <Link to="/orders" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Orders
          </Link>
          <span>/</span>
          <span>Order #{orderNumber}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Live Delivery Tracking
            </h1>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Order Placed on {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => fetchTrackingData(true)}
            disabled={refreshing}
            className="btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              fontSize: '0.88rem',
            }}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* Cancellation Notice if cancelled */}
      {isCancelled ? (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>❌</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c' }}>
                Order Cancelled
              </h3>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem', color: '#7f1d1d' }}>
                This order was cancelled on {cancelledAt ? new Date(cancelledAt).toLocaleString() : 'recently'}.
                Delivery tracking is no longer active.
              </p>
              {cancellationReason && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#991b1b' }}>
                  <strong>Reason:</strong> {cancellationReason} {cancellationNote ? `(${cancellationNote})` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Order Progress Timeline */
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Delivery Progress
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TIMELINE_STAGES.length}, 1fr)`,
              position: 'relative',
              gap: '0.5rem',
            }}
          >
            {TIMELINE_STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Step circle */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent
                        ? '#2563eb'
                        : isCompleted
                        ? '#dcfce7'
                        : '#f1f5f9',
                      color: isCurrent ? '#ffffff' : isCompleted ? '#16a34a' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      border: isCurrent
                        ? '3px solid #bfdbfe'
                        : isCompleted
                        ? '2px solid #86efac'
                        : '2px solid #cbd5e1',
                      zIndex: 2,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {stage.icon}
                  </div>

                  {/* Stage title */}
                  <span
                    style={{
                      marginTop: '0.6rem',
                      fontSize: '0.8rem',
                      fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                      color: isCurrent ? '#2563eb' : isCompleted ? '#0f172a' : '#94a3b8',
                    }}
                  >
                    {stage.label}
                  </span>

                  {isCurrent && (
                    <span
                      style={{
                        marginTop: '0.2rem',
                        fontSize: '0.72rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 700,
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Map & Order Summary */}
      {!isCancelled && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: '1.75rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Interactive Map & Live GPS Telemetry */}
          <div>
            <GoogleMapTracker
              destinationLatitude={destinationLatitude}
              destinationLongitude={destinationLongitude}
              destinationAddress={shippingAddress}
              agentLatitude={latestLocation?.latitude}
              agentLongitude={latestLocation?.longitude}
              agentName={deliveryAgent?.fullName || 'Assigned Agent'}
              agentAccuracy={latestLocation?.accuracy}
              lastUpdatedTimestamp={lastUpdatedTimestamp}
              isLiveTrackingActive={isLiveTrackingActive}
              onRefresh={() => fetchTrackingData(true)}
              refreshing={refreshing}
            />

            {/* Delivery Agent Information Card */}
            {deliveryAgent ? (
              <div
                style={{
                  marginTop: '1.5rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#ffedd5',
                      color: '#c2410c',
                      fontSize: '1.8rem',
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
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                      ASSIGNED DELIVERY PARTNER
                    </span>
                    <h4 style={{ margin: '0.1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {deliveryAgent.fullName}
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      SmartShop Express Fleet
                    </span>
                  </div>
                </div>

                {deliveryAgent.phoneNumber && (
                  <a
                    href={`tel:${deliveryAgent.phoneNumber}`}
                    className="btn-primary"
                    style={{
                      padding: '0.6rem 1.25rem',
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    📞 Call Agent ({deliveryAgent.phoneNumber})
                  </a>
                )}
              </div>
            ) : (
              <div
                style={{
                  marginTop: '1.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1',
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                🚚 A delivery agent is being assigned to your order. Live driver tracking will activate once out for delivery.
              </div>
            )}
          </div>

          {/* Right Column: Order Details & Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Destination Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                📍 Shipping Destination
              </h4>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                {shippingAddress}
              </p>

              {deliveryInstructions && (
                <div
                  style={{
                    marginTop: '1rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}
                >
                  <strong>Delivery Notes:</strong> {deliveryInstructions}
                </div>
              )}

              {estimatedDeliveryTime && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Estimated Arrival:</span>
                  <strong style={{ fontSize: '0.92rem', color: '#16a34a' }}>
                    {new Date(estimatedDeliveryTime).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
              )}
            </div>

            {/* Ordered Items Summary */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                📦 Items in this Delivery ({items?.length || 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid #f8fafc',
                    }}
                  >
                    <img
                      src={item.productImage || 'https://via.placeholder.com/50'}
                      alt={item.productName}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.productName}
                      </h5>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
