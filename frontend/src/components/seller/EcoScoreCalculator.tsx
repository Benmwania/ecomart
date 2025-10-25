import React, { useState, useEffect } from 'react';
import { Calculator, Leaf, Zap, TrendingUp } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { Button } from '../ui/Button';

interface EcoScoreCalculatorProps {
  productData: any;
  onScoreCalculated?: (score: number, breakdown: any) => void;
}

export const EcoScoreCalculator: React.FC<EcoScoreCalculatorProps> = ({
  productData,
  onScoreCalculated
}) => {
  const [calculating, setCalculating] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const calculateEcoScore = async () => {
    setCalculating(true);
    setError('');
    
    try {
      const response = await aiService.calculateEcoScore(productData);
      setScore(response.eco_score);
      setBreakdown(response.breakdown);
      
      if (onScoreCalculated) {
        onScoreCalculated(response.eco_score, response.breakdown);
      }
    } catch (err) {
      setError('Failed to calculate eco-score. Please try again.');
      console.error('Eco-score calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-green-600" />
          Eco-Score Calculator
        </h3>
        <Button
          onClick={calculateEcoScore}
          loading={calculating}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Score
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Get an AI-powered sustainability score for your product based on its attributes, 
        materials, and environmental impact factors.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {score !== null && breakdown && (
        <div className="space-y-4">
          {/* Score Display */}
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
              {score.toFixed(1)}/10
            </div>
            <div className="text-lg font-semibold text-green-800 mb-1">
              {getScoreLabel(score)}
            </div>
            <p className="text-sm text-green-700">
              AI-calculated sustainability rating
            </p>
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
            <div className="space-y-3">
              {breakdown.factors?.map((factor: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {factor.name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(factor.score / factor.max_score) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      +{factor.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          {breakdown.suggestions && breakdown.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                Improvement Suggestions
              </h4>
              <ul className="space-y-2">
                {breakdown.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {score === null && !calculating && (
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Click "Calculate Score" to get your product's sustainability rating</p>
        </div>
      )}
    </div>
  );
};