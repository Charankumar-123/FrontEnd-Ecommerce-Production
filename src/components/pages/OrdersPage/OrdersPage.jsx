import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchOrders } from "../../../redux/Actions/OrderActions.jsx";
import { setCartItems } from "../../../redux/CartSlice";
import { addItemToCart, getCartItems } from "../../../Services/CartService";
import { getAuthToken, getStoredUser } from "../../../utils/cookieUtils";
import {
  subscribeToOrderTracking,
  fetchOrderTracking,
} from "../../../Services/WebSocketService";
import "./OrdersPage.css";

const STATUS_STEPS = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];

const TRACKING_STEPS = [
  { key: "ORDERED", label: "Order Confirmed & Verified", desc: "Payment received & order processed", icon: "✓" },
  { key: "DISPATCHED", label: "Package Dispatched", desc: "Dispatched from ModernStore Central Hub", icon: "📦" },
  { key: "IN_TRANSIT", label: "In Transit", desc: "Moving towards regional delivery hub", icon: "🚚" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "With courier delivery executive", icon: "🛵" },
  { key: "DELIVERED", label: "Delivered", desc: "Successfully delivered to customer", icon: "🎉" },
];

const getTrackingStepIndex = (status) => {
  if (!status) return 0;
  const s = status.toUpperCase();
  if (s.includes("DELIVER")) return 4;
  if (s.includes("OUT")) return 3;
  if (s.includes("TRANSIT") || s.includes("SHIP")) return 2;
  if (s.includes("DISPATCH") || s.includes("PROCESS")) return 1;
  return 0; // ORDERED / CONFIRMED
};

