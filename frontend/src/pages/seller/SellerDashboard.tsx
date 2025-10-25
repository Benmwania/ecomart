import React, { useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Plus,
  ShoppingBag,
  MessageSquare,
  Settings
} from 'lucide-react';
import { SellerOverview } from './SellerOverview';
import { SellerProducts } from './SellerProducts';
import { SellerOrders } from './SellerOrders';
import { SellerAnalytics } from './SellerAnalytics';

export const SellerDashboard: React.FC = () => {
  const location = useLocation();

  // ✅ Updated navigation array with proper routing
  const navigation = [
    { name: 'Overview', href: '/seller/dashboard', icon: BarChart3, current: location.pathname === '/seller/dashboard' },
    { name: 'Products', href: '/seller/dashboard/products', icon: Package, current: location.pathname.includes('/products') },
    { name: 'Orders', href: '/seller/dashboard/orders', icon: ShoppingBag, current: location.pathname.includes('/orders') },
    { name: 'Analytics', href: '/seller/dashboard/analytics', icon: TrendingUp, current: location.pathname.includes('/analytics') },
  ];

  const stats = [
    { name: 'Total Revenue', value: '$12,489', change: '+12%', changeType: 'positive' },
    { name: 'Active Products', value: '24', change: '+2', changeType: 'positive' },
    { name: 'Pending Orders', value: '8', change: '-3', changeType: 'negative' },
    { name: 'Customer Rating', value: '4.8/5', change: '+0.2', changeType: 'positive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your products and track your business</p>
            </div>
            <Link
              to="/seller/dashboard/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                      item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
                      <div
                        className={`text-xs ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<SellerOverview />} />
              <Route path="/products/*" element={<SellerProducts />} />
              <Route path="/orders" element={<SellerOrders />} />
              <Route path="/analytics" element={<SellerAnalytics />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};
