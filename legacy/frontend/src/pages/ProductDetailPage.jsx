import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchProducts } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, isLoading, error } = useSelector(state => state.products);
  const { items: allProducts } = useSelector(state => state.products);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchProducts({ limit: 4 })); // For related products
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.images) {
      setSelectedImage(0);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        ...product,
        quantity: quantity
      }));
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const relatedProducts = allProducts
    .filter(p => p.id !== product?.id && p.category === product?.category)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images || [product.imageUrl || '/images/placeholder.jpg'];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="product-details">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="product-image"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="image-nav prev"
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="image-nav next"
                    onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                {product.averageRating && (
                  <div className="rating">
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
                      {product.averageRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
                <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="original-price">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Product Options */}
            <div className="product-options">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stockQuantity || 99)}
                  >
                    +
                  </button>
                </div>
              </div>

              {product.variants && (
                <div className="variant-selector">
                  <label>Options:</label>
                  <select>
                    {product.variants.map((variant, index) => (
                      <option key={index} value={variant}>
                        {variant}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn btn-primary btn-large add-to-cart"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <FaShoppingCart />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button className="btn btn-ghost btn-large wishlist">
                <FaHeart />
                Add to Wishlist
              </button>

              <button className="btn btn-ghost share">
                <FaShare />
                Share
              </button>
            </div>

            {/* Product Features */}
            {product.features && (
              <div className="product-features">
                <h3>Key Features</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviewCount || 0})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <h3>Product Description</h3>
                <div dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }} />
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-tab">
                <h3>Specifications</h3>
                {product.specifications ? (
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="spec-label">{key}</td>
                          <td className="spec-value">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <h3>Customer Reviews</h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < review.rating ? 'filled' : ''}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="review-author">{review.author}</span>
                          <span className="review-date">{review.date}</span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="related-card">
                  <div className="related-image">
                    <img
                      src={relatedProduct.imageUrl || '/images/placeholder.jpg'}
                      alt={relatedProduct.name}
                    />
                  </div>
                  <div className="related-info">
                    <h4>
                      <Link to={`/product/${relatedProduct.id}`}>{relatedProduct.name}</Link>
                    </h4>
                    <div className="related-price">${relatedProduct.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;