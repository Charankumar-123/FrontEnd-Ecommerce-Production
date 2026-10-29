import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchOrders } from "../../../redux/Actions/OrderActions.jsx";
import { addToCart } from "../../../redux/CartSlice";
import { addItemToCart } from "../../../Services/CartService";
import "./OrdersPage.css";

const STATUS_STEPS = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];

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
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("authToken");

  let resolvedUserId = userDetail?.userId || userDetail?.userID;
  let resolvedName = userDetail?.userName || userDetail?.name;

  if (!resolvedUserId) {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        resolvedUserId = savedUser.userId || savedUser.userID;
        resolvedName = resolvedName || savedUser.userName || savedUser.name;
      }
    } catch (e) {}
  }

  const { orders = [], loading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'intransit' | 'delivered'
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    if (resolvedUserId) {
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
      dispatch(addToCart({ productId, quantity: 1 }));
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
                            className={`stepper-node ${idx <= currentStep ? "completed" : ""} ${
                              idx === currentStep ? "current" : ""
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

      {/* TRACK PACKAGE MODAL */}
      {selectedTrackOrder && (
        <div className="tracking-modal-backdrop" onClick={() => setSelectedTrackOrder(null)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Package Tracking Details</h3>
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
                  <strong>Carrier:</strong> ModernStore Express Delivery
                </div>
                <div>
                  <strong>Tracking ID:</strong> TRK-{(selectedTrackOrder.orderId * 89234).toString(16).toUpperCase()}
                </div>
              </div>

              <div className="tracking-timeline">
                <div className="timeline-event done">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-text">
                    <strong>Order Confirmed & Payment Verified</strong>
                    <small>Payment received via Razorpay</small>
                  </div>
                </div>

                <div className="timeline-event done">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-text">
                    <strong>Package Dispatched from Fulfillment Center</strong>
                    <small>ModernStore Central Hub, Bangalore</small>
                  </div>
                </div>

                <div className="timeline-event active">
                  <div className="timeline-dot">🚚</div>
                  <div className="timeline-text">
                    <strong>In Transit to Local Delivery Station</strong>
                    <small>Estimated arrival: Tomorrow, 8:00 PM</small>
                  </div>
                </div>

                <div className="timeline-event">
                  <div className="timeline-dot">○</div>
                  <div className="timeline-text">
                    <strong>Out for Delivery</strong>
                    <small>With local courier courier executive</small>
                  </div>
                </div>
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
