import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../redux/CartSlice";
import { addItemToCart, getCartItems } from "../../../Services/CartService";
import { setCartItems } from "../../../redux/CartSlice";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const userId = useSelector(
    (state) => state.auth.userDetail?.userId || state.auth.userDetail?.userID
  );
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("authToken");
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/products/getproducts", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const found = (data || []).find((p) => String(p.id) === String(id));
        setProduct(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product detail:", err);
        setLoading(false);
      });
  }, [id, token]);

  useEffect(() => {
    if (product && cartItems.some((item) => item.productInfo?.id === product.id)) {
      setIsAdded(true);
    }
  }, [product, cartItems]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const result = await addItemToCart(userId, product.id, quantity);
      if (result) {
        const updatedCart = await getCartItems(userId);
        dispatch(setCartItems(updatedCart));
        dispatch(addToCart({ productId: product.id, quantity }));
        setIsAdded(true);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    if (!userId) {
      alert("Please login to proceed with checkout.");
      navigate("/login");
      return;
    }
    await handleAddToCart();
    navigate("/payment");
  };

  if (loading) {
    return (
      <div className="pdp-loading">
        <div className="pdp-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-not-found">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Store
        </button>
      </div>
    );
  }

  const mrp = Math.round(product.price * 1.25);

  return (
    <div className="pdp-page-wrapper">
      {/* Breadcrumb Nav */}
      <div className="pdp-breadcrumb">
        <span onClick={() => navigate("/")} className="crumb-link">Home</span>
        <span className="crumb-separator">›</span>
        <span onClick={() => navigate("/")} className="crumb-link">Store Catalog</span>
        <span className="crumb-separator">›</span>
        <span className="crumb-current">{product.name}</span>
      </div>

      <div className="pdp-grid-container">
        {/* Left Column: Product Image Gallery */}
        <div className="pdp-media-column">
          <div className="main-image-card">
            <img
              src={product.image || "https://via.placeholder.com/450x400?text=Product"}
              alt={product.name}
              className="pdp-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/450x400?text=No+Image";
              }}
            />
            <span className="pdp-badge-tag">🏪 Official Store Item</span>
          </div>
        </div>

        {/* Center Column: Product Specs & Details */}
        <div className="pdp-details-column">
          <div className="pdp-store-header">
            <span className="store-pill">Brand Store Verified</span>
            <span className="store-link" onClick={() => navigate("/")}>
              Visit ModernStore Collection →
            </span>
          </div>

          <h1 className="pdp-product-title">{product.name}</h1>

          <div className="pdp-rating-row">
            <span className="stars">★★★★★</span>
            <span className="rating-text">4.8 out of 5 stars</span>
            <span className="rating-divider">|</span>
            <span className="review-count">128 verified customer ratings</span>
          </div>

          <hr className="pdp-divider" />

          {/* Pricing Box */}
          <div className="pdp-pricing-box">
            <div className="deal-tag">Limited Time Deal</div>
            <div className="price-main-row">
              <span className="discount-percent">-20%</span>
              <span className="price-currency">₹</span>
              <span className="price-amount">{product.price ? product.price.toFixed(2) : "0.00"}</span>
            </div>
            <div className="mrp-row">
              <span>M.R.P.: </span>
              <span className="strikethrough">₹{mrp}</span>
              <span className="inclusive-tax"> (Inclusive of all taxes)</span>
            </div>
          </div>

          <hr className="pdp-divider" />

          {/* Highlights & Features */}
          <div className="pdp-features-section">
            <h3>About this item</h3>
            <p className="pdp-main-description">{product.description}</p>

            <ul className="pdp-feature-bullets">
              <li>High-quality materials designed for premium durability and style.</li>
              <li>Official seller warranty with 7-day hassle-free replacement.</li>
              <li>Free expedited shipping on orders fulfilled by ModernStore.</li>
              <li>Guaranteed authentic product backed by customer satisfaction promise.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Teal Buy Box */}
        <div className="pdp-buybox-column">
          <div className="buybox-card">
            <div className="buybox-price">
              <span className="price-currency">₹</span>
              <span className="price-val">{product.price ? product.price.toFixed(2) : "0.00"}</span>
            </div>

            <div className="delivery-highlight">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>FREE Delivery</strong> by <strong>Tomorrow, 5 PM</strong>
              </div>
            </div>

            <div className="stock-indicator in-stock">
              <span className="stock-dot"></span> In Stock - Ready to Ship
            </div>

            <div className="quantity-row">
              <label htmlFor="qty-select">Quantity:</label>
              <select
                id="qty-select"
                className="qty-dropdown"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddToCart}
              className={`pdp-btn-add-cart ${isAdded ? "added" : ""}`}
            >
              {isAdded ? "✓ Added to Cart" : "🛒 Add to Cart"}
            </button>

            <button onClick={handleBuyNow} className="pdp-btn-buy-now">
              ⚡ Buy Now
            </button>

            <div className="buybox-assurances">
              <div className="assurance-item">
                <span className="assurance-icon">🔒</span>
                <span>Secure Transaction</span>
              </div>
              <div className="assurance-item">
                <span className="assurance-icon">📦</span>
                <span>Ships from ModernStore Warehouse</span>
              </div>
              <div className="assurance-item">
                <span className="assurance-icon">🔄</span>
                <span>7-Day Return & Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
