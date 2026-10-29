import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginR, logoutR } from "../../../redux/authSlice";
import { clearCart } from "../../../redux/CartSlice";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userDetail = useSelector((state) => state.auth.userDetail);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("authToken");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });

  // Local state with immediate fallback to localStorage
  const [profile, setProfile] = useState(() => {
    if (userDetail && (userDetail.email || userDetail.userId || userDetail.userName || userDetail.name)) {
      return userDetail;
    }
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return userDetail || {};
      }
    }
    return userDetail || {};
  });

  useEffect(() => {
    if (userDetail && (userDetail.email || userDetail.userId || userDetail.userName || userDetail.name)) {
      setProfile(userDetail);
      setFormData({
        name: userDetail.userName || userDetail.name || "",
        mobile: userDetail.mobile || "",
      });
      return;
    }

    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.userId || parsed.userName || parsed.name)) {
          setProfile(parsed);
          setFormData({
            name: parsed.userName || parsed.name || "",
            mobile: parsed.mobile || "",
          });
          dispatch(loginR({ ...parsed, token }));
          return;
        }
      } catch (e) {}
    }

    if (token) {
      fetch("http://localhost:8080/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch user");
        })
        .then((data) => {
          if (data) {
            dispatch(loginR({ ...data, token }));
            setProfile(data);
            setFormData({
              name: data.userName || data.name || "",
              mobile: data.mobile || "",
            });
          }
        })
        .catch((err) => {
          console.warn("Could not fetch user info from /users/me:", err);
        });
    }
  }, [userDetail, token, dispatch]);

  const hasUser = isLogin || Boolean(token) || Boolean(profile?.email);

  if (!hasUser) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-card please-login-card">
          <div className="profile-avatar-placeholder">👤</div>
          <h2>Please Sign In</h2>
          <p>Sign in to access your profile, order history, and account settings.</p>
          <button className="primary-teal-btn" onClick={() => navigate("/login")}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const userId = profile?.userId || profile?.userID || "N/A";
  const email = profile?.email || "N/A";
  const mobile = profile?.mobile || "N/A";
  const role = (profile?.role || "user").toLowerCase();
  const emailPrefix = profile?.email ? profile.email.split("@")[0] : "";
  const rawName = profile?.userName || profile?.name;
  const displayName = (rawName && String(rawName).trim().length > 0) ? rawName : (emailPrefix || "User");
  const isAdmin = role === "admin";

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      userName: formData.name,
      name: formData.name,
      mobile: formData.mobile,
      token,
    };
    dispatch(loginR(updated));
    setProfile(updated);
    setIsEditing(false);
    alert("Profile details updated successfully!");
  };

  const handleLogout = () => {
    dispatch(logoutR());
    dispatch(clearCart());
    navigate("/login");
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-max-width">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-circle">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-user-name">{displayName}</h1>
            <p className="profile-user-email">{email}</p>
            <div className="profile-tags-row">
              <span className={`profile-role-badge ${isAdmin ? "admin" : "user"}`}>
                {isAdmin ? "🛡️ Store Administrator" : "👤 Verified Customer"}
              </span>
              <span className="account-status-badge">🟢 Active Account</span>
            </div>
          </div>
          <div className="profile-header-actions">
            <button
              className="secondary-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "✕ Cancel" : "✏️ Edit Profile"}
            </button>
            <button className="logout-teal-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Quick Nav Cards Grid */}
        <div className="profile-quick-nav-grid">
          <div className="quick-nav-card" onClick={() => navigate("/orders")}>
            <span className="quick-nav-icon">📦</span>
            <div className="quick-nav-text">
              <h3>Your Orders</h3>
              <p>Track packages, view receipts, and past purchases</p>
            </div>
          </div>

          <div className="quick-nav-card" onClick={() => navigate("/cart")}>
            <span className="quick-nav-icon">🛒</span>
            <div className="quick-nav-text">
              <h3>Shopping Cart</h3>
              <p>View saved items and proceed to checkout</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="quick-nav-card admin-card" onClick={() => navigate("/addproduct")}>
              <span className="quick-nav-icon">➕</span>
              <div className="quick-nav-text">
                <h3>Seller Portal</h3>
                <p>Add new products and manage store inventory</p>
              </div>
            </div>
          ) : (
            <div className="quick-nav-card" onClick={() => navigate("/contactus")}>
              <span className="quick-nav-icon">💬</span>
              <div className="quick-nav-text">
                <h3>Customer Support</h3>
                <p>Need help? Reach out to our 24/7 support team</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Details / Edit Section */}
        <div className="profile-details-card">
          <h2 className="section-title">
            {isEditing ? "Edit Account Information" : "Personal Information"}
          </h2>

          {isEditing ? (
            <form className="profile-edit-form" onSubmit={handleSaveProfile}>
              <div className="edit-form-group">
                <label className="edit-label">Full Name</label>
                <input
                  type="text"
                  className="edit-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label className="edit-label">Mobile Number</label>
                <input
                  type="tel"
                  className="edit-input"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="edit-form-actions">
                <button type="submit" className="primary-teal-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Customer ID</span>
                <span className="info-value">#{userId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{displayName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mobile Number</span>
                <span className="info-value">{mobile || "Not specified"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Role</span>
                <span className="info-value role-value">{role.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Security & Authentication</span>
                <span className="info-value">JWT Protected (Active)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
