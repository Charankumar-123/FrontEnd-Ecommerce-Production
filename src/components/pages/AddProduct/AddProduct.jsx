import React, { useState } from "react";
import './Addproduct.css';
import { useSelector } from "react-redux";
 

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    quantity: 1,
  });

  const token = useSelector((state) => state.auth.token);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/products/addproducts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // Token passed as parameter
        "Content-Type": "application/json",
    },
      body: JSON.stringify(product),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Product added successfully!");
        setProduct({ name: "", description: "", price: "", image: "" }); // Reset form
      })
      .catch((error) => console.error("Error adding product:", error));
  };

  return (
    <div className="add-product-container">
      <form className="add-product-form" onSubmit={handleSubmit}>
        <h2>Add Product</h2>
        <input type="text" name="name" placeholder="Name" value={product.name} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" value={product.description} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} required />
        <input type="text" name="image" placeholder="Image URL" value={product.image} onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
