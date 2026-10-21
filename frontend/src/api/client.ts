// Centralized API Client with credentials, CSRF token handling, and typed backend endpoints

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Auto-inject CSRF token for state-mutating HTTP methods
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) {
      headers.set('X-XSRF-TOKEN', xsrf);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Includes JSESSIONID session cookie
  });

  if (response.status === 204) {
    return { success: true } as ApiResponse<T>;
  }

  let body: any;
  try {
    body = await response.json();
  } catch {
    body = { success: response.ok, message: response.statusText };
  }

  if (!response.ok) {
    const errorMsg = body?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { response?: any; status?: number; code?: string };
    err.response = body;
    err.status = response.status;
    err.code = body?.code;
    throw err;
  }

  return body as ApiResponse<T>;
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),

  // Auth endpoints
  auth: {
    csrf: () => api.get('/auth/csrf'),
    me: () => api.get('/auth/me'),
    login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
    registerFarmer: (data: any) => api.post('/auth/register', data),
    registerBuyer: (data: any) => api.post('/auth/register-buyer', data),
    logout: () => api.post('/auth/logout'),
  },

  // Farmer endpoints
  farmer: {
    // Crops
    getCrops: () => api.get('/farmer/crops'),
    createCrop: (data: any) => api.post('/farmer/crops', data),
    updateCrop: (id: string, data: any) => api.put(`/farmer/crops/${id}`, data),
    deleteCrop: (id: string) => api.delete(`/farmer/crops/${id}`),

    // Expenses
    getExpenses: (cropId?: string, from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (cropId) params.set('cropId', cropId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const query = params.toString() ? `?${params.toString()}` : '';
      return api.get(`/farmer/expenses${query}`);
    },
    createExpense: (data: any) => api.post('/farmer/expenses', data),
    updateExpense: (id: string, data: any) => api.put(`/farmer/expenses/${id}`, data),
    deleteExpense: (id: string) => api.delete(`/farmer/expenses/${id}`),

    // Workers
    getWorkers: () => api.get('/farmer/workers'),
    createWorker: (data: any) => api.post('/farmer/workers', data),
    updateWorker: (id: string, data: any) => api.put(`/farmer/workers/${id}`, data),
    deleteWorker: (id: string) => api.delete(`/farmer/workers/${id}`),

    // Field Operations & Reminders
    getWaterRecords: () => api.get('/farmer/water-records'),
    createWaterRecord: (data: any) => api.post('/farmer/water-records', data),
    deleteWaterRecord: (id: string) => api.delete(`/farmer/water-records/${id}`),

    getInputRecords: () => api.get('/farmer/input-records'),
    createInputRecord: (data: any) => api.post('/farmer/input-records', data),
    deleteInputRecord: (id: string) => api.delete(`/farmer/input-records/${id}`),

    getReminders: () => api.get('/farmer/reminders'),
    createReminder: (data: any) => api.post('/farmer/reminders', data),
    toggleReminder: (id: string) => api.patch(`/farmer/reminders/${id}/toggle`),
    deleteReminder: (id: string) => api.delete(`/farmer/reminders/${id}`),

    // Reports
    getSummaryReport: () => api.get('/farmer/reports/summary'),
    getDateWiseReport: (from?: string, to?: string) => {
      const q = from && to ? `?from=${from}&to=${to}` : '';
      return api.get(`/farmer/reports/date-wise${q}`);
    },
    getCropWiseReport: (cropId: string) => api.get(`/farmer/reports/crop-wise?cropId=${encodeURIComponent(cropId)}`),
    getWorkerWiseReport: () => api.get('/farmer/reports/worker-wise'),
  },

  // Marketplace & Buyer endpoints
  mart: {
    getProducts: () => api.get('/mart/products'),
    getProduct: (id: string) => api.get(`/mart/products/${id}`),
    getCart: () => api.get('/mart/cart'),
    addToCart: (productId: string, quantity: number) => api.post('/mart/cart', { productId, quantity }),
    updateCartItem: (id: string, quantity: number) => api.put(`/mart/cart/${id}`, { quantity }),
    removeCartItem: (id: string) => api.delete(`/mart/cart/${id}`),
    checkout: (data: { shippingAddress: string; city: string; pinCode: string; contactNumber?: string }) =>
      api.post('/mart/checkout', data),
    getOrders: () => api.get('/mart/orders'),
    getOrderDetail: (id: string) => api.get(`/mart/orders/${id}`),
    reportPayment: (id: string) => api.post(`/mart/orders/${id}/pay`),
    cancelOrder: (id: string) => api.post(`/mart/orders/${id}/cancel`),
    getPaymentSettings: () => api.get('/mart/payment-settings'),
  },

  // Admin endpoints
  admin: {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (role?: string) => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
    updateUserStatus: (id: string, active: boolean) => api.patch(`/admin/users/${id}/status`, { active }),
    getProducts: () => api.get('/admin/products'),
    createProduct: (data: any) => api.post('/admin/products', data),
    updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/admin/upload', formData);
    },
    getOrders: (status?: string) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`),
    updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
    getPaymentSettings: () => api.get('/admin/payment-settings'),
    updatePaymentSettings: (data: any) => api.put('/admin/payment-settings', data),
    getAuditLogs: () => api.get('/admin/audit-logs'),
  },
};
