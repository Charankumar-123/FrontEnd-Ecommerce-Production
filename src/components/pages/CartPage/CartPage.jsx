// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import CartProductCard from "../../Cards/CartProductCard/CartProductCard.jsx";
// import { clearCart, setCartItems, setTotalPrice } from "../../../redux/CartSlice";
// import { addToOrder } from "../../../redux/OrderSlice"; // Import addToOrder action
// import "./CartPage.css";
// import { useNavigate } from "react-router-dom";
// import { addOrder } from "../../../redux/Actions/OrderActions.jsx";

// const CartPage = () => {
//     const [cartItems, setCartItemsState] = useState([]);
//     const [totalPrice, setTotalPriceState] = useState(0);
//     const userId = useSelector((state) => state.auth.userDetail?.userId);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // Function to fetch cart items from the backend
//     const fetchCartItems = async () => {
//         try {
//             const response = await fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to fetch cart items");
//             }

//             const data = await response.json();
//             console.log("fetched cart items=>",data);
//             setCartItemsState(data);
//             dispatch(setCartItems(data));
//         } catch (error) {
//             console.error("Error fetching cart items:", error);
//         }
//     }

//     // Function to fetch total cart price from the backend
//     const fetchTotalPrice = async () => {
//         try {
//             const response = await fetch(`http://localhost:8080/total/${userId}`, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to fetch cart price");
//             }

//             const cartPrice = await response.json();
//             setTotalPriceState(cartPrice.total || cartPrice);
//             dispatch(setTotalPrice(cartPrice.total || cartPrice));
//         } catch (error) {
//             console.error("Error fetching cart total price:", error);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchCartItems();
//             fetchTotalPrice();
//         }
//     }, [userId]);

//     // Function to handle adding/removing items in the cart
//     // const handleUpdateCartQuantity = async (productId, quantity) => {
//     //     if (quantity < 1) return;

//     //     const updatedCartItems = cartItems.map(item => 
//     //         item.productId === productId ? { ...item, quantity: quantity } : item
//     //     );
//     //     setCartItemsState(updatedCartItems);
//     //     dispatch(setCartItems(updatedCartItems)); 

//     //     const newTotalPrice = updatedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     //     setTotalPriceState(newTotalPrice);
//     //     dispatch(setTotalPrice(newTotalPrice));

//     //     try {
//     //         const cartDto = {
//     //             userId: userId,
//     //             productId: productId,
//     //             quantity: quantity,
//     //         };

//     //         const response = await fetch("http://localhost:8080/updateCartQuantity", {
//     //             method: "PUT",
//     //             headers: {
//     //                 "Content-Type": "application/json",
//     //             },
//     //             body: JSON.stringify(cartDto),
//     //         });

//     //         if (!response.ok) {
//     //             throw new Error("Failed to update cart quantity");
//     //         }

//     //         // const updatedCart = await response.json();
//     //         // console.log("Updated Cart Response:", updatedCart);

//     //         // Refresh the cart after updating quantity
//     //         fetchCartItems();
//     //         fetchTotalPrice();
//     //     } catch (error) {
//     //         console.error("Error updating cart quantity:", error);
//     //     }
//     // };

//     const handleUpdateCartQuantity = async (productId, quantity) => {
//         if (quantity < 1) return;
    
//         try {
//             const cartDto = { userId, productId, quantity };
    
//             const response = await fetch("http://localhost:8080/updateCartQuantity", {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(cartDto),
//             });
    
//             if (!response.ok) {
//                 throw new Error("Failed to update cart quantity");
//             }
    
//             // Fetch updated cart data from the backend instead of modifying state manually
//             await fetchCartItems();
//             await fetchTotalPrice();
//         } catch (error) {
//             console.error("Error updating cart quantity:", error);
//         }
//     };
    

//     const handleAddToOrder = async () => {
//         if (!userId) {
//             console.error("User not logged in");
//             return;
//         }
    
//         const orderData = {
//             userId: userId,
//             cartItems: cartItems.map(cartItem => ({
//                 productId: cartItem.productId,
//                 quantity: cartItem.quantity,
//                 price: cartItem.price,
//             })),
//             totalPrice,  // Ensure totalPrice is included
//         };
    
//         console.log("Order Data being sent:", orderData); // Debugging log
    
