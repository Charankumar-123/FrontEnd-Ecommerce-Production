import { getAuthToken } from "../utils/cookieUtils";

const API_BASE_URL = "http://localhost:8080"; // Backend URL

// Helper to resolve token from arguments, cookies, or localStorage
const resolveToken = (token) => {
    return token || getAuthToken() || localStorage.getItem("authToken");
};

// Helper for auth headers
const getHeaders = (token) => {
    const activeToken = resolveToken(token);
    const headers = { "Content-Type": "application/json" };
    if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return headers;
};

// Helper to safely parse response as JSON or text
const safeParse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
};

// ✅ Get all cart items for a specific user
export const getCartItems = async (userId, token) => {
    if (!userId) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/get-all-cart-items/${userId}`, {
            method: "GET",
            headers: getHeaders(token),
        });

        if (!response.ok) {
            console.warn(`Failed to fetch cart items: ${response.status}`);
            return [];
        }

        const data = await safeParse(response);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return [];
    }
};

// ✅ Add an item to the cart or update its quantity
export const addItemToCart = async (userId, productId, quantity, token) => {
    if (!userId || !productId) return null;
    try {
        const safeQty = !quantity || quantity < 1 ? 1 : quantity;
        const cartDto = { userId: Number(userId), productId: Number(productId), quantity: Number(safeQty) };

        const response = await fetch(`${API_BASE_URL}/addToCart`, {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(cartDto),
        });

        if (!response.ok) {
            throw new Error(`Failed to add/update cart item: ${response.status}`);
        }
        return await safeParse(response);
    } catch (error) {
        console.error("Error adding/updating cart item:", error);
        throw error;
    }
};

// ✅ Update item quantity in cart
export const updateCartQuantity = async (userId, productId, quantity, token) => {
    if (!userId || !productId) return null;
    try {
        const cartDto = { userId: Number(userId), productId: Number(productId), quantity: Number(quantity) };

        const response = await fetch(`${API_BASE_URL}/updateCartQuantity`, {
            method: "PUT",
            headers: getHeaders(token),
            body: JSON.stringify(cartDto),
        });

        if (!response.ok) {
            throw new Error(`Failed to update cart quantity: ${response.status}`);
        }
        return await safeParse(response);
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        throw error;
    }
};

// ✅ Get total price of the cart for a user
export const getTotalCartPrice = async (userId, token) => {
    if (!userId) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/total/${userId}`, {
            method: "GET",
            headers: getHeaders(token),
        });

        if (!response.ok) {
            console.warn(`Failed to fetch total cart price: ${response.status}`);
            return null;
        }

        const data = await safeParse(response);
        const num = Number(data);
        return !isNaN(num) ? num : null;
    } catch (error) {
        console.error("Error fetching total cart price:", error);
        return null;
    }
};

// ✅ Remove item from cart
export const removeItemFromCart = async (userId, productId, token) => {
    if (!userId || !productId) return { status: false };
    try {
        const response = await fetch(`${API_BASE_URL}/remove/${userId}/${productId}`, {
            method: "DELETE",
            headers: getHeaders(token),
        });

        if (!response.ok) {
            throw new Error(`Failed to remove cart item: ${response.status}`);
        }

        const data = await safeParse(response);
        return typeof data === "object" ? data : { status: true, message: data };
    } catch (error) {
        console.error("Error removing cart item:", error);
        throw error;
    }
};
