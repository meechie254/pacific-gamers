import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { FaTimes, FaHome, FaShoppingCart, FaUser, FaHeart, FaCog, FaSignOutAlt, FaShoppingBag } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { cartItemsCount } = useSelector(state => state.cart);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
    navigate('/');
  };

  const handleLinkClick = () => {
    dispatch(closeSidebar());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="sidebar-overlay" onClick={handleClose}></div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Menu</h2>
          <button className="sidebar-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            <Link to="/" className="nav-link" onClick={handleLinkClick}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>

            <Link to="/shop" className="nav-link" onClick={handleLinkClick}>
              <FaShoppingBag className="nav-icon" />
              <span>Shop</span>
            </Link>

            <Link to="/cart" className="nav-link" onClick={handleLinkClick}>
              <FaShoppingCart className="nav-icon" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="cart-count">{cartItemsCount}</span>
              )}
            </Link>
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="nav-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="user-details">
                  <p className="user-name">{user?.firstName} {user?.lastName}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
              </div>

              <Link to="/dashboard" className="nav-link" onClick={handleLinkClick}>
                <FaUser className="nav-icon" />
                <span>Dashboard</span>
              </Link>

              <Link to="/wishlist" className="nav-link" onClick={handleLinkClick}>
                <FaHeart className="nav-icon" />
                <span>Wishlist</span>
              </Link>

              <Link to="/settings" className="nav-link" onClick={handleLinkClick}>
                <FaCog className="nav-icon" />
                <span>Settings</span>
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link" onClick={handleLinkClick}>
                  <FaCog className="nav-icon" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button className="nav-link logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="nav-icon" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-section">
              <Link to="/login" className="nav-link login-link" onClick={handleLinkClick}>
                <FaUser className="nav-icon" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Categories */}
          <div className="nav-section">
            <h3 className="nav-section-title">Categories</h3>
            <Link to="/shop?category=gaming-pcs" className="nav-link" onClick={handleLinkClick}>
              Gaming PCs
            </Link>
            <Link to="/shop?category=laptops" className="nav-link" onClick={handleLinkClick}>
              Gaming Laptops
            </Link>
            <Link to="/shop?category=headsets" className="nav-link" onClick={handleLinkClick}>
              Headsets
            </Link>
            <Link to="/shop?category=keyboards" className="nav-link" onClick={handleLinkClick}>
              Keyboards
            </Link>
            <Link to="/shop?category=mice" className="nav-link" onClick={handleLinkClick}>
              Gaming Mice
            </Link>
            <Link to="/shop?category=monitors" className="nav-link" onClick={handleLinkClick}>
              Monitors
            </Link>
            <Link to="/shop?category=accessories" className="nav-link" onClick={handleLinkClick}>
              Accessories
            </Link>
          </div>

          {/* Support */}
          <div className="nav-section">
            <h3 className="nav-section-title">Support</h3>
            <Link to="/contact" className="nav-link" onClick={handleLinkClick}>
              Contact Us
            </Link>
            <Link to="/faq" className="nav-link" onClick={handleLinkClick}>
              FAQ
            </Link>
            <Link to="/shipping" className="nav-link" onClick={handleLinkClick}>
              Shipping Info
            </Link>
            <Link to="/returns" className="nav-link" onClick={handleLinkClick}>
              Returns
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;