import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { authAPI } from "../services/api";
import "../Styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    zipcode: "",
    password: "",
    confirmPass: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP Modal States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.first_name || !formData.last_name || 
        !formData.email || !formData.phone_number || !formData.address || 
        !formData.zipcode || !formData.password || !formData.confirmPass) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const response = await authAPI.register({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        zipcode: formData.zipcode,
        password: formData.password,
      });

      // Show OTP modal
      setRegisteredEmail(response.email || formData.email);
      setShowOTPModal(true);
      alert(response.message || "Registration successful! Please verify your email with OTP.");
      
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
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
      // Verify OTP and get token
      const response = await authAPI.verifyOTP(registeredEmail, otpCode);

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      alert(response.message || "Email verified successfully!");
      
      // Close modal and navigate to home
      setShowOTPModal(false);
      navigate('/');

    } catch (error) {
      console.error("OTP verification error:", error);
      alert(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authAPI.resendOTP(registeredEmail);
      alert(response.message || "New OTP sent to your email!");
      setOtpCode("");
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(error.message || "Failed to resend OTP.");
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-card">
          <button className="back-btn" onClick={() => navigate("/login")}>
            ← Back to Login
          </button>

          <div className="logo-container">
            <img src="/img/logo.png" alt="Logo" className="logo" />
          </div>

          <h2 className="store-name">JAKE STORE</h2>
          <h3 className="subtitle">Create Account</h3>

          <form onSubmit={handleRegister}>
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              placeholder="Enter phone number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Zipcode</label>
            <input
              type="text"
              name="zipcode"
              placeholder="Enter zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              disabled={loading}
            />

            <label className="form-label">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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

            <label className="form-label">Confirm Password</label>
            <div className="password-container">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPass"
                placeholder="Confirm your password"
                value={formData.confirmPass}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>

            <div className="bottom-text">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal show={showOTPModal} onHide={() => !loading && setShowOTPModal(false)} centered>
        <Modal.Header closeButton={!loading}>
          <Modal.Title>Verify Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleOTPSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Enter 6-digit code sent to {registeredEmail}</Form.Label>
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
                disabled={loading}
              >
                Resend OTP
              </Button>
            </div>

            <Button
              variant="success"
              type="submit"
              className="w-100"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Register;