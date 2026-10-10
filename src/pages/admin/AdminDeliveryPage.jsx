import React, { useState, useEffect, useCallback } from 'react';
import deliveryService from '../../services/deliveryService';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';

const AdminDeliveryPage = () => {
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UNASSIGNED');

  // Assign Modal / Selection
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'success' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [unassignedRes, agentsRes, assignRes] = await Promise.all([
        deliveryService.getUnassignedOrders(),
        deliveryService.getDeliveryAgents(),
        deliveryService.getAllAssignments(),
      ]);

      if (unassignedRes.data) setUnassignedOrders(unassignedRes.data);
      if (agentsRes.data) setAgents(agentsRes.data);
      if (assignRes.data) setAssignments(assignRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch delivery logistics data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedAgentId) {
      showToast('Please select both an order and a delivery agent.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await deliveryService.assignAgent({
        orderId: Number(selectedOrderId),
        deliveryAgentId: Number(selectedAgentId),
        notes: assignNotes,
      });

      showToast(`Agent assigned successfully to Order #${selectedOrderId}!`, 'success');
      setSelectedOrderId(null);
      setSelectedAgentId('');
      setAssignNotes('');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to assign delivery agent.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (orderId, newAgentId) => {
    try {
      await deliveryService.reassignAgent({
        orderId,
        deliveryAgentId: Number(newAgentId),
        notes: 'Reassigned via admin dispatch console.',
      });
      showToast('Order reassigned successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reassign agent.', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🛵 Delivery & Fleet Management
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Assign delivery partners, monitor live GPS delivery routes, and track fulfillment status.
          </p>
        </div>

        <button onClick={loadData} className="btn-outline" style={{ fontSize: '0.85rem' }}>
          🔄 Refresh Fleet Data
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>NEEDS ASSIGNMENT</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#ea580c' }}>
            {unassignedOrders.length}
          </h3>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>ACTIVE DELIVERIES</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
            {assignments.filter((a) => a.deliveryStatus !== 'DELIVERED' && a.deliveryStatus !== 'CANCELLED').length}
          </h3>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>ACTIVE FLEET AGENTS</span>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
            {agents.length}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        {[
          { key: 'UNASSIGNED', label: `Pending Assignment (${unassignedOrders.length})` },
          { key: 'ASSIGNMENTS', label: `All Fleet Assignments (${assignments.length})` },
          { key: 'AGENTS', label: `Registered Drivers (${agents.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.9rem',
              backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              border: activeTab === tab.key ? '1px solid #e2e8f0' : 'none',
              borderBottom: activeTab === tab.key ? '3px solid #2563eb' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading message="Loading dispatch console..." />
      ) : activeTab === 'UNASSIGNED' ? (
        /* ── TAB 1: UNASSIGNED ORDERS ── */
        unassignedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '2rem' }}>🎉</span>
            <h3 style={{ margin: '0.5rem 0 0', color: '#0f172a' }}>All orders are currently assigned!</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No orders currently awaiting delivery driver assignment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {unassignedOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>#{order.orderNumber}</strong>
                  <span style={{ marginLeft: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    Customer: {order.customerName}
                  </span>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#475569' }}>
                    📍 {order.shippingAddress}
                  </p>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Total: ₹{order.totalAmount?.toLocaleString('en-IN')} • Payment: {order.paymentMethod}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setSelectedAgentId(agents[0]?.id || '');
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    🛵 Assign Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'ASSIGNMENTS' ? (
        /* ── TAB 2: ALL ASSIGNMENTS ── */
        assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <p>No delivery assignments recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      Order #{assignment.orderNumber}
                    </strong>
                    <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                      Assigned to: <strong>{assignment.agentName}</strong> ({assignment.agentPhone})
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      backgroundColor:
                        assignment.deliveryStatus === 'DELIVERED'
                          ? '#dcfce7'
                          : assignment.deliveryStatus === 'OUT_FOR_DELIVERY'
                          ? '#ffedd5'
                          : '#eff6ff',
                      color:
                        assignment.deliveryStatus === 'DELIVERED'
                          ? '#15803d'
                          : assignment.deliveryStatus === 'OUT_FOR_DELIVERY'
                          ? '#c2410c'
                          : '#1d4ed8',
                    }}
                  >
                    {assignment.deliveryStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: '#334155' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>CUSTOMER & ADDRESS</span>
                    <strong>{assignment.customerName}</strong>
                    <p style={{ margin: '0.1rem 0' }}>{assignment.shippingAddress}</p>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>LAST REPORTED GPS</span>
                    {assignment.latestLocation ? (
                      <div>
                        <strong>
                          {assignment.latestLocation.latitude.toFixed(4)}° N, {assignment.latestLocation.longitude.toFixed(4)}° E
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: assignment.latestLocation.isStale ? '#ea580c' : '#16a34a' }}>
                          {assignment.latestLocation.isStale ? '⚠️ Location Stale (>5 min)' : '● Active GPS Signal'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No GPS update recorded yet</span>
                    )}
                  </div>

                  {assignment.deliveryStatus !== 'DELIVERED' && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>REASSIGN DRIVER</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleReassign(assignment.orderId, e.target.value);
                        }}
                        defaultValue=""
                        style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginTop: '0.2rem' }}
                      >
                        <option value="" disabled>Change Driver...</option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── TAB 3: AGENTS ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {agents.map((agent) => (
            <div key={agent.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                  🛵
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block' }}>{agent.fullName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{agent.email}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Phone: <strong>{agent.phoneNumber || 'Not configured'}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {selectedOrderId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
              Assign Driver to Order #{selectedOrderId}
            </h3>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Delivery Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="" disabled>Choose an active driver...</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.fullName} ({ag.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Dispatch Notes (Optional)
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows="3"
                  placeholder="e.g. Priority delivery, fragile electronics, call customer before gate"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="btn-outline"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
};

export default AdminDeliveryPage;
