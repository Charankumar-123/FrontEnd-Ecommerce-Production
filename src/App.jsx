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
import ProtectedRoute from "./components/common/ProtectedRoute";
import UnauthorizedPage from "./components/pages/UnauthorizedPage/UnauthorizedPage";
import SellerDashboard from "./components/pages/Dashboards/SellerDashboard";
import InventoryDashboard from "./components/pages/Dashboards/InventoryDashboard";
import WarehouseDashboard from "./components/pages/Dashboards/WarehouseDashboard";
import AdminDashboard from "./components/pages/Dashboards/AdminDashboard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <main style={{ paddingTop: "98px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductCard />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Authenticated Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "INVENTORY", "WAREHOUSE", "ADMIN"]} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Seller Portal */}
          <Route element={<ProtectedRoute allowedRoles={["SELLER", "ADMIN"]} />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/addproduct" element={<AddProduct />} />
          </Route>

          {/* Inventory Management */}
          <Route element={<ProtectedRoute allowedRoles={["INVENTORY", "ADMIN"]} />}>
            <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
          </Route>

          {/* Warehouse Operations */}
          <Route element={<ProtectedRoute allowedRoles={["WAREHOUSE", "ADMIN"]} />}>
            <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
          </Route>

          {/* Master Admin Console */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
