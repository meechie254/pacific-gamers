import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateQuantity, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items: cartItems, total } = useSelector(state => state.cart);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const applyPromoCode = () => {
    // Simple promo code logic - in real app, this would be validated with backend
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(total * 0.1);
    } else if (promoCode.toLowerCase() === 'save20') {
      setDiscount(total * 0.2);
    } else {
      setDiscount(0);
      alert('Invalid promo code');
    }
  };

  const subtotal = total;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = subtotal + tax + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/shop" className="btn btn-primary btn-large">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-header">
              <h2>Cart Items</h2>
              <button className="clear-cart-btn" onClick={handleClearCart}>
                <FaTrash />
                Clear Cart
              </button>
            </div>

            <div className="items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.imageUrl || '/images/placeholder.jpg'}
                      alt={item.name}
                    />
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    <p className="item-description">
                      {item.description?.substring(0, 100)}...
                    </p>
                    <div className="item-price">
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>

                  <div className="item-quantity">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-actions">
              <Link to="/shop" className="btn btn-ghost">
                <FaArrowLeft />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="promo-section">
              <h3>Promo Code</h3>
              <div className="promo-input">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={applyPromoCode}
                  disabled={!promoCode.trim()}
                >
                  Apply
                </button>
              </div>
              <p className="promo-hint">
                Try <strong>SAVE10</strong> or <strong>SAVE20</strong> for discounts
              </p>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <ul>
                <li>Free shipping on orders over $50</li>
                <li>Standard delivery: 3-5 business days</li>
                <li>Express delivery: 1-2 business days (+ $9.99)</li>
                <li>International shipping available</li>
              </ul>
            </div>

            {/* Checkout Button */}
            <Link to="/checkout" className="btn btn-primary btn-large checkout-btn">
              Proceed to Checkout
            </Link>

            {/* Payment Methods */}
            <div className="payment-methods">
              <h3>Accepted Payment Methods</h3>
              <div className="payment-icons">
                <span className="payment-method">💳 Credit Card</span>
                <span className="payment-method">💰 PayPal</span>
                <span className="payment-method">🏦 Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products or Recommendations */}
        <div className="cart-recommendations">
          <h2>You might also like</h2>
          <div className="recommendations-grid">
            {/* This would be populated with recommended products */}
            <div className="placeholder-recommendation">
              <p>Product recommendations will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;