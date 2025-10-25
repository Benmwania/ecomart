import api from './api';
import { Cart } from '../types';

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/orders/cart/');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post('/orders/cart/items/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (productId: number, quantity: number) => {
    const response = await api.put(`/orders/cart/items/${productId}/`, {
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (productId: number) => {
    const response = await api.delete(`/orders/cart/items/${productId}/`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/orders/cart/clear/');
    return response.data;
  },
};