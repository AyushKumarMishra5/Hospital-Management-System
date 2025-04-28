
import React, { useEffect, useState } from 'react';
import './Invoice.css';
import { useCart } from '../../context/CartContext';
import { FaCheckCircle, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';

export default function Invoice() {
  const { getCartTotal, clearCart } = useCart();
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    // Try to get the invoice data from localStorage first
    const savedInvoiceData = localStorage.getItem('invoiceData');
    
    if (savedInvoiceData) {
      // If there's saved invoice data, use it
      setInvoiceData(JSON.parse(savedInvoiceData));
    } else {
      // If no saved data, show message or redirect
      console.log("No invoice data found.");
    }
  }, []);

  const handlePrint = () => {
    // Clear the cart when invoice is generated
    clearCart();
    setInvoiceGenerated(true);
    window.print();
  };

  if (!invoiceData) return <div className="loading-invoice">Loading Invoice...</div>;

  return (
    <div className="invoice-container">
    <div className="invoice-card" id="invoice-content">
      <div className="invoice-header">
        <div className="billed-to">
          <div className="dot" />
          <p><strong>BILLED TO:</strong><br />
            {invoiceData.fromAddress}<br />
            {invoiceData.phone}<br />
            Xeno Health
          </p>
        </div>
        <div className="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice No.</strong> {invoiceData.orderId}</p>
          <p>{invoiceData.orderDate}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items && invoiceData.items.map(item => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>₹{Math.round(item.price * 83)}</td>
              <td>₹{Math.round(item.price * item.quantity * 83)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <p><strong>Subtotal:</strong> ₹{invoiceData.total}</p>
        <p><strong>Tax (0%):</strong> ₹0</p>
        <p className="total-due"><strong>Total Due:</strong> ₹{invoiceData.total}</p>
      </div>

      <p className="thank-you-text">Thank you for your Business!</p>

      <div className="footer-info">
        <div className="payment-info">
          <p><strong>PAYMENT INFORMATION</strong></p>
          <p>Bank Name: ABC Bank<br />
          Account Name: Xeno Health<br />
          Account No: 987-654-321</p>
        </div>
        <div className="company-address">
          <p><strong>Xeno Health</strong><br />
            987 Anywhere St., Mangalore, Bangalore 987650</p>
        </div>
      </div>
    </div>

    <button className="print-button" onClick={handlePrint} disabled={invoiceGenerated}>
      <FaPrint className="icon" /> {invoiceGenerated ? "Invoice Generated" : "Generate Invoice"}
    </button>
    {invoiceGenerated && <p className="success-message">Invoice generated and cart cleared successfully!</p>}
  </div>
  );
}
