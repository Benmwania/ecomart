import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OrderSuccess: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Thank you for your purchase! Your order has been confirmed and will be shipped soon. 
          You'll receive a confirmation email with tracking information shortly.
        </p>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <Package className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Order Placed</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
            
            <div className="flex-1 h-1 bg-primary-600 mx-4"></div>
            
            <div className="text-center">
              <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">Shipped</p>
              <p className="text-xs text-gray-500">Within 24 hours</p>
            </div>
            
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-xs text-gray-500">2-3 business days</p>
            </div>
          </div>
        </div>

        {/* Sustainability Impact */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="font-semibold text-green-800 mb-3">Your Positive Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <strong>Carbon Neutral</strong>
              <p>Shipping emissions offset</p>
            </div>
            <div>
              <strong>Sustainable Products</strong>
              <p>Supporting eco-friendly brands</p>
            </div>
            <div>
              <strong>Plastic Free</strong>
              <p>Minimal, recyclable packaging</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button className="bg-primary-600 hover:bg-primary-700">
              View Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};