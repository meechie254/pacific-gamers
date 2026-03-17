import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingCart } from 'react-icons/fa';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="error-content">
          {/* Error Code */}
          <div className="error-code">
            <span className="number">4</span>
            <span className="number">0</span>
            <span className="number">4</span>
          </div>

          {/* Error Message */}
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            Oops! The page you're looking for doesn't exist.
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="error-actions">
            <Link to="/" className="btn btn-primary btn-large">
              <FaHome />
              Go Home
            </Link>

            <Link to="/shop" className="btn btn-ghost btn-large">
              <FaShoppingCart />
              Shop Now
            </Link>

            <button
              className="btn btn-outline btn-large"
              onClick={() => window.history.back()}
            >
              <FaSearch />
              Go Back
            </button>
          </div>

          {/* Search Suggestion */}
          <div className="search-suggestion">
            <h3>Looking for something specific?</h3>
            <p>Try searching for products or browse our categories:</p>
            <div className="suggestion-links">
              <Link to="/shop?category=gaming-pcs">Gaming PCs</Link>
              <Link to="/shop?category=laptops">Gaming Laptops</Link>
              <Link to="/shop?category=headsets">Headsets</Link>
              <Link to="/shop?category=keyboards">Keyboards</Link>
              <Link to="/shop?category=mice">Gaming Mice</Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="help-section">
            <h3>Need Help?</h3>
            <p>
              If you believe this is an error, please{' '}
              <Link to="/contact">contact our support team</Link> and we'll help you find what you're looking for.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;