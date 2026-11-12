import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Dashboards.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userDetail } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-header-strip">
        <div>
          <h1>👑 Master Administration Console</h1>
          <p>System Administrator: {userDetail?.userName || userDetail?.name || "Admin"}. Full platform governance and role supervision.</p>
        </div>
        <span className="dashboard-role-pill" style={{ background: "#f43f5e", color: "#ffffff" }}>
          ROLE: SUPER ADMIN
        </span>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-val">1,248</div>
            <div className="stat-label">Total Platform Users</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <div className="stat-val">34</div>
            <div className="stat-label">Active Sellers</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-info">
            <div className="stat-val">2 Hubs</div>
            <div className="stat-label">Warehouse Facilities</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">📡</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#059669" }}>ONLINE</div>
            <div className="stat-label">WebSocket Message Broker</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <h2>Direct Portals Access (Admin Override)</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "18px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>🏪 Seller Portal</h3>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0" }}>Review listings, merchant catalog, and sales records.</p>
            <button className="dash-action-btn" onClick={() => navigate("/seller/dashboard")}>
              Launch Seller Portal →
            </button>
          </div>

          <div style={{ padding: "18px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>📊 Inventory Console</h3>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0" }}>Audit stock counts, SKUs, and reorder alerts.</p>
            <button className="dash-action-btn" onClick={() => navigate("/inventory/dashboard")}>
              Launch Inventory Console →
            </button>
          </div>

          <div style={{ padding: "18px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>🏭 Warehouse Fulfillment</h3>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0" }}>Manage pick tasks, shelf allocations, and courier dispatch.</p>
            <button className="dash-action-btn" onClick={() => navigate("/warehouse/dashboard")}>
              Launch Warehouse Hub →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

