import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutR } from "../../../redux/authSlice";
import { clearCart } from "../../../redux/CartSlice";
import { getAuthToken, getStoredUser } from "../../../utils/cookieUtils";
import "./NavigationBar.css";
import { useState } from "react";

const NavigationBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetail, isLogin } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token) || getAuthToken() || localStorage.getItem("authToken");
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Resilient user and role extraction
  let savedRole = userDetail?.role;
  let savedName = userDetail?.userName || userDetail?.name;
  if (!savedRole || !savedName) {
    try {
      const savedUser = getStoredUser() || JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        savedRole = savedRole || savedUser.role;
        savedName = savedName || savedUser.userName || savedUser.name || (savedUser.email ? savedUser.email.split("@")[0] : "");
      }
    } catch (e) {}
  }

  const role = (savedRole || "CUSTOMER").toString().trim().toUpperCase();
  const isAdmin = role === "ADMIN";
  const isSeller = role === "SELLER";
  const isInventory = role === "INVENTORY";
  const isWarehouse = role === "WAREHOUSE";
  const loggedIn = Boolean(isLogin || token);
  const displayName = savedName || "User";

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    dispatch(logoutR());
    dispatch(clearCart());
    navigate("/login");
  };

  return (
    <header className="main-navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link className="navbar-brand-link" to="/">
          <span className="navbar-logo-icon">🛍️</span>
          <span className="navbar-brand-text">ModernStore</span>
        </Link>

        {/* Global Search Bar */}
        <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search products, brands, deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="navbar-search-clear"
              onClick={() => {
                setSearchQuery("");
                navigate("/");
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button type="submit" className="navbar-search-btn" title="Search">
            🔍
          </button>
        </form>

        {/* Center Nav Links */}
        <nav className="navbar-center-links">
          <Link className="nav-item-link" to="/">
            Store
          </Link>

          {/* Customer / Universal Orders Link */}
          {loggedIn && (
            <Link className="nav-item-link" to="/orders">
              Orders
            </Link>
          )}

          {/* Seller / Admin links */}
          {(isSeller || isAdmin) && (
            <Link className="nav-item-link seller-highlight-link" to="/seller/dashboard">
              🏪 Seller Hub
            </Link>
          )}

          {(isSeller || isAdmin) && (
            <Link className="nav-item-link admin-highlight-link" to="/addproduct">
              ➕ Add Product
            </Link>
          )}

          {/* Inventory / Admin links */}
          {(isInventory || isAdmin) && (
            <Link className="nav-item-link inventory-highlight-link" to="/inventory/dashboard">
              📦 Inventory Hub
            </Link>
          )}

          {/* Warehouse / Admin links */}
          {(isWarehouse || isAdmin) && (
            <Link className="nav-item-link warehouse-highlight-link" to="/warehouse/dashboard">
              🏭 Warehouse Hub
            </Link>
          )}

          {/* Master Admin Console link */}
          {isAdmin && (
            <Link className="nav-item-link admin-console-link" to="/admin/dashboard">
              👑 Admin Console
            </Link>
          )}

          {!isAdmin && !isSeller && !isInventory && !isWarehouse && (
            <Link className="nav-item-link" to="/contactus">
              Contact
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-right-actions">
          {/* Cart Icon with Live Badge */}
          <Link className="cart-action-link" to="/cart" title="Shopping Cart">
            <span className="cart-icon">🛒</span>
            <span className="cart-text">Cart</span>
            {totalCartCount > 0 && (
              <span className="cart-badge-count">{totalCartCount}</span>
            )}
          </Link>

          {/* User Profile Pill / Auth Actions */}
          {loggedIn ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="user-pill-btn" title="View Profile">
                <span className="user-avatar-icon">👤</span>
                <span className="user-greeting">
                  Hi, <strong>{displayName}</strong>
                </span>
                <span className={`navbar-role-tag ${role.toLowerCase()}`}>
                  {role}
                </span>
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-wrapper">
              <Link className="nav-login-btn" to="/login">
                Sign In
              </Link>
              <Link className="nav-signup-btn" to="/signup">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Amazon-Style Sub-Navigation */}
      <div className="sub-navbar-header">
        <div className="sub-navbar-container">
          <button
            className="sub-nav-all-btn"
            onClick={() => navigate("/")}
            title="All Categories"
          >
            <span className="hamburger-icon">☰</span>
            <span>All Categories</span>
          </button>

          <div className="sub-nav-links-track">
            {/* Role-specific quick action pills */}
            {isAdmin && (
              <>
                <span
                  className="sub-nav-item admin-portal-tag"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  👑 Admin Console
                </span>
                <span
                  className="sub-nav-item seller-portal-tag"
                  onClick={() => navigate("/seller/dashboard")}
                >
                  🏪 Seller Central
                </span>
                <span
                  className="sub-nav-item inventory-portal-tag"
                  onClick={() => navigate("/inventory/dashboard")}
                >
                  📦 Inventory Control
                </span>
                <span
                  className="sub-nav-item warehouse-portal-tag"
                  onClick={() => navigate("/warehouse/dashboard")}
                >
                  🏭 Warehouse Portal
                </span>
              </>
            )}

            {isSeller && !isAdmin && (
              <>
                <span
                  className="sub-nav-item seller-portal-tag"
                  onClick={() => navigate("/seller/dashboard")}
                >
                  🏪 Seller Dashboard
                </span>
                <span
                  className="sub-nav-item"
                  onClick={() => navigate("/addproduct")}
                >
                  ➕ Add Listing
                </span>
              </>
            )}

            {isInventory && !isAdmin && (
              <span
                className="sub-nav-item inventory-portal-tag"
                onClick={() => navigate("/inventory/dashboard")}
              >
                📦 Inventory Console
              </span>
            )}

            {isWarehouse && !isAdmin && (
              <span
                className="sub-nav-item warehouse-portal-tag"
                onClick={() => navigate("/warehouse/dashboard")}
              >
                🏭 Warehouse Dispatch
              </span>
            )}

            {/* Standard Category / Store Navigation */}
            <span
              className="sub-nav-item deals-tag"
              onClick={() => navigate("/?filter=deals")}
            >
              ⚡ Today's Deals
            </span>
            <span
              className="sub-nav-item"
              onClick={() => navigate("/?category=Electronics")}
            >
              Electronics
            </span>
            <span
              className="sub-nav-item"
              onClick={() => navigate("/?category=Fashion")}
            >
              Fashion
            </span>
            <span
              className="sub-nav-item"
              onClick={() => navigate("/?category=Home")}
            >
              Home & Living
            </span>
            <span
              className="sub-nav-item"
              onClick={() => navigate("/?filter=bestsellers")}
            >
              Best Sellers
            </span>
            <span
              className="sub-nav-item"
              onClick={() => navigate("/contactus")}
            >
              Customer Service
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
