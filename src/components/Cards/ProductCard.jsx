  import React, { useState, useEffect } from "react";
  import "./ProductCard.css";
  import { useDispatch, useSelector } from "react-redux";
  import { addToCart } from "../../redux/CartSlice";
  import { addItemToCart, getCartItems } from "../../Services/CartService";
  import { setCartItems } from "../../redux/CartSlice";

  const ProductCard = () => {
    const dispatch = useDispatch();
    // const user = useSelector((state) => state.user.user);
    
    const [quantities, setQuantities] = useState({});
    const [products, setProducts] = useState([]);
    // const [cartItems, setCartItems] = useState([]);
    const [addedToCart, setAddedToCart] = useState({});



    
    const userId = useSelector((state) => state.auth.userDetail?.userId); 
    
    
    console.log("this is user id = ");
    console.log(userId);
    // const token = useSelector((state) => state.auth.token);
    const token = useSelector((state)=> state.auth.token);
    console.log(" product card page token=>", token);

    const cartItems = useSelector((state) => state.cart.cartItems);

    

  

    useEffect(() => {
      fetch("http://localhost:8080/products/getproducts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => setProducts(data))
        .catch((error) => console.error("Error fetching products:", error));
    }, [token]);
  
    // Fetch cart items for logged-in user
    useEffect(() => {
      if (userId) {
        fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => dispatch(setCartItems(data)))
          .catch((error) => console.error("Error fetching cart items:", error));
      }
    }, [userId, token, dispatch]);
    

    const handleQuantityChange = (productId, quantity) => {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: quantity,
      }));
    };


    const handleAddToCart = async (product) => {
      if (!userId) {
        console.error("User ID not found. Please log in.");
        return;
      }

      try {
        const quantity = quantities[product.id] || 1;
        const result = await addItemToCart(userId, product.id, quantity);

        if (result) {
          const updatedCart = await getCartItems(userId);
          dispatch(setCartItems(updatedCart));

          dispatch(addToCart({ productId: product.id, quantity }));
          setAddedToCart((prev) => ({ ...prev, [product.id]: true }));
        } else {
          console.error("Failed to add item to cart.");
        }
      } catch (error) {
        console.error("Error in handleAddToCart:", error);
      }
    };

    const isAddedToCart = (productId) => {
      return cartItems.some((item) => item.productInfo?.id === productId);
    };
    


    return (
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-container">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <div className="quantity-section">
                {/* <label>Quantity:</label> */}
                {/* <input
                  type="number"
                  value={quantities[product.id] || 1}
                  min="1"
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                /> */}
              </div>
              <div className="button-group">
              <button
                  onClick={() => handleAddToCart(product)}
                  className="add-to-cart"
                  disabled={isAddedToCart(product.id)} // Disable button if already in cart
                >
                  {isAddedToCart(product.id) ? "Added to Cart" : "Add to Cart"}
                </button>

                {/* <button className="buy-now">Buy Now</button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  export default ProductCard;


  // const handleAddToCart = async (product) => {
    //   if(!userId) {
    //     console.error("user id not found please login ");
    //     return;
    //   }
    
    //   const cartItem = {
    //     userId, 
    //     productId: product.id,
    //     quantity: quantities[product.id] || 1,
    //   };
    
    //   fetch("http://localhost:8080/addToCart", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(cartItem),
    //   })
    //     .then((response) => response.json())
    //     .then(async (data) => {
    //       console.log("Product added to cart:", data);

    //       const updatedCart = await getCartItems(userId);
    //       // dispatch(setCartItems(updatedCart));
    //       dispatch(addToCart({ ...product, quantity: cartItem.quantity }));
    //     })
    //     .catch((error) => console.error("Error adding product to cart:", error));
    // };
