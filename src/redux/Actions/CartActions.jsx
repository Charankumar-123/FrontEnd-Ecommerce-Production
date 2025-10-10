export const removeFromCart = (productId) => (dispatch) => {
    dispatch({
        type: 'REMOVE_FROM_CART',
        payload: productId,
    });
};