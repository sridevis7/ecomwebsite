// ===================================================================
// Connects directly to your real StyleHub backend.
// Uses the same routes your React admin panel uses:
//   POST /api/auth/login
//   GET  /api/admin/dashboard
//   GET  /api/admin/sellers       PUT /api/admin/sellers/:id/approve
//   GET  /api/admin/orders        PUT /api/admin/orders/:id/status
//   GET  /api/admin/inventory
//   GET  /api/admin/returns       PUT /api/admin/returns/:id
// ===================================================================

let API_URL = 'http://localhost:5000/api';
let TOKEN = localStorage.getItem('stylehub_admin_token') || '';

let state = {
  sellers: [], orders: [], inventory: { lowStock: [], outStock: [], allProducts: [] }, returns: [],
  sellerFilter: 'pending', inventoryFilter: 'low',
};

// ───────────────────────── AUTH ─────────────────────────
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  API_URL = document.getElementById('apiUrl').value.trim();
  const errorEl = document.getElementById('loginError');
  errorEl.hidden = true;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    if (data.user.role !== 'admin') {
      throw new Error('This account is not an admin. Promote it to admin in MongoDB first.');
    }

    TOKEN = data.token;
    localStorage.setItem('stylehub_admin_token', TOKEN);
    localStorage.setItem('stylehub_admin_api', API_URL);

    document.getElementById('loginScreen').hidden = true;
    document.getElementById('adminShell').hidden = false;
    loadAll();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
}

function logout() {
  TOKEN = '';
  localStorage.removeItem('stylehub_admin_token');
  document.getElementById('adminShell').hidden = true;
  document.getElementById('loginScreen').hidden = false;
}

// Auto-login if a token was already saved from before
window.addEventListener('DOMContentLoaded', () => {
  const savedApi = localStorage.getItem('stylehub_admin_api');
  if (savedApi) document.getElementById('apiUrl').value = savedApi;
  if (TOKEN) {
    API_URL = savedApi || API_URL;
    document.getElementById('loginScreen').hidden = true;
    document.getElementById('adminShell').hidden = false;
    loadAll();
  }
});

// ───────────────────────── API HELPER ─────────────────────────
async function apiCall(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Session expired — please sign in again');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ───────────────────────── NAVIGATION ─────────────────────────
function showView(viewName) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((n) => n.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
  const navLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  if (navLink) navLink.classList.add('active');
}
document.querySelectorAll('.nav-link').forEach((btn) => btn.addEventListener('click', () => showView(btn.dataset.view)));
document.querySelectorAll('[data-goto]').forEach((btn) => btn.addEventListener('click', () => showView(btn.dataset.goto)));

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// ───────────────────────── LOAD EVERYTHING ─────────────────────────
async function loadAll() {
  try {
    const dashboard = await apiCall('/admin/dashboard');
    renderDashboard(dashboard);
  } catch (err) { showToast(err.message); }

  try {
    state.sellers = await apiCall('/admin/sellers');
    renderSellers();
  } catch (err) { showToast(err.message); }

  try {
    state.orders = await apiCall('/admin/orders');
    renderOrders();
  } catch (err) { showToast(err.message); }

  try {
    state.inventory = await apiCall('/admin/inventory');
    renderInventory();
  } catch (err) { showToast(err.message); }

  try {
    state.returns = await apiCall('/admin/returns');
    renderReturns();
  } catch (err) { showToast(err.message); }
}

// ───────────────────────── DASHBOARD ─────────────────────────
function renderDashboard(d) {
  document.getElementById('statRevenue').textContent = `Rs. ${(d.totalRevenue || 0).toLocaleString()}`;
  document.getElementById('statOrders').textContent = d.totalOrders || 0;
  document.getElementById('statCustomers').textContent = d.totalCustomers || 0;
  document.getElementById('statSellers').textContent = d.totalSellers || 0;

  document.getElementById('navSellerCount').textContent = d.pendingSellers || 0;
  const banner = document.getElementById('pendingBanner');
  if (d.pendingSellers > 0) {
    banner.hidden = false;
    document.getElementById('pendingCount').textContent = d.pendingSellers;
  } else {
    banner.hidden = true;
  }

  const chartEl = document.getElementById('revenueChart');
  if (!d.monthlySales || d.monthlySales.length === 0) {
    chartEl.innerHTML = '<div class="empty-row">No sales data yet.</div>';
    return;
  }
  const max = Math.max(...d.monthlySales.map((m) => m.revenue), 1);
  chartEl.innerHTML = d.monthlySales.map((m) => `
    <div class="bar-col">
      <div class="bar" style="height:${(m.revenue / max) * 140}px"></div>
      <span class="bar-label">${m._id.month}/${m._id.year}</span>
    </div>`).join('');
}

// ───────────────────────── SELLERS ─────────────────────────
function renderSellers() {
  const list = document.getElementById('sellerList');
  const filtered = state.sellerFilter === 'all' ? state.sellers : state.sellers.filter((s) => s.approvalStatus === state.sellerFilter);

  if (filtered.length === 0) { list.innerHTML = '<div class="empty-row">No sellers match this filter.</div>'; return; }

  list.innerHTML = filtered.map((s) => `
    <div class="entry-card">
      <span class="entry-spine ${s.approvalStatus}"></span>
      <div class="entry-info">
        <strong>${s.shopName}</strong>
        <span>${s.userId?.name || ''} · ${s.userId?.email || ''}</span>
        <span>${s.userId?.phone || ''}</span>
        ${s.shopDescription ? `<p>${s.shopDescription}</p>` : ''}
      </div>
      <div class="entry-right">
        <span class="tag tag-${s.approvalStatus}">${s.approvalStatus}</span>
        ${s.approvalStatus === 'pending' ? `
          <div class="entry-actions">
            <button class="btn btn-primary" onclick="approveSeller('${s._id}','approved')">Approve</button>
            <button class="btn btn-outline" onclick="approveSeller('${s._id}','rejected')">Reject</button>
          </div>` : s.approvalStatus === 'approved' ? `
          <button class="text-action" onclick="approveSeller('${s._id}','rejected')">Revoke access</button>` : `
          <button class="text-action" onclick="approveSeller('${s._id}','approved')">Approve anyway</button>`}
      </div>
    </div>`).join('');
}

async function approveSeller(id, status) {
  try {
    await apiCall(`/admin/sellers/${id}/approve`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast(`Seller ${status}`);
    state.sellers = await apiCall('/admin/sellers');
    renderSellers();
    const dashboard = await apiCall('/admin/dashboard');
    renderDashboard(dashboard);
  } catch (err) { showToast(err.message); }
}

document.querySelectorAll('#sellerFilterTabs button').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('#sellerFilterTabs button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.sellerFilter = btn.dataset.filter;
  renderSellers();
}));

