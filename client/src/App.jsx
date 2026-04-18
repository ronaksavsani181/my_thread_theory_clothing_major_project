import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// 🌟 THE NEW GLOBAL SCROLL COMPONENT
import ScrollToTop from "./components/ScrollToTop";

// Consumer Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import UserDashboard from "./pages/UserDashboard";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import PaymentHistory from "./pages/PaymentHistory";
import Collections from "./pages/Collections";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyReturns from "./pages/MyReturns";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import Contact from "./pages/contact";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminStockOut from "./pages/admin/AdminStockOut";
import AdminReturns from "./pages/admin/AdminReturns";

/**
 * 🌟 LUXURY UX ARCHITECTURE: AppContent
 * We use a sub-component inside BrowserRouter so we can use the `useLocation` hook.
 * This allows us to instantly detect if a user is in the Admin ecosystem and 
 * completely remove the consumer Navbar and Footer.
 */
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* 🌟 SILENT GLOBAL SCROLL WATCHER: Forces every page to load at the very top */}
      <ScrollToTop />

      {/* 🟢 CONSUMER NAVBAR: Strictly hidden on Admin routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* =========================================
            CONSUMER ROUTES
            ========================================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/my-returns" element={<ProtectedRoute><MyReturns /></ProtectedRoute>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
        
        {/* Utility / Legal Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />

        {/* =========================================
            ADMIN ROUTES (Protected via adminOnly flag)
            ========================================= */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute adminOnly={true}><AdminCoupons /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute adminOnly={true}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/stockouts" element={<ProtectedRoute adminOnly={true}><AdminStockOut /></ProtectedRoute>} />
        <Route path="/admin/returns" element={<ProtectedRoute adminOnly={true}><AdminReturns /></ProtectedRoute>} />
      </Routes>

      {/* 🟢 CONSUMER FOOTER: Strictly hidden on Admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}