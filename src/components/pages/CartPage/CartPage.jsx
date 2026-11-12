import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartProductCard from "../../Cards/CartProductCard/CartProductCard.jsx";
import { setCartItems, setTotalPrice } from "../../../redux/CartSlice";
import { addOrder } from "../../../redux/Actions/OrderActions.jsx";
import {
  getCartItems,
  getTotalCartPrice,
  updateCartQuantity,
  removeItemFromCart,
} from "../../../Services/CartService";
import { getAuthToken } from "../../../utils/cookieUtils";
import "./CartPage.css";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cartItems, setCartItemsState] = useState([]);
  const [totalPrice, setTotalPriceState] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = useSelector(
    (state) => state.auth.userDetail?.userId || state.auth.userDetail?.userID
  );
  const token = useSelector((state) => state.auth.token) || getAuthToken() || localStorage.getItem("authToken");

  const fetchCartData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const items = await getCartItems(userId, token);
      const safeItems = Array.isArray(items) ? items : [];
      setCartItemsState(safeItems);
      dispatch(setCartItems(safeItems));

      // Calculate reliable sum from items
      const itemsSum = safeItems.reduce((acc, it) => {
        const unit = Number(it.productInfo?.price) || Number(it.price) || 0;
        const qty = Number(it.quantity) || 1;
        return acc + unit * qty;
      }, 0);

      const priceRes = await getTotalCartPrice(userId, token);
      // If backend returns a valid positive number, use it; otherwise use itemsSum
      const computedTotal = (typeof priceRes === "number" && !isNaN(priceRes) && priceRes > 0)
        ? priceRes
        : itemsSum;

      setTotalPriceState(computedTotal);
      dispatch(setTotalPrice(computedTotal));
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [userId, token]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    // Optimistically update quantity locally
    const updated = cartItems.map((it) => {
      if (it.productId === productId || it.productInfo?.id === productId) {
        return { ...it, quantity: newQuantity };
      }
      return it;
    });
    setCartItemsState(updated);
    const updatedTotal = updated.reduce((acc, it) => {
      const unit = Number(it.productInfo?.price) || Number(it.price) || 0;
      const qty = Number(it.quantity) || 1;
      return acc + unit * qty;
    }, 0);
    setTotalPriceState(updatedTotal);

    try {
      await updateCartQuantity(userId, productId, newQuantity, token);
      await fetchCartData();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      await fetchCartData();
    }
  };

  const handleRemoveItem = async (productId) => {
    // 1. Optimistically remove item from UI immediately
    const remaining = cartItems.filter(
      (it) => it.productId !== productId && it.productInfo?.id !== productId
    );
    setCartItemsState(remaining);
    dispatch(setCartItems(remaining));

    const remainingTotal = remaining.reduce((acc, it) => {
      const unit = Number(it.productInfo?.price) || Number(it.price) || 0;
      const qty = Number(it.quantity) || 1;
      return acc + unit * qty;
    }, 0);
    setTotalPriceState(remainingTotal);
    dispatch(setTotalPrice(remainingTotal));

    // 2. Call backend DELETE API
    try {
      await removeItemFromCart(userId, productId, token);
    } catch (error) {
      console.error("Error removing cart item from backend:", error);
    } finally {
      // Re-sync with backend
      await fetchCartData();
    }
  };

  const handleProceedToBuy = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) return;

    const orderData = {
      userId,
      cartItems: cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.productInfo?.price || 0,
      })),
      totalPrice,
    };

    try {
      await dispatch(addOrder(orderData));
      navigate("/payment");
    } catch (error) {
      console.error("Error initiating checkout:", error);
      navigate("/payment");
    }
  };

  const totalItemsCount = cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);

  if (loading) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-loading">
          <div className="cart-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-max-width">
        <h1 className="cart-main-heading">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your ModernStore Cart is empty</h2>
            <p>Your shopping cart is waiting for you. Explore our collection of premium products.</p>
            <button className="cart-shop-now-btn" onClick={() => navigate("/")}>
              Explore Store
            </button>
          </div>
        ) : (
          <div className="cart-two-column-layout">
            {/* Left Column: Items */}
            <div className="cart-items-column">
              <div className="free-shipping-card">
                <span className="free-shipping-icon">🎉</span>
                <span>
                  Your order qualifies for <strong>FREE Standard Delivery</strong>. Choose this option at checkout.
                </span>
              </div>

              <div className="cart-items-list-card">
                <div className="cart-table-header">
                  <span>Product Details</span>
                  <span className="cart-header-price">Price</span>
                </div>

                {cartItems.map((item) => (
                  <CartProductCard
                    key={item.id || item.productId}
                    item={item}
                    onIncrease={(productId, qty) => handleUpdateQuantity(productId, qty)}
                    onDecrease={(productId, qty) => handleUpdateQuantity(productId, qty)}
                    onRemove={(productId) => handleRemoveItem(productId)}
                  />
                ))}

                <div className="cart-subtotal-footer">
                  Subtotal ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}):{" "}
                  <strong>₹{totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-row">
                  <span>Items Subtotal ({totalItemsCount}):</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Charges:</span>
                  <span className="free-tag">FREE</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Taxes:</span>
                  <span>Included</span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-total-row">
                  <span>Order Total:</span>
                  <span className="summary-total-price">₹{totalPrice.toFixed(2)}</span>
                </div>

                <button onClick={handleProceedToBuy} className="proceed-to-buy-btn">
                  Proceed to Checkout ({totalItemsCount})
                </button>

                <div className="summary-security-note">
                  <span>🔒 Secure 256-bit SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
