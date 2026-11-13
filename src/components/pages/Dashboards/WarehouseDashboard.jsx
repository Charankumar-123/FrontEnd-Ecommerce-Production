import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAuthToken, getStoredUser } from "../../../utils/cookieUtils";
import "./Dashboards.css";

const WarehouseDashboard = () => {
  const reduxToken = useSelector((state) => state.auth.token);
  const reduxUser = useSelector((state) => state.auth.userDetail);
  const rawToken = reduxToken || getAuthToken() || localStorage.getItem("authToken");
  const token = rawToken && rawToken !== "null" && rawToken !== "undefined" ? rawToken : null;
  const user = reduxUser || getStoredUser();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPick: 0,
    packedCount: 0,
    dispatchedCount: 0,
    deliveredCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [broadcastAlert, setBroadcastAlert] = useState(null);

  const fetchWarehouseData = useCallback(async () => {
    if (!token) {
      setError("Authentication missing. Please log in to access the Warehouse Portal.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [ordersRes, statsRes] = await Promise.all([
        fetch("http://localhost:8080/api/warehouse/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:8080/api/warehouse/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (ordersRes.status === 403 || statsRes.status === 403) {
        const currentRole = (user?.role || "CUSTOMER").toUpperCase();
        setError(`Access Denied (403): Your account role is "${currentRole}". This portal requires a "WAREHOUSE" or "ADMIN" role account. If you just restarted the server, please log out and log in again to refresh your security token.`);
        setLoading(false);
        return;
      }

      if (ordersRes.status === 401 || statsRes.status === 401) {
        setError("Session Expired (401): Please log out and sign in again to refresh your authorization token.");
        setLoading(false);
        return;
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error fetching warehouse orders:", err);
      setError("Network error while connecting to Warehouse service: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  const handleUpdateMilestone = async (orderId, newStatus, locationName) => {
    try {
      setActionLoadingId(orderId);
      const res = await fetch("http://localhost:8080/api/warehouse/update-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: newStatus,
          carrier: "ModernStore Express",
          location: locationName || "Bangalore Central Hub",
        }),
      });

      if (!res.ok) {
        throw new Error("Server rejected status update");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === orderId ? { ...ord, fulfillmentStatus: newStatus } : ord
        )
      );

      setBroadcastAlert({
        orderId,
        status: newStatus,
        message: `Order #${orderId} marked as ${newStatus}! Live WebSocket event pushed to customer tracking screen.`,
      });

      setTimeout(() => {
        setBroadcastAlert(null);
      }, 6000);

      // Refresh stats
      fetchWarehouseData();
    } catch (err) {
      console.error("Milestone update error:", err);
      alert("Failed to update milestone: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const displayName = user?.userName || user?.name || (user?.email ? user.email.split("@")[0] : "Operator");

  return (
    <div className="dashboard-page-container">
      {/* Header */}
      <div className="dashboard-header-strip">
        <div>
          <h1>🏭 Warehouse Fulfillment Center</h1>
          <p>
            Station: Bangalore Central Hub • Operator: <strong>{displayName}</strong>. Manage real customer pick, pack & dispatch queues.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchWarehouseData}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "6px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            🔄 Sync Orders Queue
          </button>
          <span className="dashboard-role-pill">ROLE: WAREHOUSE</span>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #f87171",
          color: "#991b1b",
          padding: "16px 20px",
          borderRadius: "10px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
        }}>
          <div>
            <strong>⚠️ Access Denied / Authentication Issue</strong>
            <div style={{ fontSize: "13.5px", marginTop: "4px" }}>{error}</div>
          </div>
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            style={{
              background: "#b91c1c",
              color: "#ffffff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              whiteSpace: "nowrap"
            }}
          >
            🔑 Log In with Authorized Role
          </button>
        </div>
      )}

      {broadcastAlert && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #10b981",
          color: "#065f46",
          padding: "14px 20px",
          borderRadius: "10px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
        }}>
          <span style={{ fontSize: "20px" }}>⚡</span>
          <div>
            <strong>WebSocket Broadcast Sent!</strong>
            <div style={{ fontSize: "13px" }}>{broadcastAlert.message}</div>
          </div>
        </div>
      )}

      {/* Real Warehouse KPIs */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-val">{loading ? "..." : (stats.totalOrders || orders.length)}</div>
            <div className="stat-label">Total Real Orders Placed</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#d97706" }}>
              {loading ? "..." : (stats.pendingPick || 0)}
            </div>
            <div className="stat-label">Pending Pick / Pack</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#2563eb" }}>
              {loading ? "..." : (stats.dispatchedCount || 0)}
            </div>
            <div className="stat-label">Dispatched / In-Transit</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#059669" }}>
              {loading ? "..." : (stats.deliveredCount || 0)}
            </div>
            <div className="stat-label">Delivered Orders</div>
          </div>
        </div>
      </div>

      {/* Real Orders Fulfillment Table */}
      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Active Customer Orders Fulfillment Queue</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Orders placed by customers in the store. Updating a stage broadcasts live events directly to the customer's tracking screen.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            ⏳ Loading customer order queue from PostgreSQL database...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "10px", marginTop: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
            <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No customer orders placed yet</h3>
            <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "460px", margin: "0 auto" }}>
              When a customer places an order from their cart, it will automatically appear in this fulfillment queue ready for picking, packing, and dispatch.
            </p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Total Value</th>
                <th>Current Status</th>
                <th>Fulfillment Action (Pushes Live to Customer)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const st = (ord.fulfillmentStatus || "ORDERED").toUpperCase();
                const isOperating = actionLoadingId === ord.orderId;

                return (
                  <tr key={ord.orderId}>
                    <td style={{ fontWeight: 800, color: "#0f766e" }}>#ORD-{ord.orderId}</td>
                    <td>
                      <div>
                        <strong>{ord.customerName}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{ord.customerEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} style={{ fontSize: "13px", color: "#1e293b", marginBottom: "2px" }}>
                            • <strong>{it.quantity}x</strong> {it.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      ₹{Number(ord.totalPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`dash-badge ${
                        st.includes("DELIVER") ? "green" :
                        st.includes("TRANSIT") ? "blue" :
                        st.includes("DISPATCH") ? "yellow" :
                        st.includes("PROCESS") || st.includes("PACK") ? "yellow" : "orange"
                      }`}>
                        {st}
                      </span>
                    </td>
                    <td>
                      {st === "ORDERED" && (
                        <button
                          className="dash-action-btn"
                          disabled={isOperating}
                          onClick={() => handleUpdateMilestone(ord.orderId, "PROCESSING", "Bangalore Warehouse Hub")}
                        >
                          {isOperating ? "Processing..." : "📦 Pick & Pack Order"}
                        </button>
                      )}

                      {st === "PROCESSING" && (
                        <button
                          className="dash-action-btn"
                          style={{ background: "#d97706" }}
                          disabled={isOperating}
                          onClick={() => handleUpdateMilestone(ord.orderId, "DISPATCHED", "Bangalore Hub Express Outward")}
                        >
                          {isOperating ? "Broadcasting..." : "🚀 Mark Dispatched (WebSocket)"}
                        </button>
                      )}

                      {st === "DISPATCHED" && (
                        <button
                          className="dash-action-btn"
                          style={{ background: "#2563eb" }}
                          disabled={isOperating}
                          onClick={() => handleUpdateMilestone(ord.orderId, "IN_TRANSIT", "Regional Logistics Sort Center")}
                        >
                          {isOperating ? "Broadcasting..." : "🚚 Handover to Courier (In-Transit)"}
                        </button>
                      )}

                      {st === "IN_TRANSIT" && (
                        <button
                          className="dash-action-btn"
                          style={{ background: "#059669" }}
                          disabled={isOperating}
                          onClick={() => handleUpdateMilestone(ord.orderId, "DELIVERED", "Customer Doorstep Delivery")}
                        >
                          {isOperating ? "Broadcasting..." : "🎉 Confirm Delivered"}
                        </button>
                      )}

                      {st === "DELIVERED" && (
                        <span style={{ color: "#059669", fontWeight: 700, fontSize: "13px" }}>
                          ✓ Completed & Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;
