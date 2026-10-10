import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Delivery Agent Module Pages
import DeliveryLoginPage from './pages/delivery/DeliveryLoginPage';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrderDetailPage from './pages/delivery/DeliveryOrderDetailPage';

// Support & Help Pages
import SupportPage from './pages/SupportPage';
import TicketDetailPage from './pages/TicketDetailPage';
import FAQPage from './pages/FAQPage';

// Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import InventoryPage from './pages/admin/InventoryPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminFAQPage from './pages/admin/AdminFAQPage';
import AdminCustomerCarePage from './pages/admin/AdminCustomerCarePage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';

const App = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDeliveryRoute = location.pathname.startsWith('/delivery');
  const hideCustomerShell = isAdminRoute || isDeliveryRoute;

  return (
    <div className="app-container">
      {!hideCustomerShell && <Header cartCount={cartCount} user={user} onLogout={logout} />}

      <main className="main-content">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Delivery Agent Module Routes */}
          <Route path="/delivery/login" element={<DeliveryLoginPage />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/orders" element={<DeliveryDashboard />} />
          <Route path="/delivery/orders/:orderId" element={<DeliveryOrderDetailPage />} />

          {/* Support & Help Routes */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/:id" element={<TicketDetailPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/customer-care" element={<FAQPage />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ManageProductsPage />} />
            <Route path="categories" element={<ManageCategoriesPage />} />
            <Route path="orders" element={<ManageOrdersPage />} />
            <Route path="deliveries" element={<AdminDeliveryPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="support" element={<AdminSupportPage />} />
            <Route path="faqs" element={<AdminFAQPage />} />
            <Route path="customer-care" element={<AdminCustomerCarePage />} />
          </Route>
        </Routes>
      </main>

      {!hideCustomerShell && <Footer />}

      {/* Global Chatbot Widget – visible on all customer pages */}
      {!hideCustomerShell && <ChatWidget />}
    </div>
  );
};

export default App;
