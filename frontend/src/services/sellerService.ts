import api from './api';

export const sellerService = {
  // Dashboard
  getDashboardData: async () => {
    const response = await api.get('/seller/dashboard/');
    return response.data;
  },

  // Products
  getProducts: async (params?: { status?: string }) => {
    const response = await api.get('/seller/products/', { params });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/seller/products/${id}/`);
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await api.post('/seller/products/', data);
    return response.data;
  },

  updateProduct: async (id: number, data: any) => {
    const response = await api.put(`/seller/products/${id}/`, data);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/seller/products/${id}/`);
    return response.data;
  },

  // Orders
  getOrders: async (params?: { status?: string }) => {
    const response = await api.get('/seller/orders/', { params });
    return response.data;
  },

  getOrder: async (id: number) => {
    const response = await api.get(`/seller/orders/${id}/`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.patch(`/seller/orders/${id}/`, { status });
    return response.data;
  },

  // Analytics
  getAnalytics: async (period: string = 'monthly') => {
    const response = await api.get('/seller/analytics/', { params: { period } });
    return response.data;
  },
};