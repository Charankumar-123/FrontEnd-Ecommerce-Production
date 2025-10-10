import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/Actions/OrderActions.jsx";
import "./OrdersPage.css"; // Import the CSS file

const OrdersPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userDetail?.userId);
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (userId) {
      console.log("Fetching orders for userId:", userId);
      dispatch(fetchOrders(userId));
    }
  }, [dispatch, userId]);

  console.log("Orders Info:", orders);

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      {!orders || orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <h3>Order ID: {order.orderId}</h3>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice}</p>

              <h4>Ordered Items:</h4>
              <ul className="order-items">
                {order.orderItemsInfo && order.orderItemsInfo.length > 0 ? (
                  order.orderItemsInfo.map((item) => (
                    <li key={item.orderItemId}>
                      <img
                        src={item.productOrderInfo?.image || "https://via.placeholder.com/100"}
                        alt={item.productOrderInfo?.name || "Product Image"}
                        width="100"
                      />
                      <div>
                        <p><strong>Product Name:</strong> {item.productOrderInfo?.name || "N/A"}</p>
                        <p><strong>Description:</strong> {item.productOrderInfo?.description || "No description"}</p>
                        <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                        <p><strong>Price:</strong> ${item.price || 0}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No items in this order.</p>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
