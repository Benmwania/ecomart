import api from './api';

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders/orders/');
    return response.data;
  },

  getOrder: async (id: number) => {
    const response = await api.get(`/orders/orders/${id}/`);
    return response.data;
  },

  createOrder: async (data: any) => {
    const response = await api.post('/orders/orders/', data);
    return response.data;
  },

  cancelOrder: async (id: number) => {
    const response = await api.post(`/orders/orders/${id}/cancel/`);
    return response.data;
  },
};