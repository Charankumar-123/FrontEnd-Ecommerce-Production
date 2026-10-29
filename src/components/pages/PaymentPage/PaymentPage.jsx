import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addOrder } from "../../../redux/Actions/OrderActions";
import { clearCart } from "../../../redux/CartSlice";
import "./PaymentPage.css";

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank", icon: "🏦" },
  { id: "sbi", name: "State Bank of India", icon: "🏛️" },
  { id: "icici", name: "ICICI Bank", icon: "💳" },
  { id: "axis", name: "Axis Bank", icon: "🏦" },
  { id: "kotak", name: "Kotak Mahindra", icon: "🏛️" },
];

const WALLETS = [
  { id: "paytm", name: "Paytm Wallet", icon: "📱" },
  { id: "amazonpay", name: "Amazon Pay Balance", icon: "🛍️" },
  { id: "phonepe", name: "PhonePe Wallet", icon: "⚡" },
  { id: "mobikwik", name: "MobiKwik", icon: "👛" },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector(
    (state) => state.auth.userDetail?.userId || state.auth.userDetail?.userID
  );
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const reduxTotal = useSelector((state) => state.cart.total);

  const totalPrice =
    reduxTotal !== undefined && reduxTotal > 0
      ? reduxTotal
      : cartItems.reduce(
          (sum, item) => sum + (item.productInfo?.price || 0) * (item.quantity || 1),
          0
        );

  // Razorpay Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'
  const [processingState, setProcessingState] = useState("idle"); // 'idle' | 'processing' | 'success'
  const [paymentId, setPaymentId] = useState("");

  // Payment Form Inputs
  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [selectedWallet, setSelectedWallet] = useState("paytm");

  // Fill Test Card Helper
  const handleFillTestCard = () => {
    setCardData({
      number: "4111 2222 3333 4444",
      expiry: "12/28",
      cvv: "786",
      name: "John Doe",
    });
  };

  // Fill Test UPI Helper
  const handleFillTestUpi = () => {
    setUpiId("success@razorpay");
  };

  const handleOpenRazorpay = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty! Add products first.");
      navigate("/");
      return;
    }
    setShowRazorpayModal(true);
    setProcessingState("idle");
  };

  const handleSimulatePayment = () => {
    setProcessingState("processing");

    // Simulate authentic 2-second bank processing
    setTimeout(() => {
      const generatedId = "pay_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      setPaymentId(generatedId);
      setProcessingState("success");

      // Save order to backend / Redux
      const orderData = {
        userId,
        cartItems: cartItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.productInfo?.price || 0,
        })),
        totalPrice,
        paymentId: generatedId,
        paymentMethod: paymentTab.toUpperCase(),
      };

      try {
        dispatch(addOrder(orderData));
        dispatch(clearCart());
      } catch (err) {
        console.error("Order dispatch error:", err);
      }

      // Auto redirect to orders after 2.5 seconds
      setTimeout(() => {
        setShowRazorpayModal(false);
        navigate("/orders");
      }, 2500);
    }, 2000);
  };

  return (
    <div className="payment-page-wrapper">
      <div className="payment-max-width">
        <h1 className="payment-page-heading">Checkout & Payment</h1>

        <div className="checkout-two-columns">
          {/* Left Column: Order Summary & Review */}
          <div className="checkout-review-column">
            {/* Delivery Address Card */}
            <div className="checkout-card">
              <div className="card-section-header">
                <span className="step-number">1</span>
                <h3>Delivery Address</h3>
              </div>
              <div className="address-details">
                <strong>Default Shipping Address</strong>
                <p>Flat 402, Green Avenue, Tech City, Bangalore, KA - 560001</p>
                <small className="delivery-speed-tag">⚡ Guaranteed 1-Day Delivery Fulfilled by ModernStore</small>
              </div>
            </div>

            {/* Review Items Card */}
            <div className="checkout-card">
              <div className="card-section-header">
                <span className="step-number">2</span>
                <h3>Review Items in Cart ({cartItems.length})</h3>
              </div>

              {cartItems.length === 0 ? (
                <div className="no-items-card">
                  <p>Your cart is empty.</p>
                  <button className="primary-teal-btn" onClick={() => navigate("/")}>
                    Browse Store
                  </button>
                </div>
              ) : (
                <div className="checkout-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id || item.productId} className="checkout-item-row">
                      <img
                        src={item.productInfo?.image || "https://via.placeholder.com/80"}
                        alt={item.productInfo?.name}
                        className="checkout-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80?text=No+Image";
                        }}
                      />
                      <div className="checkout-item-info">
                        <h4>{item.productInfo?.name || "Product"}</h4>
                        <span className="qty-tag">Quantity: {item.quantity}</span>
                      </div>
                      <div className="checkout-item-price">
                        ₹{((item.productInfo?.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment Trigger Card */}
          <div className="checkout-action-column">
            <div className="payment-action-card">
              <h3 className="summary-title">Payment Summary</h3>

              <div className="payment-row">
                <span>Items Subtotal:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="payment-row">
                <span>Shipping & Handling:</span>
                <span className="free-text">FREE</span>
              </div>

              <div className="payment-row">
                <span>Taxes & Fees:</span>
                <span>Included</span>
              </div>

              <hr className="payment-divider" />

              <div className="payment-total-row">
                <span>Order Total:</span>
                <span className="total-amount">₹{totalPrice.toFixed(2)}</span>
              </div>

              {/* Razorpay Gateway Button */}
              <button
                className="razorpay-trigger-btn"
                onClick={handleOpenRazorpay}
                disabled={cartItems.length === 0}
              >
                <span className="rzp-btn-logo">💳</span>
                <span>Pay with Razorpay</span>
              </button>

              <div className="gateway-assurance-box">
                <div className="rzp-shield-text">
                  <span>🛡️ <strong>Razorpay Verified</strong> Gateway</span>
                </div>
                <small>Supports UPI, Cards, Netbanking, Wallets & COD</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY MODAL POPUP */}
      {showRazorpayModal && (
        <div className="razorpay-backdrop">
          <div className="razorpay-modal">
            {/* Modal Header */}
            <div className="razorpay-header">
              <div className="rzp-header-left">
                <div className="rzp-brand-logo">R</div>
                <div>
                  <h3 className="rzp-brand-name">ModernStore</h3>
                  <span className="rzp-test-tag">TEST MODE</span>
                </div>
              </div>
              <div className="rzp-header-right">
                <div className="rzp-amount">₹{totalPrice.toFixed(2)}</div>
                <button
                  className="rzp-close-btn"
                  onClick={() => setShowRazorpayModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Left Sidebar + Right Form */}
            {processingState === "idle" && (
              <div className="razorpay-body">
                {/* Left Navigation */}
                <div className="rzp-nav-sidebar">
                  <button
                    className={`rzp-nav-item ${paymentTab === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentTab("upi")}
                  >
                    <span>⚡ UPI / QR</span>
                  </button>
                  <button
                    className={`rzp-nav-item ${paymentTab === "card" ? "active" : ""}`}
                    onClick={() => setPaymentTab("card")}
                  >
                    <span>💳 Card</span>
                  </button>
                  <button
                    className={`rzp-nav-item ${paymentTab === "netbanking" ? "active" : ""}`}
                    onClick={() => setPaymentTab("netbanking")}
                  >
                    <span>🏦 Netbanking</span>
                  </button>
                  <button
                    className={`rzp-nav-item ${paymentTab === "wallet" ? "active" : ""}`}
                    onClick={() => setPaymentTab("wallet")}
                  >
                    <span>👛 Wallets</span>
                  </button>
                  <button
                    className={`rzp-nav-item ${paymentTab === "cod" ? "active" : ""}`}
                    onClick={() => setPaymentTab("cod")}
                  >
                    <span>💵 Pay on Delivery</span>
                  </button>
                </div>

                {/* Right Content Area */}
                <div className="rzp-content-area">
                  {/* TAB 1: UPI */}
                  {paymentTab === "upi" && (
                    <div className="rzp-tab-content">
                      <div className="qr-preview-box">
                        <div className="mock-qr-code">
                          <div className="qr-box-inner">
                            <span className="qr-scan-icon">📱</span>
                          </div>
                        </div>
                        <p className="qr-scan-text">
                          Scan QR using <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong>
                        </p>
                      </div>

                      <div className="or-divider">
                        <span>OR ENTER UPI ID</span>
                      </div>

                      <div className="upi-input-group">
                        <input
                          type="text"
                          placeholder="e.g. mobile@okhdfcbank"
                          className="rzp-input"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                        <button
                          type="button"
                          className="test-auto-btn"
                          onClick={handleFillTestUpi}
                        >
                          ⚡ Use Test ID
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CARD */}
                  {paymentTab === "card" && (
                    <div className="rzp-tab-content">
                      <div className="card-test-banner">
                        <span>Test card accepted for instant verification</span>
                        <button
                          type="button"
                          className="test-auto-btn"
                          onClick={handleFillTestCard}
                        >
                          ⚡ Fill Test Card
                        </button>
                      </div>

                      <div className="rzp-form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          className="rzp-input"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({ ...cardData, number: e.target.value })
                          }
                        />
                      </div>

                      <div className="rzp-form-row">
                        <div className="rzp-form-group">
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            className="rzp-input"
                            value={cardData.expiry}
                            onChange={(e) =>
                              setCardData({ ...cardData, expiry: e.target.value })
                            }
                          />
                        </div>
                        <div className="rzp-form-group">
                          <label>CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength="4"
                            className="rzp-input"
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({ ...cardData, cvv: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="rzp-form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="rzp-input"
                          value={cardData.name}
                          onChange={(e) =>
                            setCardData({ ...cardData, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: NETBANKING */}
                  {paymentTab === "netbanking" && (
                    <div className="rzp-tab-content">
                      <p className="tab-subheading">Select your bank:</p>
                      <div className="bank-list">
                        {POPULAR_BANKS.map((b) => (
                          <div
                            key={b.id}
                            className={`bank-option-pill ${
                              selectedBank === b.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedBank(b.id)}
                          >
                            <span className="bank-icon">{b.icon}</span>
                            <span className="bank-name">{b.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WALLETS */}
                  {paymentTab === "wallet" && (
                    <div className="rzp-tab-content">
                      <p className="tab-subheading">Choose your digital wallet:</p>
                      <div className="wallet-list">
                        {WALLETS.map((w) => (
                          <div
                            key={w.id}
                            className={`wallet-option-pill ${
                              selectedWallet === w.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedWallet(w.id)}
                          >
                            <span className="wallet-icon">{w.icon}</span>
                            <span className="wallet-name">{w.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: COD */}
                  {paymentTab === "cod" && (
                    <div className="rzp-tab-content cod-content">
                      <div className="cod-icon">💵</div>
                      <h4>Pay with Cash Upon Delivery</h4>
                      <p>
                        You can pay with Cash or UPI directly to the delivery executive when your package arrives at your doorstep.
                      </p>
                      <span className="cod-verified-tag">✓ No extra convenience charges</span>
                    </div>
                  )}

                  {/* Pay Button */}
                  <div className="rzp-action-footer">
                    <button
                      className="rzp-pay-now-btn"
                      onClick={handleSimulatePayment}
                    >
                      <span>🔒 Pay ₹{totalPrice.toFixed(2)}</span>
                    </button>
                    <div className="rzp-secured-by">
                      <span>Secured by <strong>Razorpay</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROCESSING OVERLAY */}
            {processingState === "processing" && (
              <div className="rzp-status-screen">
                <div className="rzp-spinner"></div>
                <h3>Processing Payment...</h3>
                <p>Contacting bank gateway and verifying transaction</p>
                <small>Please do not close this window or refresh.</small>
              </div>
            )}

            {/* SUCCESS OVERLAY */}
            {processingState === "success" && (
              <div className="rzp-status-screen success">
                <div className="success-checkmark">✓</div>
                <h3>Payment Successful!</h3>
                <p className="success-amount">₹{totalPrice.toFixed(2)} received</p>
                <div className="payment-id-badge">
                  Razorpay Payment ID: <strong>{paymentId}</strong>
                </div>
                <small className="redirect-note">Redirecting to your orders...</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
