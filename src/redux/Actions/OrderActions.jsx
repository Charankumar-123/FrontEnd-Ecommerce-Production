import { createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to get the Authorization header
const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch orders thunk
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/orders/get-orders/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(), // Spread the auth headers
                },
            });

            const result = await response.json();

            if (response.ok && result.status) {
                return result.data; // Return the orders data if successful
            } else {
                return rejectWithValue(result.message || "Failed to fetch orders"); // Handle failure with server message
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            return rejectWithValue(error.message); // Return error message if failed
        }
    }
);

// Add order thunk
export const addOrder = createAsyncThunk(
    "orders/addOrder",
    async (orderData, { rejectWithValue }) => {
        try {
            if (!orderData?.userId) {
                throw new Error("User ID is missing in order data");
            }

            const response = await fetch(`http://localhost:8080/api/orders/create-order/${orderData.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(), // Spread the auth headers
                },
                body: JSON.stringify({
                    cartItems: orderData.cartItems,
                    totalPrice: orderData.totalPrice, // Ensure totalPrice is sent
                }),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                return result.data; // Return order data
            } else {
                return rejectWithValue(result.message || "Failed to add order");
            }
        } catch (error) {
            console.error("Error adding order:", error);
            return rejectWithValue(error.message);
        }
    }
);