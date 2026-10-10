import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import userService from '../services/userService';
import orderService from '../services/orderService';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import OrderCard from '../components/OrderCard';
import RecentPurchaseCard from '../components/RecentPurchaseCard';
import ReorderModal from '../components/ReorderModal';
import CancelOrderModal from '../components/CancelOrderModal';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

const UserProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation tabs
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'RECENT_PURCHASES');

  // Profile Edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user ? user.fullName || '' : '',
    phoneNumber: user ? user.phoneNumber || '' : '',
    newPassword: '',
  });

  // Recent Purchases & Orders Data
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [trackSearchOrderNumber, setTrackSearchOrderNumber] = useState('');

  // Modals & Interactivity
  const [reorderOrderId, setReorderOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'success' });

  // Load Wishlist from LocalStorage
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`smartshop_wishlist_${user.id}`);
      if (stored) setWishlist(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const saveWishlist = (newList) => {
    setWishlist(newList);
    if (user) {
      localStorage.setItem(`smartshop_wishlist_${user.id}`, JSON.stringify(newList));
    }
  };

  const handleToggleWishlist = (product) => {
    const pId = product.productId || product.id;
    const exists = wishlist.some((w) => (w.productId || w.id) === pId);
    let updated;
    if (exists) {
      updated = wishlist.filter((w) => (w.productId || w.id) !== pId);
      showToast(`Removed "${product.productName || product.name}" from Wishlist`, 'info');
    } else {
      updated = [...wishlist, product];
      showToast(`Added "${product.productName || product.name}" to Wishlist ❤️`, 'success');
    }
    saveWishlist(updated);
  };

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Recent Purchases
      const recProdRes = await orderService.getMyRecentPurchasedProducts(user.email);
      if (recProdRes.data) setRecentProducts(recProdRes.data);

      // 2. Fetch Recent Orders (limit 5)
      const recOrdRes = await orderService.getMyRecentOrders(5, user.email);
      if (recOrdRes.data) setRecentOrders(recOrdRes.data);

      // 3. Fetch All Orders
      const allOrdRes = await orderService.getUserOrders(user.id);
      if (allOrdRes.data) setAllOrders(allOrdRes.data);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Profile Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateProfile(user.email, formData);
      if (res.data) {
        updateUser(res.data);
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  // Cancel order flow
  const handleCancelConfirm = async ({ cancellationReason, cancellationNote }) => {
    if (!orderToCancel || !user) return;
    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(orderToCancel.id, {
        userId: user.id,
        cancellationReason,
        cancellationNote,
      });
      if (res.data) {
        showToast(`Order #${res.data.orderNumber} has been cancelled successfully.`, 'success');
        fetchData();
      }
      setOrderToCancel(null);
    } catch (err) {
      showToast(err.message || 'Unable to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Customer Header Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              border: '2px solid #bfdbfe',
            }}
          >
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              WELCOME BACK
            </span>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {user.fullName}
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {user.email} • {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer Account'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsEditing(true)} className="btn-outline" style={{ fontSize: '0.88rem' }}>
            ✏️ Edit Profile
          </button>
          <button onClick={() => navigate('/cart')} className="btn-outline" style={{ fontSize: '0.88rem' }}>
            🛒 My Cart
          </button>
          <button onClick={logout} className="btn-outline" style={{ color: '#ef4444', borderColor: '#fee2e2', fontSize: '0.88rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Required Customer Sections Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {[
          { key: 'RECENT_PURCHASES', label: '🔄 Buy Again – Recent Purchases', count: recentProducts.length },
          { key: 'RECENT_ORDERS', label: '📦 Recent Orders', count: recentOrders.length },
          { key: 'MY_ORDERS', label: '📑 My Orders', count: allOrders.length },
          { key: 'WISHLIST', label: '❤️ Wishlist', count: wishlist.length },
          { key: 'TRACK_ORDER', label: '📍 Track Order' },
          { key: 'PROFILE', label: '👤 Account Details' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '10px 10px 0 0',
                fontWeight: 700,
                fontSize: '0.92rem',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                border: isActive ? '1px solid #e2e8f0' : 'none',
                borderBottom: isActive ? '3px solid #2563eb' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: isActive ? '#eff6ff' : '#f1f5f9',
                    color: isActive ? '#2563eb' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SECTION 1: BUY AGAIN – YOUR RECENT PURCHASES ── */}
      {activeTab === 'RECENT_PURCHASES' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Buy Again – Your Recent Purchases
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Reorder products you previously loved without searching for every item again.
              </p>
            </div>
            {recentOrders.length > 0 && (
              <button
                onClick={() => setReorderOrderId(recentOrders[0].id)}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                ⚡ Reorder Entire Last Order
              </button>
            )}
          </div>

          {loading ? (
            <Loading message="Loading your recent purchases..." />
          ) : recentProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>🛍️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>
                No recent purchases yet
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Once you place an order, items will appear here for fast, one-click reordering!
              </p>
              <button onClick={() => navigate('/products')} className="btn-primary">
                Explore Products
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recentProducts.map((item) => (
                <RecentPurchaseCard
                  key={item.productId}
                  item={item}
                  onBuyAgain={async (it) => {
                    if (it.previousOrderId) {
                      setReorderOrderId(it.previousOrderId);
                    } else {
                      await addToCart(it.productId, 1);
                      showToast(`Added "${it.productName}" to cart!`, 'success');
                    }
                  }}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.some((w) => (w.productId || w.id) === item.productId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 2: RECENT ORDERS ── */}
      {activeTab === 'RECENT_ORDERS' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recent Orders
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Your most recent orders with full tracking and reordering capability.
            </p>
          </div>

          {loading ? (
            <Loading message="Loading recent orders..." />
          ) : recentOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No orders found</p>
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Start shopping to see your orders here.</p>
            </div>
          ) : (
            <div>
              {recentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={(ord) => setSelectedOrderDetails(ord)}
                  onCancelOrder={(ord) => setOrderToCancel(ord)}
                  onReorder={(ord) => setReorderOrderId(ord.id)}
                  onTrackOrder={(ord) => navigate(`/orders/${ord.id}/track`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3: MY ORDERS (FULL LIST) ── */}
      {activeTab === 'MY_ORDERS' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              All Orders
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              View and track all past orders.
            </p>
          </div>

          {allOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No orders found</p>
            </div>
          ) : (
            <div>
              {allOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={(ord) => setSelectedOrderDetails(ord)}
                  onCancelOrder={(ord) => setOrderToCancel(ord)}
                  onReorder={(ord) => setReorderOrderId(ord.id)}
                  onTrackOrder={(ord) => navigate(`/orders/${ord.id}/track`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: WISHLIST ── */}
      {activeTab === 'WISHLIST' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              My Wishlist ({wishlist.length})
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Items saved for future purchases.
            </p>
          </div>

          {wishlist.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>🤍</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.25rem' }}>
                Your wishlist is empty
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Click the heart icon on any product or recent purchase to save it here!
              </p>
              <button onClick={() => navigate('/products')} className="btn-primary">
                Browse Products
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {wishlist.map((item) => {
                const pId = item.productId || item.id;
                const pName = item.productName || item.name;
                const pImage = item.productImage || item.image;
                const pPrice = item.currentPrice || item.price;

                return (
                  <div
                    key={pId}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <img
                      src={pImage || 'https://via.placeholder.com/200'}
                      alt={pName}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'contain',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                      }}
                    />
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                      {pName}
                    </h4>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb', marginBottom: '1rem' }}>
                      ₹{pPrice ? pPrice.toLocaleString('en-IN') : 0}
                    </span>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={async () => {
                          await addToCart(pId, 1);
                          showToast(`Added "${pName}" to cart!`, 'success');
                        }}
                        className="btn-primary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(item)}
                        className="btn-outline"
                        style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.5rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 5: TRACK ORDER SEARCH ── */}
      {activeTab === 'TRACK_ORDER' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>📍</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.5rem' }}>
              Track Any Order
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select an order from your recent list below or enter an Order ID.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-20261010-4492)"
                value={trackSearchOrderNumber}
                onChange={(e) => setTrackSearchOrderNumber(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                }}
              />
              <button
                onClick={async () => {
                  if (!trackSearchOrderNumber.trim()) return;
                  try {
                    const res = await orderService.getOrderByNumber(trackSearchOrderNumber.trim());
                    if (res.data) {
                      navigate(`/orders/${res.data.id}/track`);
                    }
                  } catch (e) {
                    showToast('Order not found. Please check the order ID.', 'error');
                  }
                }}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
              >
                Track Now
              </button>
            </div>

            {/* Quick list of user's active orders */}
            {allOrders.filter((o) => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED').length > 0 && (
              <div style={{ textAlign: 'left', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Orders Currently in Transit:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {allOrders
                    .filter((o) => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED')
                    .map((o) => (
                      <div
                        key={o.id}
                        onClick={() => navigate(`/orders/${o.id}/track`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <strong>#{o.orderNumber}</strong>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                            ({o.items?.length || 0} items)
                          </span>
                        </div>
                        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>
                          {o.orderStatus} → Track
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 6: ACCOUNT DETAILS ── */}
      {activeTab === 'PROFILE' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', pb: '0.75rem' }}>
            Account Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block' }}>FULL NAME</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{user.fullName}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{user.email}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block' }}>PHONE NUMBER</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{user.phoneNumber || 'Not provided'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block' }}>ACCOUNT ROLE</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{user.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={!!reorderOrderId}
        orderId={reorderOrderId}
        onClose={() => setReorderOrderId(null)}
        onToast={showToast}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        title={`Order #${selectedOrderDetails?.orderNumber}`}
      >
        {selectedOrderDetails && (
          <div>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                Placed: <strong>{new Date(selectedOrderDetails.createdAt).toLocaleString()}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Address: <strong>{selectedOrderDetails.shippingAddress}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                Status: <strong>{selectedOrderDetails.orderStatus}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => {
                  const o = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  navigate(`/orders/${o.id}/track`);
                }}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                📍 Track on Map
              </button>
              <button
                onClick={() => {
                  const o = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  setReorderOrderId(o.id);
                }}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                🔄 Reorder Products
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={!!orderToCancel}
        order={orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
      />

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        <form onSubmit={handleUpdate}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
};

export default UserProfilePage;
