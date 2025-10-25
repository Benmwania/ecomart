import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Leaf, 
  Recycle, 
  Sprout, 
  TreePine, 
  Sun, 
  Package,
  ArrowRight,
  Star,
  Heart,
  Home,
  Shirt,
  Sparkles,
  Utensils,
  Droplets
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';

// Sustainable e-commerce categories for Ecomart
const categoryData = [
  {
    id: 1,
    name: 'Organic Food & Groceries',
    slug: 'organic-food',
    description: 'Fresh organic produce, pantry staples, and sustainable groceries',
    icon: <Leaf className="w-8 h-8" />,
    color: 'bg-green-100 text-green-600',
    productCount: 0,
    sustainability: 'Reduces pesticide use, supports organic farming'
  },
  {
    id: 2,
    name: 'Eco-Friendly Home',
    slug: 'eco-home',
    description: 'Sustainable cleaning supplies, home goods, and zero-waste essentials',
    icon: <Home className="w-8 h-8" />,
    color: 'bg-blue-100 text-blue-600',
    productCount: 0,
    sustainability: 'Biodegradable, plastic-free, energy efficient'
  },
  {
    id: 3,
    name: 'Sustainable Fashion',
    slug: 'sustainable-fashion',
    description: 'Ethical clothing, organic textiles, and eco-conscious accessories',
    icon: <Shirt className="w-8 h-8" />,
    color: 'bg-purple-100 text-purple-600',
    productCount: 0,
    sustainability: 'Fair trade, organic materials, circular fashion'
  },
  {
    id: 4,
    name: 'Zero Waste Essentials',
    slug: 'zero-waste',
    description: 'Reusable containers, bamboo products, and package-free alternatives',
    icon: <Recycle className="w-8 h-8" />,
    color: 'bg-yellow-100 text-yellow-600',
    productCount: 0,
    sustainability: 'Waste reduction, reusable, compostable'
  },
  {
    id: 5,
    name: 'Natural Beauty & Care',
    slug: 'natural-beauty',
    description: 'Clean beauty products, organic skincare, and cruelty-free personal care',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'bg-pink-100 text-pink-600',
    productCount: 0,
    sustainability: 'Cruelty-free, natural ingredients, sustainable packaging'
  },
  {
    id: 6,
    name: 'Renewable Energy',
    slug: 'renewable-energy',
    description: 'Solar chargers, energy-efficient gadgets, and sustainable tech',
    icon: <Sun className="w-8 h-8" />,
    color: 'bg-orange-100 text-orange-600',
    productCount: 0,
    sustainability: 'Energy efficient, solar powered, low carbon footprint'
  },
  {
    id: 7,
    name: 'Eco-Friendly Kitchen',
    slug: 'eco-kitchen',
    description: 'Sustainable cookware, compostable utensils, and energy-saving appliances',
    icon: <Utensils className="w-8 h-8" />,
    color: 'bg-red-100 text-red-600',
    productCount: 0,
    sustainability: 'Energy saving, durable materials, waste reducing'
  },
  {
    id: 8,
    name: 'Water Conservation',
    slug: 'water-conservation',
    description: 'Water-saving devices, filters, and sustainable hydration solutions',
    icon: <Droplets className="w-8 h-8" />,
    color: 'bg-cyan-100 text-cyan-600',
    productCount: 0,
    sustainability: 'Water efficient, reduces plastic waste, sustainable sourcing'
  }
];

export const CategoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch products for the selected category
  const { data: categoryProducts, isLoading } = useQuery({
    queryKey: ['category-products', selectedCategory],
    queryFn: () => productService.getProducts({ 
      category: selectedCategory || '' 
    }),
    enabled: !!selectedCategory,
  });

  // Fetch all featured products for the "All Products" view
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: () => productService.getFeaturedProducts(),
  });

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(selectedCategory === categorySlug ? null : categorySlug);
  };

  const displayProducts = selectedCategory ? categoryProducts : featuredProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                Sustainable Categories
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Discover our AI-curated sustainable product categories. Each category is carefully 
              selected to help you make eco-friendly choices that benefit both you and the planet.
            </p>
            <div className="bg-green-50 inline-flex items-center px-4 py-2 rounded-full border border-green-200">
              <span className="text-green-800 text-sm font-medium">
                🌱 Powered by AI Sustainability Scoring
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse Eco-Friendly Categories</h2>
              <p className="text-gray-600 mt-1">
                {selectedCategory 
                  ? `Exploring: ${categoryData.find(c => c.slug === selectedCategory)?.name}`
                  : 'Select a category to discover sustainable products'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? 'bg-primary-50 border-primary-200' : ''}
            >
              Show All Products
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryData.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCategory === category.slug 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-green-500 fill-current" />
                    <span className="text-xs font-medium text-green-700">ECO</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-green-700 font-medium mb-2">
                    Sustainability Impact:
                  </p>
                  <p className="text-xs text-gray-600">
                    {category.sustainability}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={`inline-flex items-center text-sm font-medium ${
                    selectedCategory === category.slug ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    Explore
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                  
                  {category.productCount > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.productCount} products
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory 
                  ? `AI-Recommended Products in ${categoryData.find(c => c.slug === selectedCategory)?.name}`
                  : 'Featured Sustainable Products'
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedCategory 
                  ? 'Curated based on sustainability score and environmental impact'
                  : 'Top-rated eco-friendly products across all categories'
                }
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {displayProducts && displayProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayProducts.slice(0, 8).map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {selectedCategory ? 'Developing This Category' : 'Building Our Sustainable Collection'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {selectedCategory 
                      ? 'Our AI is working on curating the best sustainable products for this category. Check back soon!'
                      : 'We are carefully selecting and vetting sustainable products to ensure they meet our high environmental standards.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/products">
                      <Button className="bg-primary-600 hover:bg-primary-700">
                        Browse Available Products
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Request a Category
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Sustainability Section */}
        <div className="bg-gradient-to-r from-green-50 to-primary-50 rounded-2xl p-8 border border-green-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">
                AI-Powered Sustainability
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Eco-Score System</h4>
                <p className="text-sm text-gray-600">Every product rated 1-10 based on environmental impact</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Recycle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Carbon Tracking</h4>
                <p className="text-sm text-gray-600">Monitor your carbon footprint reduction with each purchase</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sprout className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h4>
                <p className="text-sm text-gray-600">AI suggests products based on your sustainability goals</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TreePine className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Impact Analytics</h4>
                <p className="text-sm text-gray-600">See your positive environmental impact in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};