const getStepIndex = (status) => {
  if (!status) return 0;
  const s = status.toUpperCase();
  if (s.includes("DELIVER")) return 3;
  if (s.includes("OUT")) return 2;
  if (s.includes("SHIP") || s.includes("TRANSIT")) return 1;
  return 0; // PENDING / CONFIRMED / ORDERED
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userDetail = useSelector((state) => state.auth.userDetail);
  const token = useSelector((state) => state.auth.token) || getAuthToken() || localStorage.getItem("authToken");

  let resolvedUserId = userDetail?.userId || userDetail?.userID;
  let resolvedName = userDetail?.userName || userDetail?.name;

  if (!resolvedUserId) {
    try {
      const savedUser = getStoredUser() || JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        resolvedUserId = savedUser.userId || savedUser.userID;
        resolvedName = resolvedName || savedUser.userName || savedUser.name;
      }
    } catch (e) { }
  }

  const { orders = [], loading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'intransit' | 'delivered'
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Live WebSocket Tracking states
  const [liveTracking, setLiveTracking] = useState(null);
  const [wsStatus, setWsStatus] = useState("DISCONNECTED"); // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'

  // WebSocket Subscription Lifecycle for Track Package
  useEffect(() => {
    if (!selectedTrackOrder) {
      setLiveTracking(null);
      setWsStatus("DISCONNECTED");
      return;
    }

    const orderId = selectedTrackOrder.orderId;

    // 1. Fetch initial tracking status via REST API
    fetchOrderTracking(orderId).then((data) => {
      if (data) {
        setLiveTracking(data);
      } else {
        setLiveTracking({
          orderId: orderId,
          status: selectedTrackOrder.status || "ORDERED",
          carrier: "ModernStore Express",
          trackingNumber: `TRK-${(orderId * 89234).toString(16).toUpperCase()}`,
        });
      }
    });

    // 2. Subscribe to WebSocket Topic /topic/order-tracking/{orderId}
    const client = subscribeToOrderTracking(
      orderId,
      (updatedPayload) => {
        console.log("Real-time tracking payload via WebSocket:", updatedPayload);
        setLiveTracking((prev) => ({
          ...prev,
          ...updatedPayload,
        }));
      },
      (connectionStatus) => {
        setWsStatus(connectionStatus);
      }
    );

    // 3. Unsubscribe / deactivate on cleanup
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [selectedTrackOrder]);

  useEffect(() => {
    if (resolvedUserId && resolvedUserId !== "undefined" && resolvedUserId !== "null") {
      dispatch(fetchOrders(resolvedUserId));
    }
  }, [dispatch, resolvedUserId]);

  const handleBuyAgain = async (item) => {
    if (!resolvedUserId) {
      navigate("/login");
      return;
    }
    const productId = item.productId || item.productOrderInfo?.id;
    if (!productId) return;

    try {
      await addItemToCart(resolvedUserId, productId, 1, token);
      const updatedCart = await getCartItems(resolvedUserId, token);
      dispatch(setCartItems(updatedCart));
      alert(`Added "${item.productOrderInfo?.name || "Product"}" to your cart!`);
      navigate("/cart");
    } catch (err) {
      console.error("Buy again error:", err);
      navigate("/cart");
    }
  };

  // Filter orders by tab
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter((order) => {
    if (activeTab === "all") return true;
    const s = (order.status || "").toUpperCase();
    if (activeTab === "delivered") return s.includes("DELIVER");
    if (activeTab === "intransit") return !s.includes("DELIVER") && !s.includes("CANCEL");
    return true;
  });

  return (
    <div className="orders-page-wrapper">
      <div className="orders-max-width">
        {/* Breadcrumb */}
        <div className="orders-breadcrumb">
          <span onClick={() => navigate("/")} className="crumb-link">Home</span>
          <span className="crumb-sep">›</span>
          <span onClick={() => navigate("/profile")} className="crumb-link">Your Account</span>
          <span className="crumb-sep">›</span>
          <span className="crumb-active">Your Orders</span>
        </div>

        {/* Header */}
        <div className="orders-header-row">
          <div>
            <h1 className="orders-main-title">Your Orders</h1>
            <p className="orders-subtitle">
              Track packages, view invoices, and manage past purchases.
            </p>
          </div>
          <button className="continue-shopping-btn" onClick={() => navigate("/")}>
            🛍️ Continue Shopping
          </button>
        </div>

        {/* Tab Filters */}
        <div className="orders-tabs-bar">
          <button
            className={`order-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Orders ({safeOrders.length})
          </button>
          <button
            className={`order-tab-btn ${activeTab === "intransit" ? "active" : ""}`}
            onClick={() => setActiveTab("intransit")}
          >
            In Transit & Dispatched
          </button>
          <button
            className={`order-tab-btn ${activeTab === "delivered" ? "active" : ""}`}
            onClick={() => setActiveTab("delivered")}
          >
            Delivered
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="orders-loading-state">
            <div className="orders-spinner"></div>
            <p>Fetching your order history...</p>
          </div>
        )}

        {error && (
          <div className="orders-error-alert">
            ⚠️ {error}
          </div>
        )}

        {/* Empty Orders View */}
        {!loading && filteredOrders.length === 0 && (
          <div className="empty-orders-card">
            <div className="empty-pkg-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {activeTab === "all"
                ? "You haven't placed any orders yet. Discover our trending products today!"
                : `No orders matching the "${activeTab}" filter.`}
            </p>
            <button className="primary-teal-btn" onClick={() => navigate("/")}>
              Explore Store
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="orders-stream">
            {filteredOrders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const items = order.orderItemsInfo || [];

              return (
                <div key={order.orderId} className="amazon-order-card">
                  {/* Order Top Strip (Amazon Style) */}
                  <div className="order-meta-strip">
                    <div className="meta-block">
                      <span className="meta-label">ORDER PLACED</span>
                      <span className="meta-val">Recently</span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">TOTAL</span>
                      <span className="meta-val highlight-price">
                        ₹{order.totalPrice ? Number(order.totalPrice).toFixed(2) : "0.00"}
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">SHIP TO</span>
                      <span className="meta-val">{resolvedName || "Customer"}</span>
                    </div>

                    <div className="meta-block order-id-block">
                      <span className="meta-label">ORDER # ORD-{order.orderId}</span>
                      <div className="meta-actions-links">
                        <button
                          className="link-action-btn"
                          onClick={() => setSelectedInvoiceOrder(order)}
                        >
                          View Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual 4-Step Stepper */}
                  <div className="order-stepper-container">
                    <div className="stepper-status-header">
                      <span className="delivery-status-pill">
                        {currentStep === 3 ? "✓ Delivered" : "🚚 Arriving Soon"}
                      </span>
                      <span className="estimated-arrival-text">
                        {currentStep === 3
                          ? "Package was handed directly to resident"
                          : "Estimated Delivery: Tomorrow by 8:00 PM"}
                      </span>
                    </div>

                    <div className="visual-stepper">
                      <div className="stepper-progress-bar">
                        <div
                          className="stepper-progress-fill"
                          style={{
                            width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <div className="stepper-nodes">
                        {STATUS_STEPS.map((stepName, idx) => (
                          <div
                            key={stepName}
                            className={`stepper-node ${idx <= currentStep ? "completed" : ""} ${idx === currentStep ? "current" : ""
                              }`}
                          >
                            <div className="node-circle">
                              {idx <= currentStep ? "✓" : idx + 1}
                            </div>
                            <span className="node-label">{stepName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="order-items-body">
                    {items.length === 0 ? (
                      <div className="no-items-notice">Order details processing...</div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.orderItemId || Math.random()}
                          className="order-item-entry"
                        >
                          {/* Image */}
                          <div className="item-thumbnail-box">
                            <img
                              src={
                                item.productOrderInfo?.image ||
                                "https://via.placeholder.com/100x90?text=Product"
                              }
                              alt={item.productOrderInfo?.name || "Product"}
                              className="item-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/100x90?text=No+Image";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="item-main-details">
                            <h4 className="item-title">
                              {item.productOrderInfo?.name || "Order Item"}
                            </h4>
                            <p className="item-snippet">
                              {item.productOrderInfo?.description ||
                                "Fulfilled by ModernStore Verified Seller"}
                            </p>
                            <div className="item-qty-price-row">
                              <span className="item-qty-tag">
                                Qty: <strong>{item.quantity || 1}</strong>
                              </span>
                              <span className="item-price-tag">
                                ₹{item.price ? Number(item.price).toFixed(2) : "0.00"}
                              </span>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="item-actions-column">
                            <button
                              className="order-action-btn primary"
                              onClick={() => handleBuyAgain(item)}
                            >
                              🛒 Buy it again
                            </button>

                            <button
                              className="order-action-btn secondary"
                              onClick={() => setSelectedTrackOrder(order)}
                            >
                              📍 Track Package
                            </button>

                            {item.productOrderInfo?.id && (
                              <Link
                                to={`/product/${item.productOrderInfo.id}`}
                                className="order-action-btn tertiary"
                              >
                                View Product Details
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRACK PACKAGE MODAL (REAL-TIME WEBSOCKET ENABLED) */}
      {selectedTrackOrder && (
        <div className="tracking-modal-backdrop" onClick={() => setSelectedTrackOrder(null)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ margin: 0 }}>📦 Live Package Tracking</h3>
                <span className={`ws-badge ${wsStatus.toLowerCase()}`}>
                  {wsStatus === "CONNECTED" ? "🟢 Connected" : wsStatus === "CONNECTING" ? "🟡 Connecting..." : "⚪ Offline"}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedTrackOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="tracking-meta-banner">
                <div>
                  <strong>Order ID:</strong> ORD-{selectedTrackOrder.orderId}
                </div>
                <div>
                  <strong>Carrier:</strong> {liveTracking?.carrier || "ModernStore Express Delivery"}
                </div>
                <div>
                  <strong>Tracking ID:</strong> {liveTracking?.trackingNumber || `TRK-${(selectedTrackOrder.orderId * 89234).toString(16).toUpperCase()}`}
                </div>
                {liveTracking?.location && (
                  <div>
                    <strong>Latest Location:</strong> 📍 {liveTracking.location}
                  </div>
                )}
                {liveTracking?.updatedAt && (
                  <div>
                    <strong>Last Updated:</strong> {new Date(liveTracking.updatedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* DYNAMIC REAL-TIME TIMELINE */}
              <div className="tracking-timeline">
                {TRACKING_STEPS.map((step, idx) => {
                  const currentIdx = getTrackingStepIndex(liveTracking?.status || selectedTrackOrder.status);
                  const isDone = idx < currentIdx;
                  const isActive = idx === currentIdx;

                  return (
                    <div
                      key={step.key}
                      className={`timeline-event ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                    >
                      <div className="timeline-dot">
                        {isDone ? "✓" : isActive ? step.icon : "○"}
                      </div>
                      <div className="timeline-text">
                        <strong>
                          {step.label}
                          {isActive && <span className="live-pulse-badge">LIVE</span>}
                        </strong>
                        <small>{step.desc}</small>
                        {isActive && liveTracking?.location && (
                          <small className="location-tag">📍 {liveTracking.location}</small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE WEBSOCKET MONITORING STATUS (STRICTLY READ-ONLY FOR CUSTOMERS) */}
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "14px 18px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: wsStatus === "CONNECTED" ? "#16a34a" : "#ca8a04",
                    boxShadow: wsStatus === "CONNECTED" ? "0 0 8px #16a34a" : "none"
                  }} />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#166534" }}>
                      {wsStatus === "CONNECTED" ? "Live Real-Time Tracking Active" : "Connecting to Logistics Feed..."}
                    </strong>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>
                      Real-time updates pushed from Warehouse & Courier appear here automatically.
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: "12px" }}>
                  AUTO-SYNC
                </span>
              </div>

              <button
                className="primary-teal-btn full-width"
                onClick={() => setSelectedTrackOrder(null)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="tracking-modal-backdrop" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🧾 Order Tax Invoice</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedInvoiceOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="invoice-body">
              <div className="invoice-brand-row">
                <div>
                  <span className="inv-logo">🛍️ ModernStore Retail Pvt Ltd</span>
                  <p className="inv-sub">GSTIN: 29AABCU9603R1ZM • Registered Marketplace</p>
                </div>
                <div className="inv-badge">PAID • VERIFIED</div>
              </div>

              <hr className="inv-divider" />

              <div className="inv-info-grid">
                <div>
                  <span className="inv-label">Invoice Number</span>
                  <strong>INV-{(selectedInvoiceOrder.orderId + 1000)}</strong>
                </div>
                <div>
                  <span className="inv-label">Order ID</span>
                  <strong>ORD-{selectedInvoiceOrder.orderId}</strong>
                </div>
                <div>
                  <span className="inv-label">Billed To</span>
                  <strong>{resolvedName || "Customer"}</strong>
                </div>
                <div>
                  <span className="inv-label">Payment Mode</span>
                  <strong>Razorpay Gateway (Online)</strong>
                </div>
              </div>

              <div className="invoice-items-table">
                <div className="table-row table-head">
                  <span>Item Description</span>
                  <span className="col-center">Qty</span>
                  <span className="col-right">Price</span>
                </div>
                {(selectedInvoiceOrder.orderItemsInfo || []).map((it, idx) => (
                  <div key={idx} className="table-row">
                    <span>{it.productOrderInfo?.name || "Product"}</span>
                    <span className="col-center">{it.quantity || 1}</span>
                    <span className="col-right">
                      ₹{it.price ? Number(it.price).toFixed(2) : "0.00"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="inv-total-section">
                <div className="inv-total-row">
                  <span>Shipping:</span>
                  <span className="free-tag">FREE</span>
                </div>
                <div className="inv-total-row grand-total">
                  <span>Total Amount Paid:</span>
                  <span>
                    ₹{selectedInvoiceOrder.totalPrice
                      ? Number(selectedInvoiceOrder.totalPrice).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>

              <button
                className="print-invoice-btn"
                onClick={() => window.print()}
              >
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
