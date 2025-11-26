import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { authAPI } from "../services/api";
import "../Styles/Login.css";

function Login({ handleLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP Modal States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Call login API (sends OTP)
      const response = await authAPI.login({
        login_id: email,
        password: password,
      });

      // Show OTP modal
      setOtpEmail(response.email || email);
      setShowOTPModal(true);
      alert(response.message || "OTP sent to your email!");
      
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      alert("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      // Step 2: Verify OTP and get token
      const response = await authAPI.verifyOTP(otpEmail, otpCode);

      // Store token
      localStorage.setItem('authToken', response.token);
      
      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      // Close modal
      setShowOTPModal(false);

      // Call parent handleLogin if exists
      if (handleLogin) {
        handleLogin(response.user);
      }

      alert(response.message || "Login successful!");

      // Navigate based on user role
      if (response.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error("OTP verification error:", error);
      alert(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await authAPI.resendOTP(otpEmail);
      alert(response.message || "New OTP sent to your email!");
      setOtpCode(""); // Clear previous code
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>

          <div className="logo-container">
            <img src="/img/logo.png" alt="Logo" className="logo" />
          </div>

          <h2 className="store-name">JAKE STORE</h2>
          <h3 className="subtitle">Welcome Back!</h3>
          <p>Login to your account</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <label className="form-label">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>

            <div className="bottom-text">
              <Link to="/forgot">Forgot Password?</Link>
              <br />
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal show={showOTPModal} onHide={() => !loading && setShowOTPModal(false)} centered>
        <Modal.Header closeButton={!loading}>
          <Modal.Title>Verify OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleOTPSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Enter 6-digit code sent to {otpEmail}</Form.Label>
              <Form.Control
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={loading}
                autoFocus
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">Didn't receive code?</small>
              <Button
                variant="link"
                size="sm"
                onClick={handleResendOTP}
                disabled={loading || resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </Button>
            </div>

            <Button
              variant="success"
              type="submit"
              className="w-100"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Login;