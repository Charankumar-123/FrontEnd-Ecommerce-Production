// import { createSlice } from "@reduxjs/toolkit";


// const initialState = {
//     cartItems: [],
//     total: 0,
// };



// const cartSlice = createSlice({
//     name:"cart",
//     initialState,
//     reducers:{
//         addToCart: (state, action) => {
//             console.log("existingItem => ",action.payload);
//             // const existingItem = state.cartItems?.find(item => item.id === action.payload.productId);
//             const existingItem = state.cartItems?.find(item => item.id === action.payload.productId);

//             console.log("existingItem => ",existingItem);
//             if (existingItem) {
//                 existingItem.quantity += 1;    

//             }else{

//                 console.log("existingItem => ",existingItem);
//                 state.cartItems?.push({...action.payload, quantity: 1});
//             }
//             state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//         },
//         removeFromCart: (state, action) => {
//             state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
//             state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);  
//         },
//         updateQuantity: (state, action) => {
//             const item = state.cartItems.find(item => item.productId === action.payload.productId);
//             if (item) {
//                 item.quantity = action.payload.quantity;
//             }
//             state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//         },

//         clearCart: (state) => {
//             state.cartItems = [];
//             state.total = 0;
//         },
//         setCartItems: (state, action) => {
//             state.cartItems = action.payload;
//             state.total = action.payload.reduce((acc, item) => acc + item.price * item.quantity, 0); // This will update the cart items
//           },
//           setTotalPrice: (state, action) => {
//             state.total = action.payload;
//           },
        
//     }
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems, setTotalPrice} = cartSlice.actions;
// export default cartSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [], // ✅ Fix: Empty array instead of [{}]
    total: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            console.log("Adding to cart:", action.payload);
        
            const existingItem = state.cartItems.find(item => item.productId === action.payload.productId);
        
            if (existingItem) {
                console.log(`Existing item found: ${existingItem.name}, Current Quantity: ${existingItem.quantity}`);
                existingItem.quantity += action.payload.quantity || 1;
                console.log(`Updated Quantity: ${existingItem.quantity}`);
            } else {
                console.log("Adding new item to cart:", action.payload);
                state.cartItems.push({ ...action.payload, quantity: action.payload.quantity || 1 });
            }
        
            console.log("Updated Cart State:", state.cartItems);
            state.total = state.cartItems.reduce((acc, item) => acc + item.productInfo.price * item.quantity, 0);
        },
        

        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
            state.total = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        },

        updateQuantity: (state, action) => {
            const item = state.cartItems.find(item => item.productId === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
            state.total = state.cartItems.reduce((acc, item) => acc + item.productInfo.price * item.quantity, 0);
        },

        clearCart: (state) => {
            state.cartItems = [];
            state.total = 0;
        },

        setCartItems: (state, action) => {
            state.cartItems = action.payload;
            state.total = action.payload.reduce((acc, item) => acc + item.productInfo.price * item.quantity, 0);
        },

        setTotalPrice: (state, action) => {
            state.total = action.payload;
        },
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems, setTotalPrice } = cartSlice.actions;
export default cartSlice.reducer;

