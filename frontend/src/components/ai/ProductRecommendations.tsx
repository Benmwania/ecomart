import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Leaf } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { ProductCard } from '../ui/ProductCard';
import { Button } from '../ui/Button';

interface ProductRecommendationsProps {
  userId?: number;
  productId?: number;
  type: 'personalized' | 'similar' | 'trending';
  title?: string;
  limit?: number;
  category?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  userId,
  productId,
  type,
  title,
  limit = 8,
  category
}) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['ai-recommendations', type, userId, productId, limit, category],
    queryFn: () => {
      switch (type) {
        case 'personalized':
          return aiService.getRecommendations(userId, limit);
        case 'similar':
          if (!productId) throw new Error('Product ID required for similar products');
          return aiService.getSimilarProducts(productId, limit);
        case 'trending':
          return aiService.getTrendingProducts(category, limit);
        default:
          return aiService.getRecommendations(userId, limit);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: type !== 'similar' || !!productId
  });

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'personalized':
        return 'Recommended For You';
      case 'similar':
        return 'Similar Sustainable Products';
      case 'trending':
        return 'Trending Eco-Friendly Products';
      default:
        return 'Recommended Products';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'personalized':
        return 'Based on your preferences and browsing history';
      case 'similar':
        return 'Products with similar sustainability features';
      case 'trending':
        return 'Popular choices among eco-conscious shoppers';
      default:
        return '';
    }
  };

  if (error) {
    console.error('AI recommendations error:', error);
    return null; // Fail silently for better UX
  }

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // FIXED: Added Array.isArray check to prevent .map() error
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            {type === 'personalized' ? (
              <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
            ) : (
              <Leaf className="w-6 h-6 text-green-600 mr-2" />
            )}
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          </div>
          {getSubtitle() && (
            <p className="text-gray-600 max-w-2xl mx-auto">{getSubtitle()}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* AI Explanation (for personalized recommendations) */}
        {type === 'personalized' && products.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              🤖 Our AI selected these based on your sustainability preferences and similar choices
            </p>
          </div>
        )}
      </div>
    </section>
  );
};