import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { FaTimes, FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './CartSidebar.css';

const CartSidebar = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { items: cartItems, total } = useSelector(state => state.cart);

  const handleClose = () => {
    dispatch(closeCart());
  };

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cart-overlay" onClick={handleClose}></div>

      {/* Cart Sidebar */}
      <div className="cart-sidebar">
        <div className="cart-header">
          <div className="cart-title">
            <FaShoppingCart />
            <span>Shopping Cart ({cartItems.length})</span>
          </div>
          <button className="cart-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <Link to="/shop" className="btn btn-primary" onClick={handleClose}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.imageUrl || '/images/placeholder.jpg'}
                      alt={item.name}
                    />
                  </div>

                  <div className="item-details">
                    <h4 className="item-title">
                      <Link to={`/product/${item.id}`} onClick={handleClose}>
                        {item.name}
                      </Link>
                    </h4>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>

                  <div className="item-controls">
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

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{total > 50 ? 'Free' : '$9.99'}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${(total + (total > 50 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>

            {/* Cart Actions */}
            <div className="cart-actions">
              <Link
                to="/cart"
                className="btn btn-ghost view-cart-btn"
                onClick={handleClose}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                className="btn btn-primary checkout-btn"
                onClick={handleClose}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;