import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import logo from '../components/asset/logo.png';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import Axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const Navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post('https://hospital-management-system-p9bo.onrender.com/login', { email, password })
      .then((result) => {
        console.log(result);
        onLogin();
        Navigate('/');
      })
      .catch((err) => console.log(err));

    console.log('Login attempt with:', { email, password, rememberMe });
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        <div className="login-about">
          <div className="login-logo">
            <img src={logo} alt="Xeno Health Logo" />
            <h2>Xeno Health</h2>
          </div>
          <div className="login-about-content">
            <h1>Welcome Back</h1>
            <p>Login to access your personalized healthcare dashboard and manage your medical services with ease.</p>
            <div className="login-features">
              <div className="login-feature">
                <span className="feature-icon">
                  <FaUser />
                </span>
                <span className="feature-text">Personal Health Records</span>
              </div>
              <div className="login-feature">
                <span className="feature-icon">
                  <FaArrowRight />
                </span>
                <span className="feature-text">Easy Appointment Booking</span>
              </div>
              <div className="login-feature">
                <span className="feature-icon">
                  <FaArrowRight />
                </span>
                <span className="feature-text">Secure Medical Information</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Login to Your Account</h2>
              <p>Please enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>

              <div className="login-divider">
                <span>OR</span>
              </div>

              <div className="social-login-buttons">
                <button type="button" className="google-login">
                  Continue with Google
                </button>
              </div>
            </form>

            <div className="signup-prompt">
              <p>Don't have an account?</p>
              <Link to="/signin" className="signup-link">
                Sign up now <FaArrowRight className="arrow-icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
