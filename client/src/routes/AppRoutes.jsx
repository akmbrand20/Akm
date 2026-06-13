import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedAdminRoute from "../components/layout/ProtectedAdminRoute";

const Home = lazy(() => import("../pages/public/Home"));
const Shop = lazy(() => import("../pages/public/Shop"));
const ProductDetails = lazy(() => import("../pages/public/ProductDetails"));
const Cart = lazy(() => import("../pages/public/Cart"));
const Checkout = lazy(() => import("../pages/public/Checkout"));
const OrderSuccess = lazy(() => import("../pages/public/OrderSuccess"));
const NotFound = lazy(() => import("../pages/public/NotFound"));
const PolicyPage = lazy(() => import("../pages/public/PolicyPage"));
const SignIn = lazy(() => import("../pages/public/SignIn"));
const SignUp = lazy(() => import("../pages/public/SignUp"));
const MyOrders = lazy(() => import("../pages/public/MyOrders"));
const MyOrderDetails = lazy(() => import("../pages/public/MyOrderDetails"));

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminProductCreate = lazy(() => import("../pages/admin/AdminProductCreate"));
const AdminProductEdit = lazy(() => import("../pages/admin/AdminProductEdit"));
const AdminOffers = lazy(() => import("../pages/admin/AdminOffers"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings"));
const AdminCoupons = lazy(() => import("../pages/admin/AdminCoupons"));
const AdminEmailCampaigns = lazy(
  () => import("../pages/admin/AdminEmailCampaigns")
);

function RouteLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-zinc-400">
      Loading...
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
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
    </Suspense>
  );
}
