import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './signin.css';
import { useNavigate } from 'react-router-dom';
import logo from '../components/asset/logo.png';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaPhone, FaUserMd } from 'react-icons/fa';
import Axios from 'axios';

const Signin = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const Navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post('https://hospital-management-system-p9bo.onrender.com/user', {firstName, lastName, email, phone, password, confirmPassword})
    .then(result => {
      console.log(result);
      Navigate('/login');
    })
    .catch(err => {
      console.log(err);
      alert("Something went wrong. Try again!");
    });
  };

  return (
    <div className="signin-container">
      <div className="signin-grid">
        <div className="signin-about">
          <div className="signin-logo">
            <img src={logo} alt="Xeno Health Logo" />
            <h2>Xeno Health</h2>
          </div>
          <div className="signin-about-content">
            <h1>Create an Account</h1>
            <p>Join Xeno Health to access premium healthcare services and manage your medical needs easily.</p>
            <div className="signin-features">
              <div className="signin-feature">
                <span className="feature-icon">
                  <FaUserMd />
                </span>
                <span className="feature-text">Access to Expert Doctors</span>
              </div>
              <div className="signin-feature">
                <span className="feature-icon">
                  <FaArrowRight />
                </span>
                <span className="feature-text">Priority Appointment Booking</span>
              </div>
              <div className="signin-feature">
                <span className="feature-icon">
                  <FaArrowRight />
                </span>
                <span className="feature-text">Easy Medical Records</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signin-form-container">
          <div className="signin-form-wrapper">
            <div className="signin-header">
              <h2>Create Your Account</h2>
              <p>Please fill in your information to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="signin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="firstName"
                      autoComplete='off'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="lastName"
                      autoComplete='off'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    autoComplete='off'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    autoComplete='off'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="password"
                      autoComplete='off'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      autoComplete='off'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-options">
                <div className="agree-terms">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                    required
                  />
                  <label htmlFor="agreeTerms">
                    I agree to the <a href="#" className="terms-link">Terms and Conditions</a>
                  </label>
                </div>
              </div>

              <button type="submit" className="signin-button">
                Create Account
              </button>

              <div className="signin-divider">
                <span>OR</span>
              </div>

              <div className="social-signin-buttons">
                <button type="button" className="google-signin">
                  Continue with Google
                </button>
              </div>
            </form>

            <div className="login-prompt">
              <p>Already have an account?</p>
              <Link to="/login" className="login-link">
                Login now <FaArrowRight className="arrow-icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