// ───────────────────────── ORDERS ─────────────────────────
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function renderOrders() {
  const table = document.getElementById('orderTable');
  const rowStyle = 'style="grid-template-columns:1fr 1.3fr 1fr 1fr 1fr"';

  if (state.orders.length === 0) {
    table.innerHTML = `<div class="table-row table-head" ${rowStyle}><span>Order</span><span>Customer</span><span>Total</span><span>Payment</span><span>Status</span></div><div class="empty-row">No orders yet.</div>`;
    return;
  }

  const rows = state.orders.map((o) => `
    <div class="table-row" ${rowStyle}>
      <span>#${o._id.slice(-6).toUpperCase()}</span>
      <span>${o.userId?.name || 'Unknown'}</span>
      <span>Rs. ${o.totalAmount.toLocaleString()}</span>
      <span>${o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'}</span>
      <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
        ${ORDER_STATUSES.map((s) => `<option value="${s}" ${s === o.orderStatus ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>`).join('');

  table.innerHTML = `<div class="table-row table-head" ${rowStyle}><span>Order</span><span>Customer</span><span>Total</span><span>Payment</span><span>Status</span></div>` + rows;
}

async function updateOrderStatus(id, status) {
  try {
    await apiCall(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ orderStatus: status }) });
    showToast('Order status updated');
  } catch (err) { showToast(err.message); }
}

// ───────────────────────── INVENTORY ─────────────────────────
function renderInventory() {
  const table = document.getElementById('inventoryTable');
  const rowStyle = 'style="grid-template-columns:2fr 1fr 1fr 1fr"';

  const list = state.inventoryFilter === 'low' ? state.inventory.lowStock
    : state.inventoryFilter === 'out' ? state.inventory.outStock
    : state.inventory.allProducts;

  if (!list || list.length === 0) {
    table.innerHTML = `<div class="table-row table-head" ${rowStyle}><span>Product</span><span>Seller</span><span>Stock</span><span>Sold</span></div><div class="empty-row">Nothing here.</div>`;
    return;
  }

  const rows = list.map((p) => `
    <div class="table-row" ${rowStyle}>
      <span>${p.name}</span>
      <span>${p.sellerId?.shopName || '—'}</span>
      <span>${p.stock === 0 ? '<span class="tag tag-rejected">Out</span>' : p.stock < 5 ? `<span class="tag tag-pending">${p.stock}</span>` : p.stock}</span>
      <span>${p.sold || 0}</span>
    </div>`).join('');

  table.innerHTML = `<div class="table-row table-head" ${rowStyle}><span>Product</span><span>Seller</span><span>Stock</span><span>Sold</span></div>` + rows;
}

document.querySelectorAll('#inventoryFilterTabs button').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('#inventoryFilterTabs button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.inventoryFilter = btn.dataset.filter;
  renderInventory();
}));

// ───────────────────────── RETURNS ─────────────────────────
function renderReturns() {
  const list = document.getElementById('returnsList');

  if (state.returns.length === 0) { list.innerHTML = '<div class="empty-row">No return requests.</div>'; return; }

  list.innerHTML = state.returns.map((r) => `
    <div class="entry-card">
      <span class="entry-spine ${r.status}"></span>
      <div class="entry-info">
        <strong>Order #${r.orderId?._id ? r.orderId._id.slice(-6).toUpperCase() : '—'}</strong>
        <span>${r.userId?.name || ''} · ${r.userId?.email || ''}</span>
        <span>Reason: ${r.reason}</span>
        ${r.description ? `<p>${r.description}</p>` : ''}
      </div>
      <div class="entry-right">
        <span class="tag tag-${r.status}">${r.status}</span>
        ${r.status === 'requested' ? `
          <div class="entry-actions">
            <button class="btn btn-primary" onclick="updateReturn('${r._id}','approved')">Approve</button>
            <button class="btn btn-outline" onclick="updateReturn('${r._id}','rejected')">Reject</button>
          </div>` : r.status === 'approved' ? `
          <button class="btn btn-primary" onclick="updateReturn('${r._id}','refunded')">Mark refunded</button>` : ''}
      </div>
    </div>`).join('');
}

async function updateReturn(id, status) {
  try {
    await apiCall(`/admin/returns/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast(`Return ${status}`);
    state.returns = await apiCall('/admin/returns');
    renderReturns();
  } catch (err) { showToast(err.message); }
}