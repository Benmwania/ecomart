import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Leaf, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
          <img
            src={product.images?.[0]?.image || '/api/placeholder/300/300'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product.eco_score && product.eco_score >= 8 && (
            <div className="absolute top-2 left-2 bg-eco-green text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              Eco {product.eco_score}/10
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 flex-1">
              {product.name}
            </h3>
            <button className="text-gray-400 hover:text-red-500 ml-2">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.average_rating?.toFixed(1) || '4.5'}
              </span>
            </div>
            {product.is_organic && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Organic
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.compare_price}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};