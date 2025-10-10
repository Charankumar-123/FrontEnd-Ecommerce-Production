import React from "react";
import "./OrderProductCard.css"; // Import styles

const OrderProductCard = ({ order }) => {
  const price = order?.totalPrice; // Ensure order and totalPrice are defined

    // Check if price is undefined or null before calling .toFixed
    const formattedPrice = price ? price.toFixed(2) : 'N/A'; // Set a fallback value if price is invalid

  return (
    <div className="order-product-card">
      <p><strong>Order ID:</strong> {order.orderId}</p>
      {/* <p><strong>User ID:</strong> {order.userId}</p> */}
      <p><strong>Status:</strong> {order.status}</p>
      {/* <p><strong>:</strong> {order.quantity}</p> */}
      <p><strong>Total Price:</strong> ${formattedPrice}</p>
      
    </div>
  );
};

export default OrderProductCard;

