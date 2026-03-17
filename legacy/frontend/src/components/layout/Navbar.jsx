import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { toggleSidebar, toggleCart, toggleSearch } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { sidebarOpen, cartOpen, searchOpen } = useSelector(state => state.ui);
  const cartItemCount = useSelector(selectCartItemCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      dispatch(toggleCart());
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="navbar">
        <div className="navbar-container">
          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <h1>Zenca Gamers</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            <Link to="/" className="navbar-link">
              Home
            </Link>
            <Link to="/shop" className="navbar-link">
              Shop
            </Link>
            <Link to="/about" className="navbar-link">
              About
            </Link>
            <Link to="/contact" className="navbar-link">
              Contact
            </Link>
          </div>

          {/* Right side actions */}
          <div className="navbar-actions">
            {/* Search button */}
            <button
              className={`navbar-btn ${searchOpen ? 'active' : ''}`}
              onClick={() => dispatch(toggleSearch())}
              aria-label="Toggle search"
            >
              <FaSearch />
            </button>

            {/* Cart button */}
            <button
              className={`navbar-btn cart-btn ${cartOpen ? 'active' : ''}`}
              onClick={handleCartClick}
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="navbar-btn user-btn" aria-label="User menu">
                  <FaUser />
                  <span className="user-name">{user?.username}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/dashboard" className="dropdown-item">
                    Dashboard
                  </Link>
                  <Link to="/dashboard/orders" className="dropdown-item">
                    My Orders
                  </Link>
                  <Link to="/dashboard/profile" className="dropdown-item">
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search bar (when active) */}
        {searchOpen && (
          <div className="search-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                autoFocus
              />
              <button className="search-submit">
                <FaSearch />
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;