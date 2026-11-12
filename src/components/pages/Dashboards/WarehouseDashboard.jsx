import React, { useState } from "react";
import { useSelector } from "react-redux";
import { sendTrackingStatusUpdate } from "../../../Services/WebSocketService";
import "./Dashboards.css";

const WarehouseDashboard = () => {
  const { userDetail } = useSelector((state) => state.auth);
  const [activeTasks, setActiveTasks] = useState([
    { id: "TASK-101", orderId: 1, customer: "Alex Mercer", item: "Wireless Headphones", bin: "Aisle 3, Rack B-04", status: "PENDING_PICK" },
    { id: "TASK-102", orderId: 2, customer: "Priya Sharma", item: "Men's Cotton Shirt", bin: "Aisle 1, Rack A-12", status: "PACKED" },
    { id: "TASK-103", orderId: 3, customer: "Rohan Patel", item: "Thermal Water Bottle", bin: "Aisle 4, Rack D-02", status: "PENDING_PICK" },
  ]);

  const [dispatchLoading, setDispatchLoading] = useState(false);

  const handleDispatch = async (task) => {
    try {
      setDispatchLoading(true);
      // Calls our existing WebSocket broadcast endpoint!
      await sendTrackingStatusUpdate(
        task.orderId,
        "DISPATCHED",
        "ModernStore Express",
        "Warehouse Central Hub, Bangalore"
      );

      // Update local task list
      setActiveTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "DISPATCHED" } : t))
      );
      alert(`Order #${task.orderId} marked as DISPATCHED! WebSocket event pushed to customer tracking timeline.`);
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Failed to dispatch: " + err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handlePack = (taskId) => {
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "PACKED" } : t))
    );
  };

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-header-strip">
        <div>
          <h1>🏭 Warehouse Fulfillment Center</h1>
          <p>Station: Bangalore Hub #1 • Staff: {userDetail?.userName || userDetail?.name || "Fulfillment Lead"}</p>
        </div>
        <span className="dashboard-role-pill">ROLE: WAREHOUSE</span>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-val">3</div>
            <div className="stat-label">Active Pick Queue</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-val">1</div>
            <div className="stat-label">Packed & Labeled</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <div className="stat-val">14</div>
            <div className="stat-label">Dispatched to Courier Today</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-val">18 mins</div>
            <div className="stat-label">Average Pack Time</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <h2>Order Fulfillment & Pick Queue (Aisle / Bin Locations)</h2>
        </div>

        <table className="dash-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Item to Pick</th>
              <th>Shelf / Bin Location</th>
              <th>Current Stage</th>
              <th>Fulfillment Action</th>
            </tr>
          </thead>
          <tbody>
            {activeTasks.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.id}</strong></td>
                <td>ORD-{t.orderId}</td>
                <td>{t.customer}</td>
                <td>{t.item}</td>
                <td><span className="dash-badge blue">📍 {t.bin}</span></td>
                <td>
                  <span className={`dash-badge ${t.status === "DISPATCHED" ? "green" : t.status === "PACKED" ? "yellow" : "orange"}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  {t.status === "PENDING_PICK" && (
                    <button className="dash-action-btn" onClick={() => handlePack(t.id)}>
                      ✓ Pick & Pack
                    </button>
                  )}
                  {t.status === "PACKED" && (
                    <button
                      className="dash-action-btn"
                      style={{ background: "#059669" }}
                      disabled={dispatchLoading}
                      onClick={() => handleDispatch(t)}
                    >
                      🚀 Handover to Courier (Broadcast)
                    </button>
                  )}
                  {t.status === "DISPATCHED" && (
                    <span style={{ color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                      ✓ Handed over
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseDashboard;

