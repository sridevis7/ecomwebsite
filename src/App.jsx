import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import ChatBot from './components/ChatBot';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import VisualSearch from './pages/VisualSearch';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Loyalty from './pages/Loyalty';
import Wishlist from './pages/Wishlist';
import Returns from './pages/Returns';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSeller from './pages/RegisterSeller';

import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerProfile from './pages/seller/SellerProfile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSellers from './pages/admin/AdminSellers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReturns from './pages/admin/AdminReturns';
import AdminInventory from './pages/admin/AdminInventory';

// 👉 Set this to your repo name for GitHub Pages, e.g. "/stylehub"
const BASENAME = process.env.PUBLIC_URL || '';

// Layout wrapper that shows Navbar/Footer/ChatBot — skipped for seller/admin panels,
// which use their own sidebar layouts instead (see SellerLayout.jsx / AdminLayout.jsx)
const StorefrontLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
    <ChatBot />
  </>
);

function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#2F2B33',
                  color: '#FBF8F3',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '6px',
                },
              }}
            />

            <Routes>
              {/* ───────────────── Storefront (navbar + footer + chatbot) ───────────────── */}
              <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
              <Route path="/products" element={<StorefrontLayout><Products /></StorefrontLayout>} />
              <Route path="/products/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
              <Route path="/visual-search" element={<StorefrontLayout><VisualSearch /></StorefrontLayout>} />
              <Route path="/community" element={<StorefrontLayout><Community /></StorefrontLayout>} />
              <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
              <Route path="/register" element={<StorefrontLayout><Register /></StorefrontLayout>} />
              <Route path="/register-seller" element={<StorefrontLayout><RegisterSeller /></StorefrontLayout>} />

              {/* ───────────────── Storefront — requires login ───────────────── */}
              <Route path="/cart" element={
                <StorefrontLayout><PrivateRoute><Cart /></PrivateRoute></StorefrontLayout>
              } />
              <Route path="/checkout" element={
                <StorefrontLayout><PrivateRoute><Checkout /></PrivateRoute></StorefrontLayout>
              } />
              <Route path="/orders" element={
                <StorefrontLayout><PrivateRoute><Orders /></PrivateRoute></StorefrontLayout>
              } />
              <Route path="/loyalty" element={
                <StorefrontLayout><PrivateRoute><Loyalty /></PrivateRoute></StorefrontLayout>
              } />
              <Route path="/wishlist" element={
                <StorefrontLayout><PrivateRoute><Wishlist /></PrivateRoute></StorefrontLayout>
              } />
              <Route path="/returns" element={
                <StorefrontLayout><PrivateRoute><Returns /></PrivateRoute></StorefrontLayout>
              } />

              {/* ───────────────── Seller panel (own sidebar layout) ───────────────── */}
              <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<SellerDashboard />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="profile" element={<SellerProfile />} />
              </Route>

              {/* ───────────────── Admin panel (own sidebar layout) ───────────────── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="sellers" element={<AdminSellers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="returns" element={<AdminReturns />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
