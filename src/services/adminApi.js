import api from './api';

/* ───────────────────────── ADMIN DASHBOARD ───────────────────────── */
export const getAdminDashboard = () => api.get('/admin/dashboard');

/* ───────────────────────── SELLERS ───────────────────────── */
export const getAllSellers = () => api.get('/admin/sellers');
export const approveSeller = (id, status) => api.put(`/admin/sellers/${id}/approve`, { status });

/* ───────────────────────── CUSTOMERS ───────────────────────── */
export const getAllCustomers = () => api.get('/admin/customers');
export const banCustomer = (id) => api.put(`/admin/customers/${id}/ban`);

/* ───────────────────────── ORDERS ───────────────────────── */
export const getAllOrders = () => api.get('/admin/orders');
export const updateAdminOrderStatus = (id, orderStatus) => api.put(`/admin/orders/${id}/status`, { orderStatus });

/* ───────────────────────── CATEGORIES ───────────────────────── */
export const getAdminCategories = () => api.get('/admin/categories');
export const addCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

/* ───────────────────────── COUPONS ───────────────────────── */
export const getAdminCoupons = () => api.get('/admin/coupons');
export const addCoupon = (data) => api.post('/admin/coupons', data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);

/* ───────────────────────── RETURNS ───────────────────────── */
export const getAdminReturns = () => api.get('/admin/returns');
export const updateAdminReturn = (id, data) => api.put(`/admin/returns/${id}`, data);

/* ───────────────────────── INVENTORY ───────────────────────── */
export const getAdminInventory = () => api.get('/admin/inventory');
