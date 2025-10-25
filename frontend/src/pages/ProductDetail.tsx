import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Share2, Truck, Shield, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { ProductRecommendations } from '../components/ai/ProductRecommendations';
import { Button } from '../components/ui/Button';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'sustainability'>('description');

  const { addToCart } = useCart();

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => productService.getProduct(Number(id)),
    { enabled: !!id }
  );

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-6 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-gray-900">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/products" className="hover:text-gray-900">Products</Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/products?category=${product.category.name}`} className="hover:text-gray-900">
              {product.category.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <img
              src={product.images[selectedImage]?.image || '/api/placeholder/600/600'}
              alt={product.name}
              className="w-full h-96 object-cover rounded"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.image}
                    alt={image.alt_text}
                    className="w-full h-20 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {product.average_rating?.toFixed(1) || '4.5'} • 24 reviews
                  </span>
                </div>
                {product.eco_score && (
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    <Leaf className="w-4 h-4 mr-1" />
                    Eco Score: {product.eco_score}/10
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-red-500">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-xl text-gray-500 line-through">${product.compare_price}</span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Sustainability Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.is_organic && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Organic
                </span>
              )}
              {product.is_vegan && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Vegan
                </span>
              )}
              {product.is_cruelty_free && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Cruelty Free
                </span>
              )}
              {product.is_recyclable && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Recyclable
                </span>
              )}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                >
                  -
                </button>
                <span className="px-4 py-1 border-l border-r border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">{product.quantity} available</span>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                Add to Cart
              </Button>
              <Button variant="outline" className="flex-1">
                Buy Now
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-gray-400 mr-2" />
                <span>Free shipping over $50</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-400 mr-2" />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center">
                <Leaf className="w-5 h-5 text-gray-400 mr-2" />
                <span>Carbon neutral delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'sustainability', label: 'Sustainability' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {activeTab === 'sustainability' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Environmental Impact</h4>
                <div className="space-y-3">
                  {product.carbon_footprint && (
                    <div className="flex justify-between">
                      <span>Carbon Footprint:</span>
                      <span className="font-medium">{product.carbon_footprint} kg CO₂</span>
                    </div>
                  )}
                  {product.eco_score && (
                    <div className="flex justify-between">
                      <span>Eco Score:</span>
                      <span className="font-medium">{product.eco_score}/10</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                <div className="space-y-2">
                  {product.sustainability_certifications?.map((cert: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600">• {cert}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <p className="text-gray-600">Reviews will be displayed here.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI-Powered Product Recommendations */}
      <div className="mt-16">
        <ProductRecommendations
          productId={Number(id)}
          type="similar"
          title="More Like This"
          limit={4}
        />
      </div>

      <div className="mt-8">
        <ProductRecommendations
          type="personalized"
          title="You Might Also Like"
          limit={4}
        />
      </div>
    </div>
  );
};
