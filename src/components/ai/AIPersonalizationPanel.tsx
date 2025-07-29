import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  ChartBar,
  Zap,
  Award
} from 'lucide-react';

interface CustomerInsights {
  email: string;
  churnRiskScore: number;
  purchasePropensityScore: number;
  engagementScore: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'vip';
  lifetimeValue: number;
  recommendedPrize: {
    type: string;
    value: string;
    reason: string;
  };
}

interface AIPersonalizationPanelProps {
  customerInsights?: CustomerInsights;
  onApplyRecommendation?: () => void;
}

export const AIPersonalizationPanel: React.FC<AIPersonalizationPanelProps> = ({
  customerInsights,
  onApplyRecommendation
}) => {
  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'text-red-500';
    if (score > 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPropensityColor = (score: number) => {
    if (score > 0.7) return 'text-green-500';
    if (score > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip': return '👑';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (!customerInsights) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI Personalization</h3>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>
        <p className="text-gray-600">Enter customer email to see AI-powered insights and recommendations</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>
        <span className="text-2xl">{getTierIcon(customerInsights.loyaltyTier)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Churn Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getRiskColor(customerInsights.churnRiskScore)}`}>
              {(customerInsights.churnRiskScore * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">
              {customerInsights.churnRiskScore > 0.7 ? 'High' : 
               customerInsights.churnRiskScore > 0.4 ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Purchase Intent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getPropensityColor(customerInsights.purchasePropensityScore)}`}>
              {(customerInsights.purchasePropensityScore * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">
              {customerInsights.purchasePropensityScore > 0.7 ? 'High' : 
               customerInsights.purchasePropensityScore > 0.4 ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {(customerInsights.engagementScore * 100).toFixed(0)}%
            </span>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${customerInsights.engagementScore * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBar className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Lifetime Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              ${customerInsights.lifetimeValue.toFixed(0)}
            </span>
            <Award className={`w-4 h-4 ${
              customerInsights.loyaltyTier === 'vip' ? 'text-purple-500' :
              customerInsights.loyaltyTier === 'gold' ? 'text-yellow-500' :
              customerInsights.loyaltyTier === 'silver' ? 'text-gray-400' :
              'text-orange-600'
            }`} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">AI Recommendation</span>
        </div>
        <p className="text-sm mb-3">
          Offer <strong>{customerInsights.recommendedPrize.value}</strong> {customerInsights.recommendedPrize.type}
        </p>
        <p className="text-xs opacity-90 mb-3">
          {customerInsights.recommendedPrize.reason}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApplyRecommendation}
          className="w-full bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-2 px-4 text-sm font-medium"
        >
          Apply AI Recommendation
        </motion.button>
      </div>
    </motion.div>
  );
};