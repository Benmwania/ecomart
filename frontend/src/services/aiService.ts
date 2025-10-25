import api from './api';

export const aiService = {
  // Get personalized recommendations for user
  getRecommendations: async (userId?: number, limit: number = 10) => {
    try {
      const params: any = { limit };
      if (userId) params.user_id = userId;
      
      const response = await api.get('/ai/recommendations/', { params });
      
      // Handle different response formats
      if (response.data.recommended_products) {
        return response.data.recommended_products;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data.results || response.data || [];
      }
    } catch (error) {
      console.warn('AI recommendations endpoint not available, using high eco-score products fallback');
      // Fallback to products with high eco-score
      try {
        const response = await api.get('/products/', { 
          params: { limit, ordering: '-eco_score' }
        });
        return response.data.results || response.data || [];
      } catch (fallbackError) {
        console.error('Fallback also failed, returning empty array');
        return [];
      }
    }
  },

  // Get similar products
  getSimilarProducts: async (productId: number, limit: number = 8) => {
    try {
      const response = await api.get(`/ai/products/${productId}/similar/`, {
        params: { limit }
      });
      
      // Handle different response formats
      if (response.data.similar_products) {
        return response.data.similar_products;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data.results || response.data || [];
      }
    } catch (error) {
      console.warn('Similar products endpoint not available, using recent products fallback');
      // Fallback to recent products
      try {
        const response = await api.get('/products/', { 
          params: { limit, ordering: '-created_at' }
        });
        return response.data.results || response.data || [];
      } catch (fallbackError) {
        console.error('Fallback also failed, returning empty array');
        return [];
      }
    }
  },

  // Calculate eco-score for a product (for sellers)
  calculateEcoScore: async (productData: any) => {
    try {
      const response = await api.post('/ai/eco-score/calculate/', productData);
      return response.data;
    } catch (error) {
      console.warn('Eco-score calculation endpoint not available');
      // Return a default eco-score as fallback
      return { eco_score: 7.5, factors: [] };
    }
  },

  // Get user sustainability insights
  getUserSustainabilityInsights: async (userId: number) => {
    try {
      const response = await api.get('/ai/sustainability-insights/');
      return response.data;
    } catch (error) {
      console.warn('Sustainability insights endpoint not available');
      // Return default insights as fallback
      return {
        carbon_footprint_saved_kg: 12.5,
        trees_saved: 3,
        plastic_reduced_kg: 2.1,
        sustainability_level: 'beginner',
        eco_products_bought: 0,
        personalized_recommendations: [
          'Try adding more organic products to your cart',
          'Look for products with eco-score above 8',
          'Consider local products to reduce carbon footprint'
        ]
      };
    }
  },

  // Get trending sustainable products
  getTrendingProducts: async (category?: string, limit: number = 12) => {
    try {
      const params: any = { limit };
      if (category) params.category = category;
      
      const response = await api.get('/ai/trending-products/', { params });
      
      // Handle different response formats
      if (response.data.trending_products) {
        return response.data.trending_products;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data.results || response.data || [];
      }
    } catch (error) {
      console.warn('Trending products endpoint not available, using popular products fallback');
      // Fallback to popular products (ordered by views/rating)
      try {
        const response = await api.get('/products/', { 
          params: { limit, ordering: '-views,-rating' }
        });
        return response.data.results || response.data || [];
      } catch (fallbackError) {
        console.error('Fallback also failed, returning empty array');
        return [];
      }
    }
  },
};