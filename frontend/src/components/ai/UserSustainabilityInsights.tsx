import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Leaf, TrendingUp, Target, Award } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

export const UserSustainabilityInsights: React.FC = () => {
  const { user } = useAuth();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ['user-sustainability-insights', user?.id],
    queryFn: () => {
      // Add null check to prevent calling with undefined user ID
      if (!user?.id) {
        throw new Error('User ID not available');
      }
      return aiService.getUserSustainabilityInsights(user.id);
    },
    enabled: !!user?.id // Only enable if user ID exists
  });

  // Show nothing if no user or still loading
  if (!user || isLoading) {
    return null;
  }

  // Show fallback UI if no insights data
  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-green-600" />
          Your Sustainability Profile
        </h3>
        <p className="text-gray-600 text-center py-4">
          Sustainability insights will appear here as you make eco-friendly purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Leaf className="w-5 h-5 mr-2 text-green-600" />
        Your Sustainability Profile
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">
            {insights.carbon_footprint_saved || insights.carbon_saved || 0}kg
          </div>
          <div className="text-sm text-green-600">Carbon Saved</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">
            {insights.sustainability_level === 'beginner' ? '🌱' : 
             insights.sustainability_level === 'intermediate' ? '🌿' : '🌳'}
          </div>
          <div className="text-sm text-blue-600 capitalize">
            {insights.sustainability_level || 'beginner'}
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">
            {insights.eco_products_bought || 0}
          </div>
          <div className="text-sm text-purple-600">Green Purchases</div>
        </div>
      </div>

      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Personalized Tips</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {insights.recommendations.slice(0, 3).map((tip: string, index: number) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};