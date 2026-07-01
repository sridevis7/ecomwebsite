import api from './api';

/* ───────────────────────── WISHLIST ───────────────────────── */
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

/* ───────────────────────── COMMUNITY FEED ───────────────────────── */
export const getCommunityFeed = () => api.get('/community');
export const createCommunityPost = (formData) =>
  api.post('/community', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const likeCommunityPost = (id) => api.put(`/community/${id}/like`);
export const commentOnPost = (id, text) => api.post(`/community/${id}/comments`, { text });
export const deleteCommunityPost = (id) => api.delete(`/community/${id}`);
