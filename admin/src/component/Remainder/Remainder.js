import React, { useState } from 'react';
import './Remainder.css';
import emailjs from 'emailjs-com';

export default function Remainder() {
  const [form30, setForm30] = useState({
    name: '',
    email: '',
    enabled: false,
    message: ''
  });

  const [form5, setForm5] = useState({
    name: '',
    email: '',
    enabled: false,
    message: ''
  });

  const handleChange = (e, formType) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    formType === '30'
      ? setForm30(prev => ({ ...prev, [name]: val }))
      : setForm5(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = (formData, label) => {
    const { name, email, message } = formData;
    if (!name.trim() || !message.trim()) {
      alert('Please fill in all required fields.');
      return false;
    }

    if (label === '30-minute') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
      }
    }

    return true;
  };

  const sendNotification = async (formData, label) => {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    const templateId =
      label === '30-minute'
        ? process.env.REACT_APP_EMAILJS_TEMPLATE_ID_30
        : process.env.REACT_APP_EMAILJS_TEMPLATE_ID_5;

    const templateParams =
      label === '30-minute'
        ? {
            name: formData.name,
            user_email: formData.email,
            from_email: 'pro13fessor3@gmail.com',
            custom_message: formData.message,
            subject: `30-minute Appointment Reminder`,
          }
        : {
            name: formData.name,
            custom_message: formData.message,
            user_email: formData.email,
          };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      alert(`${label} notification has been sent to ${formData.email || formData.name}!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send the notification. Please try again later.');
    }
  };

  const handleSubmit = (formData, label) => {
    if (!formData.enabled) {
      alert(`${label} reminder is not enabled.`);
      return;
    }
    if (!validateForm(formData, label)) return;
    sendNotification(formData, label);
  };

  return (
    <div className="remainder-container">
      <h1 className="remainder-header">
        <i className="fas fa-bell"></i> Appointment Reminders
      </h1>
      <p className="remainder-description">
        Notify patients before their appointments with custom messages.
      </p>

      <div className="reminder-card">
        <h2><i className="fas fa-clock"></i> 30 Minutes Before</h2>

        <div className="form-group">
          <label><i className="fas fa-user"></i> Patient Name</label>
          <input
            type="text"
            className="text-input"
            name="name"
            value={form30.name}
            onChange={(e) => handleChange(e, '30')}
            placeholder="Enter patient's name"
          />
        </div>

        <div className="form-group">
          <label><i className="fas fa-envelope"></i> Email Address</label>
          <input
            type="email"
            className="text-input"
            name="email"
            value={form30.email}
            onChange={(e) => handleChange(e, '30')}
            placeholder="Enter patient's email"
          />
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            name="enabled"
            checked={form30.enabled}
            onChange={(e) => handleChange(e, '30')}
          />
          <span>Enable this notification</span>
        </label>

        <label className="msg-label">Custom Message:</label>
        <textarea
          rows="3"
          className="msg-input"
          name="message"
          value={form30.message}
          onChange={(e) => handleChange(e, '30')}
          placeholder="e.g., Your appointment starts in 30 minutes."
        ></textarea>

        <button className="save-btn" onClick={() => handleSubmit(form30, '30-minute')}>
          <i className="fas fa-paper-plane"></i> Send Notification
        </button>
      </div>
      <div className="reminder-card">
        <h2><i className="fas fa-stopwatch"></i> 5 Minutes Before</h2>

        <div className="form-group">
          <label><i className="fas fa-user"></i> Patient Name</label>
          <input
            type="text"
            className="text-input"
            name="name"
            value={form5.name}
            onChange={(e) => handleChange(e, '5')}
            placeholder="Enter patient's name"
          />
        </div>

        <div className="form-group">
          <label><i className="fas fa-envelope"></i> Email Address (Optional)</label>
          <input
            type="email"
            className="text-input"
            name="email"
            value={form5.email}
            onChange={(e) => handleChange(e, '5')}
            placeholder="Enter patient's email"
          />
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            name="enabled"
            checked={form5.enabled}
            onChange={(e) => handleChange(e, '5')}
          />
          <span>Enable this notification</span>
        </label>

        <label className="msg-label">Custom Message:</label>
        <textarea
          rows="3"
          className="msg-input"
          name="message"
          value={form5.message}
          onChange={(e) => handleChange(e, '5')}
          placeholder="e.g., Your appointment begins in 5 minutes."
        ></textarea>

        <button className="save-btn" onClick={() => handleSubmit(form5, '5-minute')}>
          <i className="fas fa-paper-plane"></i> Send Notification
        </button>
      </div>
    </div>
  );
}
