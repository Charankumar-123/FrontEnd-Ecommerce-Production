import React from "react";
import { useSelector } from "react-redux";
import "./Dashboards.css";

const InventoryDashboard = () => {
  const { userDetail } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-header-strip">
        <div>
          <h1>📊 Inventory & Stock Control Console</h1>
          <p>Operator: {userDetail?.userName || userDetail?.name || "Inventory Manager"}. Monitor stock levels, SKU counts, and reorder warnings.</p>
        </div>
        <span className="dashboard-role-pill">ROLE: INVENTORY</span>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-val">348</div>
            <div className="stat-label">Total SKUs Monitored</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#b91c1c" }}>4</div>
            <div className="stat-label">Low Stock Alerts</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <div className="stat-val">80 Units</div>
            <div className="stat-label">Inward Intake (Today)</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <div className="stat-val">15 Units</div>
            <div className="stat-label">Reserved in Checkouts</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <h2>Live Stock Monitoring & Reorder Levels</h2>
        </div>

        <table className="dash-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Physical Stock</th>
              <th>Threshold</th>
              <th>Status</th>
              <th>Audit Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SKU-ELEC-001</td>
              <td>Wireless Noise-Canceling Headphones</td>
              <td><strong>38 units</strong></td>
              <td>10 units</td>
              <td><span className="dash-badge green">Optimal</span></td>
              <td><button className="dash-action-btn">+ Restock Intake</button></td>
            </tr>
            <tr>
              <td>SKU-TECH-089</td>
              <td>Mechanical Gaming Keyboard RGB</td>
              <td><strong style={{ color: "#dc2626" }}>3 units</strong></td>
              <td>15 units</td>
              <td><span className="dash-badge orange">Low Stock Warning</span></td>
              <td><button className="dash-action-btn" style={{ background: "#dc2626" }}>Request Urgent Reorder</button></td>
            </tr>
            <tr>
              <td>SKU-HOME-033</td>
              <td>Stainless Steel Thermal Flask 1L</td>
              <td><strong>112 units</strong></td>
              <td>20 units</td>
              <td><span className="dash-badge green">Optimal</span></td>
              <td><button className="dash-action-btn">+ Restock Intake</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDashboard;

