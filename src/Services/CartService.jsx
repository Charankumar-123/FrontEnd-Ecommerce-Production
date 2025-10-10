// // import { useSelector } from "react-redux";

// const API_BASE_URL = "http://localhost:8080"; // ✅ Your backend URL
// // const token = useSelector((state)=> state.auth.token);

// // ✅ Get all cart items for a specific user
// export const getCartItems = async (userId,token) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/get-all-cart-items/${userId}`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch cart items");
//         }

//         // return await response.json();
//         const data = await response.json();
//         console.log("📦 Fetched Cart Items from API:", data); // ✅ Debug API response
//         return data;
//     } catch (error) {
//         console.error("Error fetching cart items:", error);
//         return [];
//     }
// };

// // ✅ Add an item to the cart or update its quantity
// export const addItemToCart = async (userId, productId, quantity,token) => {
//     try {
//         if (!quantity || quantity < 1) quantity = 1;  // ✅ Ensure quantity is always at least 1

//         const cartDto = { userId, productId, quantity };

//         const response = await fetch(`${API_BASE_URL}/addToCart`, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             body: JSON.stringify(cartDto),
//         });

//         if (!response.ok) {
//             throw new Error("Failed to add/update cart item");
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("Error adding/updating cart item:", error);
//     }
// };


// // ✅ Update item quantity in cart
// export const updateCartQuantity = async (userId, productId, quantity,token) => {
//     try {
//         const cartDto = { userId, productId, quantity };

//         const response = await fetch(`${API_BASE_URL}/updateCartQuantity`, {
//             method: "PUT",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             body: JSON.stringify(cartDto),
//         });

//         if (!response.ok) {
//             throw new Error("Failed to update cart quantity");
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("Error updating cart quantity:", error);
//     }
// };


// // ✅ Get total price of the cart for a user
// export const getTotalCartPrice = async (userId,token) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/total/${userId}`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch total cart price");
//         }

//         return await response.json();
//     } catch (error) {
//         console.error("Error fetching total cart price:", error);
//         return 0;
//     }
// };

// export const removeItemFromCart = async (userId, productId,token) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/remove/${userId}/${productId}`, {
//             method: "DELETE",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//         });

//         if (!response.ok) throw new Error("Failed to remove cart item");
//         return await response.json();
//     } catch (error) {
//         console.error("Error removing cart item:", error);
//     }
// };
//--------------------------------------------------------------------------------------------------------

const API_BASE_URL = "http://localhost:8080"; // Your backend URL

// ✅ Get all cart items for a specific user
export const getCartItems = async (userId, token) => {
    console.log("token from cartService=>",token);
    try {
        const response = await fetch(`${API_BASE_URL}/get-all-cart-items/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Token passed as parameter
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch cart items: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Fetched Cart Items from API:", data); // Debug API response
        return data;
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return [];
    }
};

// ✅ Add an item to the cart or update its quantity
export const addItemToCart = async (userId, productId, quantity, token) => {
    try {
        if (!quantity || quantity < 1) quantity = 1; // Ensure quantity is at least 1

        const cartDto = { userId, productId, quantity };

        const response = await fetch(`${API_BASE_URL}/addToCart`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`, // Token passed as parameter
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartDto),
        });

        if (!response.ok) {
            throw new Error(`Failed to add/update cart item: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding/updating cart item:", error);
        throw error; // Throw to handle in caller
    }
};

// ✅ Update item quantity in cart
export const updateCartQuantity = async (userId, productId, quantity, token) => {
    try {
        const cartDto = { userId, productId, quantity };

        const response = await fetch(`${API_BASE_URL}/updateCartQuantity`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`, // Token passed as parameter
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartDto),
        });

        if (!response.ok) {
            throw new Error(`Failed to update cart quantity: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        throw error;
    }
};

// ✅ Get total price of the cart for a user
export const getTotalCartPrice = async (userId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/total/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Token passed as parameter
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch total cart price: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching total cart price:", error);
        return 0;
    }
};

// ✅ Remove item from cart
export const removeItemFromCart = async (userId, productId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/remove/${userId}/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`, // Token passed as parameter
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to remove cart item: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error removing cart item:", error);
        throw error;
    }
};
