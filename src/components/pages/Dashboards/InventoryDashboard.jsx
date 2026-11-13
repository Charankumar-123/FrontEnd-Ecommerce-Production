import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAuthToken, getStoredUser } from "../../../utils/cookieUtils";
import "./Dashboards.css";

const InventoryDashboard = () => {
  const reduxToken = useSelector((state) => state.auth.token);
  const reduxUser = useSelector((state) => state.auth.userDetail);
  const rawToken = reduxToken || getAuthToken() || localStorage.getItem("authToken");
  const token = rawToken && rawToken !== "null" && rawToken !== "undefined" ? rawToken : null;
  const user = reduxUser || getStoredUser();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSkus: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalUnits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventoryData = useCallback(async () => {
    if (!token) {
      setError("Authentication missing. Please log in to access the Inventory Console.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [listRes, statsRes] = await Promise.all([
        fetch("http://localhost:8080/api/inventory/stock-list", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:8080/api/inventory/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (listRes.status === 403 || statsRes.status === 403) {
        const currentRole = (user?.role || "CUSTOMER").toUpperCase();
        setError(`Access Denied (403): Your account role is "${currentRole}". This portal requires an "INVENTORY" or "ADMIN" role account. If you just restarted the server, please log out and log in again to refresh your security token.`);
        setLoading(false);
        return;
      }

      if (listRes.status === 401 || statsRes.status === 401) {
        setError("Session Expired (401): Please log out and sign in again to refresh your authorization token.");
        setLoading(false);
        return;
      }

      if (listRes.ok) {
        const listData = await listRes.json();
        setProducts(listData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error loading inventory stock data:", err);
      setError("Network error while connecting to Inventory service: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleAdjustStock = async (product) => {
    const pId = product.productId || product.id;
    const currentQty = product.quantity != null ? product.quantity : 0;
    const input = window.prompt(`Enter new stock quantity for "${product.name}":`, currentQty);

    if (input === null || input.trim() === "") return;
    const newQty = parseInt(input.trim(), 10);
    if (isNaN(newQty) || newQty < 0) {
      alert("Please enter a valid positive integer for quantity.");
      return;
    }

    try {
      setUpdatingId(pId);
      const res = await fetch(`http://localhost:8080/api/inventory/update-stock/${pId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock quantity");
      }

      // Update locally
      setProducts((prev) =>
        prev.map((p) => ((p.productId || p.id) === pId ? { ...p, quantity: newQty } : p))
      );

      fetchInventoryData();
    } catch (err) {
      console.error("Stock adjustment error:", err);
      alert("Error updating stock: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const displayName = user?.userName || user?.name || (user?.email ? user.email.split("@")[0] : "Inventory Lead");

  return (
    <div className="dashboard-page-container">
      {/* Header */}
      <div className="dashboard-header-strip">
        <div>
          <h1>📊 Inventory & Stock Control Console</h1>
          <p>
            Operator: <strong>{displayName}</strong>. Real-time SKU stock level tracking, threshold warnings, and audit intake.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchInventoryData}
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
            🔄 Sync Live Stock
          </button>
          <span className="dashboard-role-pill">ROLE: INVENTORY</span>
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

      {/* Real KPIs */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-val">{loading ? "..." : (stats.totalSkus || products.length)}</div>
            <div className="stat-label">Total Real SKUs Monitored</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#d97706" }}>
              {loading ? "..." : (stats.lowStockCount || 0)}
            </div>
            <div className="stat-label">Low Stock Alerts (&le; 5 units)</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#b91c1c" }}>
              {loading ? "..." : (stats.outOfStockCount || 0)}
            </div>
            <div className="stat-label">Out of Stock Listings</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-val" style={{ color: "#059669" }}>
              {loading ? "..." : `${stats.totalUnits || 0} Units`}
            </div>
            <div className="stat-label">Total Units on Shelves</div>
          </div>
        </div>
      </div>

      {/* Real Stock Level Monitoring Table */}
      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Real-Time Store Inventory & Stock Audit</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Live inventory rows stored in PostgreSQL <code>tbl_product</code>. Adjust quantities directly to update store availability.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            ⏳ Loading stock catalog from database...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "10px", marginTop: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏷️</div>
            <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No products in catalog</h3>
            <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "460px", margin: "0 auto" }}>
              There are no products listed in the store database yet. Once sellers publish items, they will appear here for stock control.
            </p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>SKU / ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Physical Stock</th>
                <th>Status</th>
                <th>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const pId = p.productId || p.id;
                const qty = p.quantity != null ? p.quantity : 0;
                const isLow = qty > 0 && qty <= 5;
                const isOut = qty <= 0;
                const isUpdating = updatingId === pId;

                return (
                  <tr key={pId}>
                    <td style={{ fontWeight: 800, color: "#475569" }}>#SKU-{pId}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <strong>{p.name}</strong>
                          {p.sellerId && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              Seller ID: #{p.sellerId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{p.category || "General"}</td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      ₹{Number(p.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <strong style={{ fontSize: "14px", color: isOut ? "#b91c1c" : isLow ? "#d97706" : "#059669" }}>
                        {qty} units
                      </strong>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="dash-badge red">Out of Stock</span>
                      ) : isLow ? (
                        <span className="dash-badge orange">Low Stock Warning</span>
                      ) : (
                        <span className="dash-badge green">Optimal Level</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="dash-action-btn"
                        disabled={isUpdating}
                        onClick={() => handleAdjustStock(p)}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        {isUpdating ? "Saving..." : "✏️ Adjust Stock"}
                      </button>
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

export default InventoryDashboard;
