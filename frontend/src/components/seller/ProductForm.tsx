import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Trash2, Calculator, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sellerService } from '../../services/sellerService';
import { Button } from '../ui/Button';
import { EcoScoreCalculator } from './EcoScoreCalculator';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  compare_price?: number;
  quantity: number;
  brand: string;
  sku: string;
  
  // Sustainability attributes
  is_organic: boolean;
  is_vegan: boolean;
  is_cruelty_free: boolean;
  is_recyclable: boolean;
  packaging_type: string;
  carbon_footprint?: number;
  sustainability_certifications: string[];
  eco_score?: number;
  
  // Product details
  condition: 'new' | 'refurbished' | 'used_like_new' | 'used_good' | 'used_fair';
  weight?: number;
  dimensions: string;
  
  track_quantity: boolean;
}

interface ProductFormProps {
  product?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmit, 
  loading = false 
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');
  const [showEcoCalculator, setShowEcoCalculator] = useState(false);
  const [calculatedEcoScore, setCalculatedEcoScore] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: product ? {
      ...product,
      sustainability_certifications: product.sustainability_certifications || [],
    } : {
      condition: 'new',
      track_quantity: true,
      is_organic: false,
      is_vegan: false,
      is_cruelty_free: false,
      is_recyclable: false,
      sustainability_certifications: [],
    }
  });

  const sustainabilityCertifications = watch('sustainability_certifications');

  // Watch sustainability fields for eco-score calculation
  const watchedSustainabilityFields = watch([
    'is_organic', 'is_vegan', 'is_cruelty_free', 'is_recyclable',
    'packaging_type', 'carbon_footprint', 'sustainability_certifications'
  ]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim() && !sustainabilityCertifications.includes(newCertification.trim())) {
      setValue('sustainability_certifications', [...sustainabilityCertifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setValue('sustainability_certifications', sustainabilityCertifications.filter(c => c !== cert));
  };

  // Prepare product data for eco-score calculation
  const getProductDataForEcoScore = () => {
    const formData = watch();
    return {
      ...formData,
      images: imagePreviews, // Include images for potential analysis
    };
  };

  const handleEcoScoreCalculated = (score: number, breakdown: any) => {
    setCalculatedEcoScore(score);
    setValue('eco_score', score);
  };

  const onSubmitForm = async (data: ProductFormData) => {
    const formData = new FormData();
    
    // Append product data
    Object.keys(data).forEach(key => {
      if (key === 'sustainability_certifications') {
        formData.append(key, JSON.stringify(data[key as keyof ProductFormData]));
      } else {
        formData.append(key, data[key as keyof ProductFormData] as string);
      }
    });

    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });

    await onSubmit(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Product name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your product in detail"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category and Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a category</option>
                    <option value="clothing">Clothing</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="home">Home & Living</option>
                    <option value="food">Food & Beverages</option>
                    <option value="electronics">Electronics</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    {...register('brand')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  {...register('sku', { required: 'SKU is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., PROD-001"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Compare Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('compare_price')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity cannot be negative' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            {/* Track Quantity */}
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('track_quantity')}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Track quantity</span>
              </label>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Max 5)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sustainability Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sustainability Information</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEcoCalculator(!showEcoCalculator)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Eco-Score
              </Button>
            </div>
            
            {showEcoCalculator && (
              <div className="mb-6">
                <EcoScoreCalculator
                  productData={getProductDataForEcoScore()}
                  onScoreCalculated={handleEcoScoreCalculated}
                />
              </div>
            )}

            {/* Display calculated eco-score */}
            {calculatedEcoScore !== null && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Calculated Eco-Score</h4>
                    <p className="text-sm text-green-700">
                      This score will help customers understand your product's sustainability
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {calculatedEcoScore.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-green-700">AI-Powered Rating</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Sustainability Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_organic')}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_vegan')}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegan</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_cruelty_free')}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cruelty Free</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_recyclable')}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Recyclable Packaging</span>
                </label>
              </div>

              {/* Packaging Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packaging Type
                </label>
                <select
                  {...register('packaging_type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select packaging type</option>
                  <option value="plastic_free">Plastic Free</option>
                  <option value="biodegradable">Biodegradable</option>
                  <option value="recycled">Recycled Materials</option>
                  <option value="minimal">Minimal Packaging</option>
                  <option value="reusable">Reusable</option>
                </select>
              </div>

              {/* Carbon Footprint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbon Footprint (kg CO₂)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('carbon_footprint')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Sustainability Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sustainability Certifications
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Add certification (e.g., Fair Trade, Organic)"
                    />
                    <Button
                      type="button"
                      onClick={addCertification}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Certifications List */}
                  {sustainabilityCertifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sustainabilityCertifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeCertification(cert)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  {...register('condition', { required: 'Condition is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="used_like_new">Used - Like New</option>
                  <option value="used_good">Used - Good</option>
                  <option value="used_fair">Used - Fair</option>
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('weight')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 0.5"
                />
              </div>

              {/* Dimensions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L × W × H in cm)
                </label>
                <input
                  type="text"
                  {...register('dimensions')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 20×15×5"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar with AI Tips */}
      <div className="lg:col-span-1 space-y-6">
        {/* AI Sustainability Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Sustainability Tips
          </h4>
          <div className="space-y-3 text-sm text-blue-800">
            <p>✅ Use specific sustainability certifications</p>
            <p>✅ Provide accurate carbon footprint data</p>
            <p>✅ Include detailed packaging information</p>
            <p>✅ Upload high-quality product images</p>
            <p>✅ Be transparent about materials used</p>
          </div>
        </div>

        {/* Eco-Score Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-3">Why Eco-Score Matters</h4>
          <div className="space-y-2 text-sm text-green-800">
            <p>• 78% of customers prefer sustainable products</p>
            <p>• Higher scores lead to better visibility</p>
            <p>• Builds trust with eco-conscious shoppers</p>
            <p>• Supports environmental impact tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};