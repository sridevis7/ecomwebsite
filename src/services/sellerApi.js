import api from './api';

/* ───────────────────────── SELLER ───────────────────────── */
export const getSellerProfile = () => api.get('/seller/profile');
export const updateSellerProfile = (data) => api.put('/seller/profile', data);
export const getSellerDashboard = () => api.get('/seller/dashboard');

export const getSellerProducts = () => api.get('/seller/products');
export const addSellerProduct = (formData) =>
  api.post('/seller/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSellerProduct = (id, data) => api.put(`/seller/products/${id}`, data);
export const deleteSellerProduct = (id) => api.delete(`/seller/products/${id}`);
export const restockSellerProduct = (id, stock) => api.put(`/seller/products/${id}/restock`, { stock });

export const getSellerOrders = () => api.get('/seller/orders');
export const updateSellerOrderStatus = (id, orderStatus) => api.put(`/seller/orders/${id}/status`, { orderStatus });
export const getAddressLabel = (id) => api.get(`/seller/orders/${id}/address-label`);
