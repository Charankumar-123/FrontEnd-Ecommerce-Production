import React from "react";
import { Routes, Route } from "react-router-dom";
import NavigationBar from "./components/pages/NavigationBar/NavigationBar";
import ProductCard from "./components/Cards/ProductCard";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import SignUp from "./components/pages/SignUpPage/SignUp";
import CartPage from "./components/pages/CartPage/CartPage";
import PaymentPage from "./components/pages/PaymentPage/PaymentPage";
import OrdersPage from "./components/pages/OrdersPage/OrdersPage";
import ProfilePage from "./components/pages/ProfilePage/ProfilePage";
import ContactPage from "./components/pages/ContactPage/ContactPage";
import AddProduct from "./components/pages/AddProduct/AddProduct";
import ProductDetailPage from "./components/pages/ProductDetailPage/ProductDetailPage";
import OAuth2RedirectHandler from "./components/pages/OAuth/OAuth2RedirectHandler";
import "./App.css";

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <main style={{ paddingTop: "98px" }}>
        <Routes>
          <Route path="/" element={<ProductCard />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
