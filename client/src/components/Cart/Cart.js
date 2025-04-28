
import React from 'react';
import './Cart.css';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    const savedAddress = JSON.parse(localStorage.getItem('userAddress'));

    const invoiceData = {
      orderId: 'ORD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
      orderDate: new Date().toLocaleString(),
      fromAddress: savedAddress
        ? `${savedAddress.street}, ${savedAddress.city}, ${savedAddress.state} - ${savedAddress.pin}`
        : 'Xeno Health, Bangalore, Karnataka - 560001',
      phone: savedAddress?.phone || 'N/A',
      paymentMethod: 'Online Payment (UPI)',
      deliveryEstimate: '8 April 2025',
      status: 'Confirmed',
      items: cartItems,
      total: Math.round(getCartTotal() * 83),
    };

    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    navigate('/invoices');
  };


  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <p>{cartItems.length} items in your cart</p>
      </div>

      <div className="cart-content">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h3>Your cart is empty</h3>
            <p>Add some medicines to your cart to see them here</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">₹{Math.round(item.price * 83).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <div className="item-total">
                    ₹{Math.round((item.price * item.quantity) * 83).toLocaleString('en-IN')}
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{Math.round(getCartTotal() * 83).toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-item total">
                <span>Total</span>
                <span>₹{Math.round(getCartTotal() * 83).toLocaleString('en-IN')}</span>
              </div>
              <button className="checkout-button" onClick={handleCheckout}>
                <span>Proceed to Checkout</span>
                <FaArrowRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart; 