import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../../../utils/cookieUtils";
import "./Dashboards.css";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const reduxToken = useSelector((state) => state.auth.token);
  const reduxUser = useSelector((state) => state.auth.userDetail);
  const token = reduxToken || getAuthToken() || localStorage.getItem("authToken");
  const user = reduxUser || getStoredUser();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalRevenue: 0,
    ordersCount: 0,
    totalUnitsSold: 0,
    sellerRating: 4.9,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSellerData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch dynamic stats
      const statsRes = await fetch("http://localhost:8080/api/seller/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch seller's own products
      const prodRes = await fetch("http://localhost:8080/api/seller/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }
      }
    } catch (err) {
      console.error("Error loading seller dashboard data:", err);
      setError("Unable to sync live seller metrics: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your listings?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/seller/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id && p.productId !== id));
        setStats((prev) => ({
          ...prev,
          activeListings: Math.max(0, prev.activeListings - 1),
        }));
      } else {
        alert("Failed to delete product. You can only delete products you own.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting product: " + err.message);
    }
  };

  const displayName = user?.userName || user?.name || (user?.email ? user.email.split("@")[0] : "Merchant");

  return (
    <div className="dashboard-page-container">
      {/* Header */}
      <div className="dashboard-header-strip">
        <div>
          <h1>🏪 Seller Central Portal</h1>
          <p>
            Welcome back, <strong>{displayName}</strong>! Manage your live store catalog, track sales, and fulfill orders.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchSellerData}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "6px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
            title="Refresh Live Data"
          >
            🔄 Sync Live Data
          </button>
          <span className="dashboard-role-pill">ROLE: SELLER</span>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Dynamic KPI Cards */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-val">{loading ? "..." : (products.length || stats.activeListings || 0)}</div>
            <div className="stat-label">Your Active Listings</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-val">
              {loading ? "..." : `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </div>
            <div className="stat-label">Total Realized Revenue</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <div className="stat-val">{loading ? "..." : (stats.ordersCount || 0)}</div>
            <div className="stat-label">Orders for Your Items</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-val">{stats.sellerRating || "4.9"} / 5</div>
            <div className="stat-label">Merchant Trust Score</div>
          </div>
        </div>
      </div>

      {/* Real Product Catalog Table */}
      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Your Listed Products Catalog</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Live inventory linked to your merchant account ID: <strong>#{user?.userID || user?.id || "N/A"}</strong>
            </p>
          </div>
          <button className="dash-action-btn" onClick={() => navigate("/addproduct")}>
            ➕ Add New Product
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            ⏳ Loading your live product catalog from database...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "10px", marginTop: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛍️</div>
            <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No products listed yet</h3>
            <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "460px", margin: "0 auto 20px auto" }}>
              You haven't listed any items in the store yet. Add your first item to start receiving customer orders!
            </p>
            <button
              className="dash-action-btn"
              onClick={() => navigate("/addproduct")}
              style={{ padding: "10px 24px", fontSize: "14px" }}
            >
              ➕ List Your First Product Now
            </button>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Listing ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Available Units</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const pId = item.productId || item.id;
                const inStock = (item.quantity || 0) > 0;
                return (
                  <tr key={pId}>
                    <td style={{ fontWeight: "700", color: "#475569" }}>#PRD-{pId}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: "600", color: "#0f172a" }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{item.category || "General"}</td>
                    <td style={{ fontWeight: "700", color: "#0f766e" }}>
                      ₹{Number(item.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", color: inStock ? "#1e293b" : "#dc2626" }}>
                        {item.quantity || 0} units
                      </span>
                    </td>
                    <td>
                      <span className={`dash-badge ${inStock ? "green" : "red"}`}>
                        {inStock ? "Active Listing" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="dash-action-btn"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          onClick={() => navigate(`/product/${pId}`)}
                          title="View on public storefront"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(pId, item.name)}
                          style={{
                            background: "transparent",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                          title="Remove listing from store"
                        >
                          🗑️ Delete
                        </button>
                      </div>
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

export default SellerDashboard;
