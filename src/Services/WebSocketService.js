import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:8080/ws";

/**
 * Connects to Spring Boot STOMP WebSocket broker and subscribes to a specific topic
 * 
 * @param {string} topic - e.g. "/topic/order-tracking/1"
 * @param {function} onMessageReceived - callback receiving parsed JSON payload
 * @param {function} onStatusChange - callback reporting connection status ("CONNECTING", "CONNECTED", "DISCONNECTED")
 * @returns {Client} active STOMP Client instance (call client.deactivate() on cleanup)
 */
export const subscribeToOrderTracking = (orderId, onMessageReceived, onStatusChange) => {
  const topic = `/topic/order-tracking/${orderId}`;

  if (onStatusChange) onStatusChange("CONNECTING");

  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 4000,
    debug: (str) => {
      // Uncomment for verbose logging
      // console.log("[STOMP]", str);
    },
    onConnect: (frame) => {
      console.log(`[WebSocket] Connected successfully. Subscribing to ${topic}`);
      if (onStatusChange) onStatusChange("CONNECTED");

      // Subscribe to the order's specific topic
      client.subscribe(topic, (message) => {
        if (message.body) {
          try {
            const payload = JSON.parse(message.body);
            console.log(`[WebSocket] Update received for Order #${orderId}:`, payload);
            onMessageReceived(payload);
          } catch (err) {
            console.error("[WebSocket] Error parsing message:", err);
          }
        }
      });
    },
    onStompError: (frame) => {
      console.error("[WebSocket] Broker error:", frame.headers["message"]);
      if (onStatusChange) onStatusChange("ERROR");
    },
    onWebSocketClose: () => {
      console.log("[WebSocket] Connection closed");
      if (onStatusChange) onStatusChange("DISCONNECTED");
    },
  });

  client.activate();
  return client;
};

/**
 * Helper to update order tracking status (used by Warehouse, Seller, Admin, or simulation)
 * Calls the backend POST /tracking/update-json endpoint with a JSON body
 */
export const sendTrackingStatusUpdate = async (orderId, status, carrier, location) => {
  const payload = {
    orderId: Number(orderId),
    status: status,
    carrier: carrier || "ModernStore Express",
    location: location || "Logistics Hub",
  };

  const response = await fetch("http://localhost:8080/tracking/update-json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update tracking: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch initial tracking details for an order via REST
 */
export const fetchOrderTracking = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:8080/tracking/${orderId}`);
    if (!response.ok) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Failed to fetch initial tracking details:", error);
    return null;
  }
};

