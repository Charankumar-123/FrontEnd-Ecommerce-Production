import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../../../redux/Actions/OrderActions'; // Import addOrder action
import './PaymentPage.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get cart items and total price
    // const cartItems = useSelector((state) => state.cart.cartItems) || [];
    const userId = useSelector((state) => state.auth.userDetail?.userId);
    const cartItems = useSelector((state) => state.cart.cartItems);
console.log("Cart Items in Redux:", cartItems);

    // const totalPrice = useSelector((state) => state.cart.total) ;
    const totalPrice = useSelector((state) => state.cart.total) ?? 
                   cartItems.reduce((sum, item) => sum + item.productInfo.price * item.quantity, 0);

    console.log("totalPrice from cart=>",totalPrice)

    console.log("Cart Items:", cartItems);
    console.log("Total Price:", totalPrice);

    const handlePayment = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderData = {
            userId,
            cartItems: cartItems.map(item => ({
                productId: item.id,  // ✅ Ensure correct property
                quantity: item.quantity
            })),
            totalPrice
        };

        // Dispatch order action
        dispatch(addOrder(orderData));
        // dispatch(addOrder({ items: cartItems, totalPrice }));

        // Show payment success alert
        alert("Payment successful!");

        // Navigate to profile page after payment
        navigate("/profile");
    };
    console.log("Cart Items in Redux:", cartItems);
    console.log("Redux Cart State:", useSelector((state) => state.cart.cartItems));


    return (
        <div className="payment-container">
            <h2>Payment Page</h2>
            <div className="order-summary">
                <h3>Order Summary</h3>
                {cartItems.length === 0 ? (
                    <p>No items in your cart.</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.productId} className="order-item">
                            <p>{item.productInfo.name} (x{item.quantity})</p> 
                            <p>${(item.productInfo.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))
                )}
            </div>
            {/* <h3>Total Price: ${totalPrice.toFixed(2)}</h3> */}
            {/* <h3>Total Price: ${((totalPrice ?? cartItems.reduce((sum, item) => sum + item.productInfo.price * item.quantity, 0)).toFixed(2))}</h3> */}
            <h3>Total Price: ${totalPrice ? totalPrice.toFixed(2) : "0.00"}</h3>


            <button className="pay-button" onClick={handlePayment}>
                Pay
            </button>
        </div>
    );
};

export default PaymentPage;
