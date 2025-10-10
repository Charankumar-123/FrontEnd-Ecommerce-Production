import { createSlice } from '@reduxjs/toolkit';
import { addOrder, fetchOrders } from './Actions/OrderActions'; // Import the async thunk

const initialState = {
    orders: [],
    error: null,
    loading: false,
    totalPrice: 0,
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        addToOrder: (state, action) => {
            state.orders.push(action.payload);
            state.totalPrice = action.payload.totalPrice;
        },
        clearOrders: (state) => {
            state.orders = [];
            state.totalPrice = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true; // Set loading state when request is pending
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.orders = action.payload; // Set orders from the response
                state.loading = false;
                state.error = null; // Clear any previous error
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.error = action.payload; // Set the error message
                state.loading = false;
            })
            // Adding addOrder cases
            .addCase(addOrder.pending, (state) => {
                state.loading = true; // Set loading state
            })
            .addCase(addOrder.fulfilled, (state, action) => {
                state.orders.push(action.payload);  // Add new order to the orders array
                state.loading = false;
                state.error = null;
            })
            .addCase(addOrder.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    }
});

export const { addToOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
