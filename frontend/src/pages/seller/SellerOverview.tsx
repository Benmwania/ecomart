import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, Users, Star, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sellerService } from '../../services/sellerService';

export const SellerOverview: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'seller-dashboard',
    () => sellerService.getDashboardData()
  );

  const recentActivities = [
    { id: 1, type: 'order', message: 'New order #ECO20231215001', time: '2 hours ago' },
    { id: 2, type: 'review', message: 'New 5-star review received', time: '5 hours ago' },
    { id: 3, type: 'product', message: 'Product "Organic Cotton T-Shirt" approved', time: '1 day ago' },
    { id: 4, type: 'order', message: 'Order #ECO20231214005 shipped', time: '2 days ago' },
  ];

  const topProducts = [
    { id: 1, name: 'Organic Cotton T-Shirt', sales: 45, revenue: 1125, rating: 4.8 },
    { id: 2, name: 'Bamboo Toothbrush Set', sales: 32, revenue: 480, rating: 4.9 },
    { id: 3, name: 'Reusable Coffee Cup', sales: 28, revenue: 420, rating: 4.7 },
    { id: 4, name: 'Hemp Shopping Bag', sales: 25, revenue: 375, rating: 4.6 },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-80 rounded-lg"></div>
          <div className="bg-gray-200 h-80 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">$12,489</p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                12% increase
              </div>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
              <div className="flex items-center text-sm text-blue-600">
                2 new this month
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
              <div className="flex items-center text-sm text-green-600">
                8 pending fulfillment
              </div>
            </div>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customer Rating</p>
              <p className="text-2xl font-semibold text-gray-900">4.8/5</p>
              <div className="flex items-center text-sm text-gray-600">
                From 89 reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'review' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/seller/dashboard/orders"
              className="block text-center mt-4 text-sm text-primary-600 hover:text-primary-500"
            >
              View all activity
            </Link>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        {product.rating}
                        <Eye className="w-3 h-3 ml-2 mr-1" />
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${product.revenue}</p>
                    <p className="text-sm text-gray-500">{product.sales} sold</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/seller/dashboard/products"
              className="block text-center mt-4 text-sm text-primary-600 hover:text-primary-500"
            >
              View all products
            </Link>
          </div>
        </div>
      </div>

      {/* Sustainability Impact */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Your Sustainability Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">45 kg</div>
            <div className="text-sm text-green-700">Carbon Offset</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">2.3 kg</div>
            <div className="text-sm text-green-700">Plastic Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">156+</div>
            <div className="text-sm text-green-700">Eco-Conscious Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};