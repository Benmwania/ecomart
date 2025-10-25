import api from './api';

export const orderService = {
  // Get order by ID
  getOrderById: async (orderId: string) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get user orders
  getUserOrders: async () => {
    const response = await api.get('/api/orders/my-orders');
    return response.data;
  },

  // Get seller orders
  getSellerOrders: async () => {
    const response = await api.get('/api/orders/seller-orders');
    return response.data;
  }
};