import axios from 'axios';

// 👉 When you deploy your backend to Render, change this to:
// https://your-backend-name.onrender.com/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the saved JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stylehub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ───────────────────────── AUTH ───────────────────────── */
export const registerUser = (data) => api.post('/auth/register', data);
export const registerSeller = (data) => api.post('/auth/register-seller', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

/* ───────────────────────── PRODUCTS ───────────────────────── */
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getRecommendations = (id) => api.get(`/products/${id}/recommendations`);
export const getCategories = () => api.get('/products/categories');

/* ───────────────────────── CART ───────────────────────── */
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/remove/${itemId}`);
export const clearCart = () => api.delete('/cart/clear');

/* ───────────────────────── ORDERS ───────────────────────── */
export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/mine');
export const trackOrder = (id) => api.get(`/orders/${id}/track`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);

/* ───────────────────────── REVIEWS ───────────────────────── */
export const addReview = (productId, data) => api.post(`/reviews/${productId}`, data);
export const getReviews = (productId) => api.get(`/reviews/${productId}`);

/* ───────────────────────── RETURNS ───────────────────────── */
export const requestReturn = (data) => api.post('/returns', data);
export const getMyReturns = () => api.get('/returns/mine');

/* ───────────────────────── AI ───────────────────────── */
export const aiChat = (data) => api.post('/ai/chat', data);
export const aiStylist = (data) => api.post('/ai/stylist', data);
export const aiSizePredictor = (data) => api.post('/ai/size', data);

/* ───────────────────────── LOYALTY ───────────────────────── */
export const getLoyaltyPoints = () => api.get('/loyalty');

export default api;
