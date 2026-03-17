import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productsSlice';
import { FaSearch, FaFilter, FaSort, FaStar, FaShoppingCart } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ShopPage.css';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading, error } = useSelector(state => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(product => product.category))];
    return ['all', ...cats.filter(Boolean)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || product.price <= parseFloat(priceRange.max));

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder, priceRange]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <div className="shop-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Shop Gaming Products</h1>
          <p className="page-subtitle">
            Discover our curated collection of premium gaming gear and accessories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="shop-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="control-buttons">
            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
            </button>

            <div className="sort-dropdown">
              <button className="sort-button">
                <FaSort />
                Sort by: {sortBy} ({sortOrder})
              </button>
              <div className="sort-options">
                <button onClick={() => handleSortChange('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button onClick={() => handleSortChange('price')}>
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button onClick={() => handleSortChange('rating')}>
                  Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear All
              </button>
              <button className="btn btn-primary" onClick={() => setShowFilters(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading products..." />
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">Failed to load products. Please try again later.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.imageUrl || '/images/placeholder.jpg'}
                    alt={product.name}
                    loading="lazy"
                  />
                  {product.featured && <span className="badge featured">Featured</span>}
                  {product.discount && <span className="badge discount">-{product.discount}%</span>}
                </div>

                <div className="product-info">
                  <h3 className="product-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>

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
                          {product.averageRating.toFixed(1)} ({product.reviewCount || 0})
                        </span>
                      </>
                    )}
                  </div>

                  <div className="product-price">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <p className="product-description">
                    {product.description?.substring(0, 100)}...
                  </p>

                  <div className="product-actions">
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                    <button className="btn btn-ghost add-to-cart">
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;