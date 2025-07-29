import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  BarChart3,
  Eye,
  Target,
  Clock,
  Globe
} from 'lucide-react';

interface LiveMetric {
  id: string;
  label: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  color: string;
  sparkline?: number[];
}

interface LiveActivity {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  value?: string;
  location?: string;
}

export const RealtimeAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      id: 'active_users',
      label: 'Active Users',
      value: 127,
      change: 12.5,
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      sparkline: [20, 25, 30, 28, 35, 40, 45]
    },
    {
      id: 'conversion_rate',
      label: 'Conversion Rate',
      value: '23.4%',
      change: 3.2,
      icon: <Target className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      sparkline: [18, 19, 21, 20, 22, 23, 23.4]
    },
    {
      id: 'revenue_impact',
      label: 'Revenue Impact',
      value: '$4,382',
      change: 18.7,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      sparkline: [3000, 3200, 3500, 3800, 4000, 4200, 4382]
    },
    {
      id: 'spins_today',
      label: 'Spins Today',
      value: 892,
      change: 25.3,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      sparkline: [600, 650, 700, 750, 800, 850, 892]
    }
  ]);

  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);

      const newActivity: LiveActivity = {
        id: Date.now().toString(),
        timestamp: new Date(),
        user: `User${Math.floor(Math.random() * 1000)}`,
        action: ['Spun wheel', 'Won prize', 'Shared on social', 'Referred friend'][Math.floor(Math.random() * 4)],
        value: ['20% OFF', 'Free Shipping', '$10 Credit'][Math.floor(Math.random() * 3)],
        location: ['New York', 'London', 'Tokyo', 'Sydney'][Math.floor(Math.random() * 4)]
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);

      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: typeof metric.value === 'number' 
          ? metric.value + Math.floor(Math.random() * 10 - 3)
          : metric.value,
        change: metric.change + (Math.random() * 2 - 1)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <svg className="w-full h-8" viewBox="0 0 100 32">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={data.map((value, index) => 
            `${(index / (data.length - 1)) * 100},${32 - ((value - min) / range) * 28}`
          ).join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-7 h-7 text-blue-600" />
          Real-Time Analytics
        </h2>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {pulseAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute w-3 h-3 bg-green-500 rounded-full"
              />
            )}
          </AnimatePresence>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${metric.color} rounded-xl p-4 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              {metric.icon}
              <span className={`text-xs flex items-center gap-1 ${
                metric.change > 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{metric.value}</div>
            <div className="text-xs opacity-80 mb-2">{metric.label}</div>
            {metric.sparkline && (
              <div className="opacity-60">
                {renderSparkline(metric.sparkline)}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Live Activity Feed
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {activity.user.slice(-2)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {activity.user} <span className="text-gray-600 font-normal">{activity.action}</span>
                      {activity.value && (
                        <span className="text-purple-600 font-semibold ml-1">{activity.value}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleTimeString()}
                      {activity.location && (
                        <>
                          <Globe className="w-3 h-3" />
                          {activity.location}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Top Performing Prizes
          </h4>
          <div className="space-y-2">
            {['20% OFF', 'Free Shipping', '$10 Credit'].map((prize, index) => (
              <div key={prize} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{prize}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${80 - index * 20}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                  <span className="text-xs text-gray-500">{80 - index * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            AI Optimization Status
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Personalization Active</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Models Updated</span>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Uplift</span>
              <span className="text-sm font-semibold text-green-600">+15.3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};