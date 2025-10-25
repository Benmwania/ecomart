import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag, Star, Eye } from 'lucide-react';

export const SellerAnalytics: React.FC = () => {
  // Mock data - in real app, this would come from API
  const analyticsData = {
    revenue: {
      current: 12489,
      previous: 10890,
      change: 14.7
    },
    orders: {
      current: 156,
      previous: 132,
      change: 18.2
    },
    customers: {
      current: 89,
      previous: 76,
      change: 17.1
    },
    conversion: {
      current: 3.2,
      previous: 2.8,
      change: 14.3
    }
  };

  const topProducts = [
    { name: 'Organic Cotton T-Shirt', views: 1245, sales: 45, conversion: 3.6 },
    { name: 'Bamboo Toothbrush Set', views: 892, sales: 32, conversion: 3.6 },
    { name: 'Reusable Coffee Cup', views: 756, sales: 28, conversion: 3.7 },
    { name: 'Hemp Shopping Bag', views: 634, sales: 25, conversion: 3.9 },
  ];

  const sustainabilityMetrics = [
    { metric: 'Carbon Offset', value: '45 kg', description: 'Through eco-friendly shipping' },
    { metric: 'Plastic Saved', value: '2.3 kg', description: 'From sustainable packaging' },
    { metric: 'Trees Supported', value: '12', description: 'Via reforestation programs' },
    { metric: 'Water Saved', value: '1,200 L', description: 'Through water-efficient products' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Track your business performance and sustainability impact</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${analyticsData.revenue.current.toLocaleString()}</p>
              <div className={`flex items-center text-sm ${analyticsData.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {analyticsData.revenue.change}% from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.orders.current}</p>
              <div className={`flex items-center text-sm ${analyticsData.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {analyticsData.orders.change}% from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.customers.current}</p>
              <div className={`flex items-center text-sm ${analyticsData.customers.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {analyticsData.customers.change}% from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.conversion.current}%</p>
              <div className={`flex items-center text-sm ${analyticsData.conversion.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {analyticsData.conversion.change}% from last month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {product.views} views
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{product.sales} sales</p>
                    <p className="text-sm text-gray-500">{product.conversion}% conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sustainability Impact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sustainability Impact</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {sustainabilityMetrics.map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Satisfaction */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Satisfaction</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
                <span className="text-3xl font-bold text-gray-900 ml-2">4.8</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Average Rating</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">94%</div>
              <p className="text-sm text-gray-600 mt-2">Positive Reviews</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">12</div>
              <p className="text-sm text-gray-600 mt-2">Repeat Customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};