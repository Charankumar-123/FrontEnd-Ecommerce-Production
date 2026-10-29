import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Addproduct.css";

const PRESET_IMAGES = [
  {
    name: "Headphones",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Sneakers",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Smart Watch",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Backpack",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Coffee Maker",
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60",
  },
];

const CATEGORIES = [
  "Electronics",
  "Fashion & Apparel",
  "Home & Kitchen",
  "Health & Personal Care",
  "Books & Stationery",
  "Gaming & Toys",
  "Sports & Outdoors",
];

const AddProduct = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("authToken");
  const userDetail = useSelector((state) => state.auth.userDetail);

  let savedRole = userDetail?.role;
  if (!savedRole) {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      savedRole = savedUser?.role;
    } catch (e) {}
  }
  const isAdmin = savedRole?.trim().toLowerCase() === "admin";

  const [product, setProduct] = useState({
    name: "",
    category: "Electronics",
    description: "",
    price: "",
    image: "",
    quantity: 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPreset = (url) => {
    setProduct((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.image) {
      alert("Please fill in the required fields (Name, Price, and Image URL).");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMsg("");

      const payload = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.image,
        quantity: parseInt(product.quantity) || 1,
      };

      const response = await fetch("http://localhost:8080/products/addproducts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setSuccessMsg(`"${product.name}" was successfully added to your store!`);
      setProduct({
        name: "",
        category: "Electronics",
        description: "",
        price: "",
        image: "",
        quantity: 10,
      });

      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please make sure you are logged in as admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPrice = parseFloat(product.price) || 0;
  const previewMrp = Math.round(previewPrice * 1.25);

  return (
    <div className="add-product-page-wrapper">
      <div className="add-product-max-width">
        {/* Page Header */}
        <div className="add-product-header">
          <div>
            <span className="seller-badge">🛡️ Seller Central</span>
            <h1 className="add-product-title">Add New Product to Store</h1>
            <p className="add-product-subtitle">
              Publish inventory items to your catalog with real-time preview and instant store listing.
            </p>
          </div>
          <button className="back-store-btn" onClick={() => navigate("/")}>
            ← Back to Store
          </button>
        </div>

        {/* Non-Admin Warning if applicable */}
        {!isAdmin && (
          <div className="admin-warning-banner">
            ⚠️ <strong>Admin Permission Notice:</strong> You are currently logged in as a normal user. Only accounts with the <strong>Admin</strong> role have privileges to publish products.
          </div>
        )}

        {successMsg && (
          <div className="product-success-alert">
            ✓ {successMsg}
          </div>
        )}

        {/* Two-Column Creator Workspace */}
        <div className="creator-grid">
          {/* Left Column: Form */}
          <div className="form-card">
            <h2 className="form-heading">Product Details</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Wireless Over-Ear Headphones"
                  className="form-input"
                  value={product.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={product.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder="10"
                    className="form-input"
                    value={product.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <div className="price-input-wrapper">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    placeholder="1299.00"
                    className="form-input price-field"
                    value={product.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                {previewPrice > 0 && (
                  <small className="mrp-hint">
                    Suggested M.R.P.: ₹{previewMrp} (20% discount tag will appear in store)
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://example.com/product-image.jpg"
                  className="form-input"
                  value={product.image}
                  onChange={handleChange}
                  required
                />

                <div className="preset-images-wrapper">
                  <span className="preset-label">Quick sample presets:</span>
                  <div className="preset-buttons">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        className="preset-btn"
                        onClick={() => handleSelectPreset(preset.url)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Key features, specifications, and warranty details..."
                  className="form-textarea"
                  value={product.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-publish-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing Product..." : "➕ Publish Product to Store"}
              </button>
            </form>
          </div>

          {/* Right Column: Live Product Card Preview */}
          <div className="preview-card-column">
            <div className="preview-header">
              <h3>Live Store Preview</h3>
              <span>How your product appears to buyers</span>
            </div>

            <div className="mock-product-card">
              <div className="mock-image-wrapper">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || "Preview"}
                    className="mock-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Invalid+Image+URL";
                    }}
                  />
                ) : (
                  <div className="mock-img-placeholder">
                    <span>📷 Enter Image URL to Preview</span>
                  </div>
                )}
                <span className="mock-store-tag">🏪 Verified Store</span>
              </div>

              <div className="mock-card-body">
                <span className="mock-category">{product.category || "General"}</span>
                <h4 className="mock-title">
                  {product.name || "Product Name will appear here"}
                </h4>

                <div className="mock-ratings">
                  <span className="mock-stars">★★★★★</span>
                  <span className="mock-rating-val">5.0</span>
                  <span className="mock-reviews">(1)</span>
                </div>

                <p className="mock-desc">
                  {product.description || "Detailed product description and specs will appear here..."}
                </p>

                <div className="mock-price-row">
                  <span className="mock-price">₹{previewPrice.toFixed(2)}</span>
                  {previewPrice > 0 && (
                    <>
                      <span className="mock-mrp">₹{previewMrp}</span>
                      <span className="mock-discount">20% OFF</span>
                    </>
                  )}
                </div>

                <div className="mock-btn-row">
                  <button type="button" className="mock-add-cart-btn" disabled>
                    🛒 Add to Cart
                  </button>
                  <button type="button" className="mock-view-btn" disabled>
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
