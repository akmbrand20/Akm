import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Shop from "../pages/public/Shop";
import ProductDetails from "../pages/public/ProductDetails";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderSuccess from "../pages/public/OrderSuccess";
import NotFound from "../pages/public/NotFound";
import PolicyPage from "../pages/public/PolicyPage";
import SignIn from "../pages/public/SignIn";
import SignUp from "../pages/public/SignUp";
import MyOrders from "../pages/public/MyOrders";
import MyOrderDetails from "../pages/public/MyOrderDetails";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminProductCreate from "../pages/admin/AdminProductCreate";
import AdminProductEdit from "../pages/admin/AdminProductEdit";
import AdminOffers from "../pages/admin/AdminOffers";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminEmailCampaigns from "../pages/admin/AdminEmailCampaigns";

import ProtectedAdminRoute from "../components/layout/ProtectedAdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:slug" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
      <Route path="/policy/:type" element={<PolicyPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/my-orders/:id" element={<MyOrderDetails />} />

      <Route path="/admin/login" element={<Navigate to="/signin" replace />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductCreate />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="email-campaigns" element={<AdminEmailCampaigns />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}