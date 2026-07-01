import api from './api';

/* ───────────────────────── VISUAL SEARCH ───────────────────────── */
export const visualSearch = (formData) =>
  api.post('/visual-search', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