//         try {
//             await dispatch(addOrder(orderData));
//             navigate("/payment"); 
//             // Dispatch action to create order in backend
//             // dispatch(clearCart());
//              // Clear cart after order creation
//              // Navigate to payment page
//         } catch (error) {
//             console.error("Error creating order:", error);
//         }
//     };
    
//     return (
//         <div className="cart-container">
//             <h2>Shopping Cart</h2>
//             {cartItems.length === 0 ? (
//                 <p>Cart is empty</p>
//             ) : (
//                 cartItems.map((item) => (
//                     <CartProductCard
//                         key={item.id}
//                         item={item}
//                         onIncrease={(productId, quantity) => handleUpdateCartQuantity(productId, quantity + 1)} // Increase quantity
//                         onDecrease={(productId, quantity) => handleUpdateCartQuantity(productId, quantity - 1)} // Decrease quantity
//                         onAddToOrder={handleAddToOrder} // Pass the add to order function
//                     />
//                 ))
//             )}
//             <h3>Total Price cart: ${totalPrice.toFixed(2)}</h3>
//             <div className="center">
//             <button onClick={handleAddToOrder} className="add-to-order-btn">
//                     Add To Order
//                 </button>
//             </div>
          
//         </div>
//     );
// };

// export default CartPage;

//--------------------------------------------------------------------------


// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import CartProductCard from "../../Cards/CartProductCard/CartProductCard.jsx";
// import { clearCart, setCartItems, setTotalPrice } from "../../../redux/CartSlice";
// import { addToOrder } from "../../../redux/OrderSlice";
// import "./CartPage.css";
// import { useNavigate } from "react-router-dom";
// import { addOrder } from "../../../redux/Actions/OrderActions.jsx";

// const CartPage = () => {
//     const [cartItems, setCartItemsState] = useState([]);
//     const [totalPrice, setTotalPriceState] = useState(0);
//     const userId = useSelector((state) => state.auth.userDetail?.userId);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const token = useSelector((state) => state.auth.token);

//     // Fetch cart items from backend
//     const fetchCartItems = async () => {
//         try {
//             const response = await fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
//                 method: "GET",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                   },
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to fetch cart items");
//             }

//             const data = await response.json();
//             console.log("Fetched cart items:", data);
//             setCartItemsState(data);
//             dispatch(setCartItems(data));
//         } catch (error) {
//             console.error("Error fetching cart items:", error);
//         }
//     };

//     // Fetch total cart price from backend
//     const fetchTotalPrice = async () => {
//         try {
//             const response = await fetch(`http://localhost:8080/total/${userId}`, {
//                 method: "GET",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                   },
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to fetch cart price");
//             }

//             const cartPrice = await response.json();
//             setTotalPriceState(cartPrice.total || cartPrice);
//             dispatch(setTotalPrice(cartPrice.total || cartPrice));
//         } catch (error) {
//             console.error("Error fetching cart total price:", error);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchCartItems();
//             fetchTotalPrice();
//         }
//     }, [userId]);

//     // ✅ Ensuring backend values are used for cart updates
//     const handleUpdateCartQuantity = async (productId, quantity) => {
//         if (quantity < 1) return;

//         try {
//             const cartDto = { userId, productId, quantity };
//             console.log("putData=>",cartDto)
//             const response = await fetch("http://localhost:8080/updateCartQuantity", {
//                 method: "PUT",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                   },
//                 body: JSON.stringify(cartDto),
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to update cart quantity");
//             }
//             const cartPrice = await response.json();

//             console.log("cartPrice=>",cartPrice)
//             // ✅ Always fetch latest data after update
//             await fetchCartItems();
//             await fetchTotalPrice();
//         } catch (error) {
//             console.error("Error updating cart quantity:", error);
//         }
//     };

//     const handleAddToOrder = async () => {
//         if (!userId) {
//             console.error("User not logged in");
//             return;
//         }
//         // console.log("orderData info =>",orderData)

//         const orderData = {
//             userId: userId,
//             cartItems: cartItems.map(cartItem => ({
//                 productId: cartItem.productId,
//                 quantity: cartItem.quantity,
//                 price: cartItem.productInfo.price,
//             })),
//             totalPrice,
//         };

