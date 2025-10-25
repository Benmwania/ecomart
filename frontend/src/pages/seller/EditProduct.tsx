import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductForm } from '../../components/seller/ProductForm';
import { sellerService } from '../../services/sellerService';
import { Button } from '../../components/ui/Button';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => sellerService.getProduct(Number(id)),
    { enabled: !!id }
  );

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    
    setLoading(true);
    try {
      await sellerService.updateProduct(Number(id), formData);
      navigate('/seller/dashboard/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 rounded w-1/4 mb-8"></div>
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/seller/dashboard/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/seller/dashboard/products')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">
            Update your product information and sustainability details
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm product={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};