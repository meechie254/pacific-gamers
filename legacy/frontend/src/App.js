import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeUI } from './store/slices/uiSlice';
import { getProfile } from './store/slices/authSlice';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import CartSidebar from './components/layout/CartSidebar';

// Page Components
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Component imports
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationContainer from './components/common/NotificationContainer';
import ScrollToTop from './components/common/ScrollToTop';

// Styles
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading: authLoading } = useSelector(state => state.auth);
  const { sidebarOpen, cartOpen } = useSelector(state => state.ui);

  // Initialize app
  useEffect(() => {
    dispatch(initializeUI());

    // Try to restore user session
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Protected Route Component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (authLoading) {
      return <LoadingSpinner fullScreen />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // Public Route Component (redirects to dashboard if authenticated)
  const PublicRoute = ({ children }) => {
    if (authLoading) {
      return <LoadingSpinner fullScreen />;
    }

    if (isAuthenticated) {
      return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return children;
  };

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <Sidebar isOpen={sidebarOpen} />
      <CartSidebar isOpen={cartOpen} />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <NotificationContainer />
    </div>
  );
}

export default App;