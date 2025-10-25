import api from './api';
import { Product, Category } from '../types';

export const productService = {
  getProducts: async (params?: {
    category?: string;
    min_price?: number;
    max_price?: number;
    min_eco_score?: number;
    search?: string;
    page?: number;
  }) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  getCategories: async () => {
    try {
      const response = await api.get('/products/categories/');
      
      // Your API returns Django REST framework format: {count, next, previous, results: []}
      return response.data.results || []; // Always return an array
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return []; // Return empty array on error
    }
  },

  getFeaturedProducts: async () => {
    try {
      // Try featured endpoint first
      const response = await api.get('/products/featured/');
      // Handle different response formats to always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        return response.data || [];
      }
    } catch (error) {
      console.warn('Featured products endpoint not available, using high eco-score products fallback');
      // Fallback to products with high eco-score
      try {
        const fallbackResponse = await api.get('/products/', {
          params: { eco_score_min: 8, ordering: '-eco_score', limit: 8 }
        });
        // Handle different response formats to always return an array
        if (Array.isArray(fallbackResponse.data)) {
          return fallbackResponse.data;
        } else if (fallbackResponse.data.results) {
          return fallbackResponse.data.results;
        } else {
          return fallbackResponse.data || [];
        }
      } catch (fallbackError) {
        console.error('Fallback also failed, returning empty array');
        return [];
      }
    }
  },

  addReview: async (productId: number, data: {
    rating: number;
    title: string;
    comment: string;
    sustainability_rating?: number;
    quality_rating?: number;
  }) => {
    const response = await api.post(`/products/${productId}/add_review/`, data);
    return response.data;
  },
};