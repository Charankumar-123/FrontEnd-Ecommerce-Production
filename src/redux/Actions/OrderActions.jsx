import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthToken } from '../../utils/cookieUtils';

// Helper function to get the Authorization header from cookie (with fallback)
const getAuthHeaders = () => {
    const token = getAuthToken() || localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Safe response parser that never crashes on empty or text responses
const parseResponseSafely = async (response) => {
    const text = await response.text();
    if (!text || text.trim() === "") return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("Server returned non-JSON response:", text);
        return { message: text };
    }
};

// Fetch orders thunk
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (userId, { rejectWithValue }) => {
        if (!userId) {
            return [];
        }

        try {
            const response = await fetch(`http://localhost:8080/api/orders/get-orders/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
            });

            const result = await parseResponseSafely(response);

            if (response.ok) {
                // If backend returns { status: true, data: [...] }
                if (result && Array.isArray(result.data)) {
                    return result.data;
                }
                // If backend returns array directly [...]
                if (Array.isArray(result)) {
                    return result;
                }
                // If data is empty list
                return [];
            } else {
                return rejectWithValue(result?.message || `Failed to fetch orders (HTTP ${response.status})`);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            return rejectWithValue(error.message || "Failed to fetch orders");
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
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    cartItems: orderData.cartItems,
                    totalPrice: orderData.totalPrice,
                }),
            });

            const result = await parseResponseSafely(response);

            if (response.ok && (result?.status || result?.orderId || result?.data)) {
                return result.data || result;
            } else {
                return rejectWithValue(result?.message || `Failed to create order (HTTP ${response.status})`);
            }
        } catch (error) {
            console.error("Error adding order:", error);
            return rejectWithValue(error.message || "Failed to add order");
        }
    }
);
