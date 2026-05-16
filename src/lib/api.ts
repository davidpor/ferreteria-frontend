// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

// Agrega el JWT a cada request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Maneja errores globalmente
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: (d: { email: string; password: string }) => api.post('/auth/login', d),
  register: (d: object) => api.post('/auth/register', d),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Productos ──────────────────────────────────────────────────────────────
export const productsApi = {
  list: (p?: object) => api.get('/products', { params: p }),
  getById: (id: number) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  create: (d: object) => api.post('/products', d),
  update: (id: number, d: object) => api.put(`/products/${id}`, d),
  delete: (id: number) => api.delete(`/products/${id}`),
  updateStock: (id: number, d: object) => api.patch(`/products/${id}/stock`, d),
  categories: () => api.get('/products/categories'),
  createCategory: (d: object) => api.post('/products/categories', d),
  catalog: (p?: object) => api.get('/pricing/catalog', { params: p }),
};

// ── Precios ────────────────────────────────────────────────────────────────
export const pricingApi = {
  list: () => api.get('/pricing'),
  getById: (id: number) => api.get(`/pricing/${id}`),
  create: (d: object) => api.post('/pricing', d),
  update: (id: number, d: object) => api.put(`/pricing/${id}`, d),
  addItem: (id: number, d: object) => api.post(`/pricing/${id}/items`, d),
  removeItem: (id: number, itemId: number) => api.delete(`/pricing/${id}/items/${itemId}`),
  assign: (companyId: number, d: object) => api.patch(`/pricing/companies/${companyId}/assign`, d),
  calculate: (d: object) => api.post('/pricing/calculate', d),
};

// ── Cotizaciones ───────────────────────────────────────────────────────────
export const quotesApi = {
  list: (p?: object) => api.get('/quotes', { params: p }),
  getById: (id: number) => api.get(`/quotes/${id}`),
  create: (d: object) => api.post('/quotes', d),
  submit: (id: number) => api.patch(`/quotes/${id}/submit`),
  approve: (id: number, d?: object) => api.patch(`/quotes/${id}/approve`, d),
  reject: (id: number, d: object) => api.patch(`/quotes/${id}/reject`, d),
};

// ── Pedidos ────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: (p?: object) => api.get('/orders', { params: p }),
  getById: (id: number) => api.get(`/orders/${id}`),
  fromQuote: (quoteId: number, d: object) => api.post(`/orders/from-quote/${quoteId}`, d),
  prepare: (id: number, d?: object) => api.patch(`/orders/${id}/prepare`, d),
  dispatch: (id: number, d: object) => api.patch(`/orders/${id}/dispatch`, d),
  deliver: (id: number, d?: object) => api.patch(`/orders/${id}/deliver`, d),
  cancel: (id: number, d: object) => api.patch(`/orders/${id}/cancel`, d),
  update: (id: number, d: object) => api.put(`/orders/${id}`, d),
};

// ── Pagos ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createPreference: (orderId: number) => api.post(`/payments/orders/${orderId}/preference`),
  getStatus: (orderId: number) => api.get(`/payments/orders/${orderId}/status`),
};

// ── Clientes/Empresas ──────────────────────────────────────────────────────
export const companiesApi = {
  list: (p?: object) => api.get('/companies', { params: p }),
  getById: (id: number) => api.get(`/companies/${id}`),
  update: (id: number, d: object) => api.put(`/companies/${id}`, d),
  activate: (id: number) => api.patch(`/companies/${id}/toggle`),
};