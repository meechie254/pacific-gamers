import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import { FaPlay, FaShoppingCart, FaStar } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading, error } = useSelector(state => state.products);

  useEffect(() => {
    // Fetch featured products
    dispatch(fetchProducts({ limit: 6, featured: true }));
  }, [dispatch]);

  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Level Up Your <span className="highlight">Gaming</span> Experience
          </h1>
          <p className="hero-subtitle">
            Discover premium gaming gear, latest titles, and exclusive deals.
            Your ultimate destination for all things gaming.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-large">
              <FaShoppingCart />
              Shop Now
            </Link>
            <Link to="/about" className="btn btn-ghost btn-large">
              <FaPlay />
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Zenca Gamers?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaShoppingCart />
              </div>
              <h3>Premium Products</h3>
              <p>Curated selection of high-quality gaming products from trusted brands.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaStar />
              </div>
              <h3>Expert Support</h3>
              <p>24/7 customer support and expert advice for all your gaming needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaPlay />
              </div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping to get your gear when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/shop" className="view-all-link">
              View All Products →
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" text="Loading featured products..." />
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">Failed to load products. Please try again later.</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.imageUrl || '/images/placeholder.jpg'}
                      alt={product.name}
                      loading="lazy"
                    />
                    {product.featured && <span className="badge featured">Featured</span>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-rating">
                      {product.averageRating && (
                        <>
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < Math.floor(product.averageRating) ? 'filled' : ''}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="rating-text">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-primary btn-full"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay in the Game</h2>
            <p>Get the latest updates on new releases, exclusive deals, and gaming news.</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;