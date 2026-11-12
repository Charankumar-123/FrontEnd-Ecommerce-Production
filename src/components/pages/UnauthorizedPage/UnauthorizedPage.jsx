import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UnauthorizedPage.css";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const attemptedRole = state.attemptedRole || "Your account";
  const requiredRoles = state.requiredRoles || ["Authorized Personnel"];

  return (
    <div className="unauth-container">
      <div className="unauth-card">
        <div className="unauth-icon-badge">🔒</div>
        <h1 className="unauth-title">Access Denied</h1>
        <p className="unauth-subtitle">
          You do not have the required permissions to view this portal.
        </p>

        <div className="unauth-details-box">
          <div>
            <strong>Your Active Role:</strong> <span className="role-tag current">{attemptedRole}</span>
          </div>
          <div>
            <strong>Required Role(s):</strong>{" "}
            {requiredRoles.map((r) => (
              <span key={r} className="role-tag required">{r}</span>
            ))}
          </div>
        </div>

        <div className="unauth-actions">
          <button className="unauth-btn primary" onClick={() => navigate("/")}>
            ← Return to Storefront
          </button>
          <button className="unauth-btn secondary" onClick={() => navigate("/profile")}>
            View Account Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

