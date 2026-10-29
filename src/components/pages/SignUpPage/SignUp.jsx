import React, { useState, useEffect } from "react";
import { signup } from "../../../Services/UserService";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    userName: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    setUserData({
      userName: "",
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "user",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "userName") {
      setUserData({ ...userData, userName: value, name: value });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setUserData({ ...userData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userName: userData.userName || userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password,
        role: userData.role,
      };

      const response = await signup(payload);
      if (response && response.status) {
        alert(`Account created successfully as ${userData.role === "admin" ? "Admin" : "Customer"}! Redirecting to login...`);
        navigate("/login");
      } else {
        alert(response?.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-name">ModernStore</span>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join us to shop, track orders, or manage your store</p>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              name="userName"
              placeholder="e.g. Victor Smith"
              className="signup-input"
              value={userData.userName}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="signup-input"
              value={userData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="10-digit mobile number"
              className="signup-input"
              value={userData.mobile}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group password-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 6 characters"
                className="signup-input password-field"
                value={userData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈 Hide" : "👁️ Show"}
              </button>
            </div>
          </div>

          {/* Prominent Role Selector */}
          <div className="role-selector-wrapper">
            <label className="role-selector-label">Account Role</label>
            <div className="role-cards-container">
              <div
                className={`role-option-card ${userData.role === "user" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("user")}
              >
                <div className="role-card-header">
                  <span className="role-icon">👤</span>
                  <span className="role-name">Customer</span>
                </div>
                <small className="role-description">Browse products, cart & track orders</small>
              </div>

              <div
                className={`role-option-card ${userData.role === "admin" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("admin")}
              >
                <div className="role-card-header">
                  <span className="role-icon">🛡️</span>
                  <span className="role-name">Admin / Seller</span>
                </div>
                <small className="role-description">Manage inventory & add new products</small>
              </div>
            </div>
          </div>

          <button type="submit" className="signup-button">
            Create {userData.role === "admin" ? "Admin" : "Customer"} Account
          </button>

          <p className="login-text">
            Already have an account?{" "}
            <span className="login-link" onClick={() => navigate("/login")}>
              Log in here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
