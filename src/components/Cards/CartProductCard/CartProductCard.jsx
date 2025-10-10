import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./CartProductCard.css";

const CartProductCard = ({ item, onIncrease, onDecrease }) => {
    const cartItems = useSelector((state) => state.cart.cartItems);
    console.log("item=>", item);

    // Ensure quantity is always initialized
    const [quantity, setQuantity] = useState(item.quantity ?? 1);
    console.log("quantity=>", quantity);

    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);  // ✅ Update local state
        onIncrease(item.productId, newQuantity);  // ✅ Send update to backend
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);  // ✅ Update local state
            onDecrease(item.productId, newQuantity);  // ✅ Send update to backend
        }
    };

    // Fix total price calculation
    // const totalPrice = (item.productInfo.price * quantity).toFixed(2);
    // const totalPrice = cartItems.reduce((sum, item) => sum + item.productInfo.price * item.quantity, 0);

    console.log("item info=>", item.productInfo.price);

    return (
        <div className="cart-product-card">
            <div className="cart-product-details">
                <h3>{item.productInfo.name}</h3>
                <p>Price: ${item.productInfo.price}</p>  {/* Consistent price display */}
                <p>Total Price: ${(item.productInfo.price * quantity).toFixed(2)}</p>   {/* Corrected this line */}
                <div className="cart-quantity">
                    <button onClick={handleDecrease} className="quantity-btn">-</button>
                    <span>{quantity}</span>
                    <button onClick={handleIncrease} className="quantity-btn">+</button>
                </div>
            </div>
        </div>
    );
};

export default CartProductCard;
