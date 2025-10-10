import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./CartSlice";
// import { composeWithDevTools } from 'redux-devtools-extension';
import authSlice from "./authSlice";
import OrderSlice from "./OrderSlice";



export const store = configureStore({
    reducer: {
        cart: cartSlice,
        auth: authSlice,
        orders:OrderSlice,

        
    },
    devTools: true,
    
});



export default store;