//         console.log("Order Data being sent:", orderData);

//         try {
//             await dispatch(addOrder(orderData));
//             navigate("/payment");
//         } catch (error) {
//             console.error("Error creating order:", error);
//         }
//     };
//     console.log("cartitems => ",cartItems);

//     return (
//         <div className="cart-container">
//             <h2>Shopping Cart</h2>
//             {cartItems.length === 0 ? (
//                 <p>Cart is empty</p>
//             ) : (
//                 cartItems.map((item) => (
//                     <CartProductCard
//                         key={item.id}
//                         item={item}
//                         onIncrease={handleUpdateCartQuantity}
//                         onDecrease={handleUpdateCartQuantity}
//                     />
//                 ))
//             )}
//             <h3>Total Price cart: ${totalPrice.toFixed(2)}</h3>
//             <div className="center">
//                 <button onClick={handleAddToOrder} className="add-to-order-btn">
//                     Add To Order
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default CartPage;

//-----------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CartProductCard from "../../Cards/CartProductCard/CartProductCard.jsx";
import { clearCart, setCartItems, setTotalPrice } from "../../../redux/CartSlice";
import { addToOrder } from "../../../redux/OrderSlice";
import "./CartPage.css";
import { useNavigate } from "react-router-dom";
import { addOrder } from "../../../redux/Actions/OrderActions.jsx";
import { getCartItems, getTotalCartPrice, updateCartQuantity } from "../../../Services/CartService"; 

const CartPage = () => {
    const [cartItems, setCartItemsState] = useState([]);
    const [totalPrice, setTotalPriceState] = useState(0);
    const userId = useSelector((state) => state.auth.userDetail?.userId);
    const token = useSelector((state) => state.auth.token); // Get token from Redux
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch cart items using CartService
    const fetchCartItems = async () => {
        if (!userId || !token) {
            console.error("User ID or token missing");
            return;
        }
        try {
            const data = await getCartItems(userId, token); // Pass token
            console.log("Fetched cart items:", data);
            setCartItemsState(data);
            dispatch(setCartItems(data));
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    // Fetch total cart price using CartService
    const fetchTotalPrice = async () => {
        if (!userId || !token) {
            console.error("User ID or token missing");
            return;
        }
        try {
            const cartPrice = await getTotalCartPrice(userId, token); // Pass token
            setTotalPriceState(cartPrice.total || cartPrice);
            dispatch(setTotalPrice(cartPrice.total || cartPrice));
        } catch (error) {
            console.error("Error fetching cart total price:", error);
        }
    };

    useEffect(() => {
        if (userId && token) { // Only fetch if both userId and token are available
            fetchCartItems();
            fetchTotalPrice();
        }
    }, [userId, token]); // Add token as dependency

    // Update cart quantity using CartService
    const handleUpdateCartQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        try {
            await updateCartQuantity(userId, productId, quantity, token); // Pass token
            console.log("Cart quantity updated successfully");
            // Refresh cart data after update
            await fetchCartItems();
            await fetchTotalPrice();
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };

    const handleAddToOrder = async () => {
        if (!userId || !token) {
            console.error("User not logged in or token missing");
            return;
        }

        const orderData = {
            userId: userId,
            cartItems: cartItems.map((cartItem) => ({
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                price: cartItem.productInfo.price, // Ensure price comes from productInfo
            })),
            totalPrice,
        };

        console.log("Order Data being sent:", orderData);

        try {
            await dispatch(addOrder(orderData));
            navigate("/payment");
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    console.log("cartitems => ", cartItems);

    return (
        <div className="cart-container">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Cart is empty</p>
            ) : (
                cartItems.map((item) => (
                    <CartProductCard
                        key={item.id}
                        item={item}
                        onIncrease={(productId) => handleUpdateCartQuantity(productId, item.quantity + 1)} // Pass productId directly
                        onDecrease={(productId) => handleUpdateCartQuantity(productId, item.quantity - 1)} // Pass productId directly
                    />
                ))
            )}
            <h3>Total Price cart: ${totalPrice.toFixed(2)}</h3>
            <div className="center">
                <button onClick={handleAddToOrder} className="add-to-order-btn">
                    Add To Order
                </button>
            </div>
        </div>
    );
};

export default CartPage;

