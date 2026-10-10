import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import Loading from '../components/Loading';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderByNumber(orderNumber);
        if (res.data) setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return <Loading message="Generating order confirmation..." />;

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '3.5rem 2rem',
        maxWidth: '650px',
        margin: '0 auto',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 1.5rem'
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Thank you for shopping with SmartShop. Your order has been placed and is currently being processed.
        </p>

        {order && (
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>ORDER NUMBER</span>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{order.orderNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>PAYMENT METHOD</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{order.paymentMethod}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>ORDER STATUS</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{order.orderStatus}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>TOTAL AMOUNT</span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 0}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
            📦 Track Order
          </Link>
          <Link to="/products" className="btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
