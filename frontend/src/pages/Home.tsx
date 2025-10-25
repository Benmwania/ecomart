import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  Shield,
  Truck,
  Star,
  Sparkles,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { aiService } from '../services/aiService';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductRecommendations } from '../components/ai/ProductRecommendations';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeaturedProducts()
  });

  const { data: personalizedRecommendations } = useQuery({
    queryKey: ['personalized-recommendations', user?.id],
    queryFn: () => aiService.getRecommendations(user?.id, 8),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-eco-green" />,
      title: 'Eco-Friendly Products',
      description:
        'Carefully curated sustainable items with verified environmental impact',
    },
    {
      icon: <Shield className="w-8 h-8 text-eco-green" />,
      title: 'Quality Assured',
      description:
        'All products meet our strict sustainability and quality standards',
    },
    {
      icon: <Truck className="w-8 h-8 text-eco-green" />,
      title: 'Carbon Neutral Shipping',
      description: 'We offset carbon emissions for every delivery',
    },
    {
      icon: <Star className="w-8 h-8 text-eco-green" />,
      title: 'AI Recommendations',
      description:
        'Personalized suggestions based on your sustainability preferences',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Shop Sustainable.
              <span className="text-primary-600 block">Live Conscious.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover eco-friendly products that are good for you and the planet.
              Every purchase makes a positive impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose EcoMart?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to making sustainable shopping accessible,
              transparent, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations for Logged-in Users */}
      {user && (
        <ProductRecommendations
          userId={user.id}
          type="personalized"
          title="Just For You"
          limit={8}
        />
      )}

      {/* Trending Sustainable Products */}
      <ProductRecommendations
        type="trending"
        title="Trending Eco-Friendly Products"
        limit={8}
      />

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600 mt-2">
                Handpicked sustainable items with high eco-scores
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                >
                  <div className="bg-gray-200 h-48 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* FIXED: Added Array.isArray check to prevent .map error */}
              {Array.isArray(featuredProducts) && featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sustainability Impact Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Sustainability
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent system helps you make better choices for the planet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Recommendations
              </h3>
              <p className="text-gray-600">
                AI suggests products based on your sustainability preferences and
                values
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Eco-Score System
              </h3>
              <p className="text-gray-600">
                Every product gets a sustainability rating based on multiple
                environmental factors
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Impact Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your positive environmental impact with every sustainable
                purchase
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};