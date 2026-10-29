import React from "react";
import { Link } from "react-router-dom";
import "./CartProductCard.css";

const CartProductCard = ({ item, onIncrease, onDecrease, onRemove }) => {
  const productInfo = item.productInfo || {};
  const quantity = item.quantity || 1;
  const unitPrice = productInfo.price || 0;
  const lineTotal = (unitPrice * quantity).toFixed(2);

  const handleMinus = () => {
    if (quantity > 1) {
      onDecrease(item.productId, quantity - 1);
    } else if (onRemove) {
      onRemove(item.productId);
    }
  };

  const handlePlus = () => {
    onIncrease(item.productId, quantity + 1);
  };

  return (
    <div className="cart-item-row">
      {/* Product Image */}
      <div className="cart-item-image-col">
        <Link to={`/product/${item.productId}`}>
          <img
            src={productInfo.image || "https://via.placeholder.com/120x100?text=Product"}
            alt={productInfo.name || "Product"}
            className="cart-item-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/120x100?text=No+Image";
            }}
          />
        </Link>
      </div>

      {/* Product Info & Controls */}
      <div className="cart-item-details-col">
        <Link to={`/product/${item.productId}`} className="cart-item-title-link">
          <h3 className="cart-item-title">{productInfo.name || "Untitled Product"}</h3>
        </Link>

        <p className="cart-item-desc">{productInfo.description}</p>
        <div className="cart-item-instock">🟢 In Stock • Ready for Dispatch</div>

        {/* Quantity and Actions */}
        <div className="cart-item-actions-row">
          <div className="quantity-stepper">
            <button
              onClick={handleMinus}
              className="qty-btn minus"
              title={quantity === 1 ? "Remove item" : "Decrease quantity"}
            >
              {quantity === 1 ? "🗑️" : "−"}
            </button>
            <span className="qty-number">{quantity}</span>
            <button onClick={handlePlus} className="qty-btn plus" title="Increase quantity">
              +
            </button>
          </div>

          <button
            onClick={() => onRemove && onRemove(item.productId)}
            className="cart-item-delete-btn"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Line Total Price */}
      <div className="cart-item-price-col">
        <div className="cart-item-total-price">₹{lineTotal}</div>
        {quantity > 1 && (
          <div className="cart-item-unit-price">₹{unitPrice.toFixed(2)} each</div>
        )}
      </div>
    </div>
  );
};

export default CartProductCard;
