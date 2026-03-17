import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToWishlist, removeFromWishlist } from '../store/cartSlice';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product, isWishlisted = false }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = async () => {
        if (!user) {
            toast.info('Please login to add items to cart');
            return;
        }

        if (product.stockQuantity <= 0) {
            toast.error('Product out of stock');
            return;
        }

        setIsAddingToCart(true);
        try {
            await dispatch(addToCart({
                productId: product.id,
                quantity: 1,
                product
            })).unwrap();
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (!user) {
            toast.info('Please login to manage wishlist');
            return;
        }

        try {
            if (isWishlisted) {
                await dispatch(removeFromWishlist(product.id)).unwrap();
                toast.success('Removed from wishlist');
            } else {
                await dispatch(addToWishlist(product)).unwrap();
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <article className="product-card-modern">
            {/* Product Image */}
            <div className="product-image-container">
                {!imageLoaded && <div className="image-skeleton"></div>}
                <img
                    src={product.imageUrl || '/images/placeholder.jpg'}
                    alt={product.name}
                    className={`product-image ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Wishlist Button */}
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={isWishlisted ? 'currentColor' : 'none'}
                        />
                    </svg>
                </button>

                {/* Stock Status */}
                {product.stockQuantity <= 0 && (
                    <div className="stock-badge out-of-stock">Out of Stock</div>
                )}
                {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                    <div className="stock-badge low-stock">Only {product.stockQuantity} left</div>
                )}
                {product.featured && (
                    <div className="stock-badge featured">Featured</div>
                )}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <div className="product-header">
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
                                    {product.averageRating.toFixed(1)} ({product.reviewCount})
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <p className="product-description">{product.description}</p>

                <div className="product-footer">
                    <div className="price-section">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="original-price">{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>

                    <button
                        className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''}`}
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity <= 0 || isAddingToCart}
                    >
                        {isAddingToCart ? (
                            <div className="spinner"></div>
                        ) : product.stockQuantity <= 0 ? (
                            'Out of Stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;