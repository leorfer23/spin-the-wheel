import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Target } from 'lucide-react';
import type { Segment } from './types';

interface AnalyticsData {
  date: string;
  impressions: number;
  unique_visitors: number;
  spins: number;
  emails_captured: number;
  avg_time_on_widget: number;
  impression_to_spin_rate: number;
  impression_to_email_rate: number;
}

interface WheelAnalyticsProps {
  segments: Segment[];
  wheelId?: string;
  analyticsData?: AnalyticsData[];
}

export const WheelAnalytics: React.FC<WheelAnalyticsProps> = ({ segments, analyticsData = [] }) => {
  const totalWeight = segments.reduce((sum, s) => sum + (s.weight || 10), 0);
  const hasData = analyticsData && analyticsData.length > 0;

  // Format data for charts - use demo data for empty state visualization
  const chartData = React.useMemo(() => {
    if (hasData) {
      return analyticsData.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: day.impressions,
        spins: day.spins,
        emails: day.emails_captured,
        conversionRate: day.impression_to_spin_rate,
        emailCaptureRate: day.impression_to_email_rate,
        uniqueVisitors: day.unique_visitors,
        avgTime: day.avg_time_on_widget
      }));
    } else {
      // Generate demo data for visualization
      const demoData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        demoData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          impressions: Math.floor(Math.random() * 200) + 50,
          spins: Math.floor(Math.random() * 50) + 10,
          emails: Math.floor(Math.random() * 30) + 5,
          conversionRate: Math.random() * 20 + 5,
          emailCaptureRate: Math.random() * 15 + 3,
          uniqueVisitors: Math.floor(Math.random() * 100) + 20,
          avgTime: Math.random() * 40 + 10
        });
      }
      return demoData;
    }
  }, [analyticsData, hasData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/50">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-600">
              <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Empty State Banner */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-200"
        >
          <p className="text-sm text-amber-800">
            📊 The charts below show example data. Real analytics will appear once your wheel starts receiving traffic.
          </p>
        </motion.div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impressions & Spins Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all relative"
        >
          {!hasData && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
              <div className="text-center p-6">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No data yet</p>
                <p className="text-xs text-gray-400 mt-1">Example visualization shown</p>
              </div>
            </div>
          )}
          <div className={`flex items-center justify-between mb-6 ${!hasData ? 'opacity-30' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900">Engagement Overview</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className={!hasData ? 'opacity-20' : ''}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="spinsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="impressions" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fill="url(#impressionsGradient)" 
                name="Impressions"
              />
              <Area 
                type="monotone" 
                dataKey="spins" 
                stroke="#EC4899" 
                strokeWidth={2}
                fill="url(#spinsGradient)" 
                name="Spins"
              />
            </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Rates Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all relative"
        >
          {!hasData && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
              <div className="text-center p-6">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No data yet</p>
                <p className="text-xs text-gray-400 mt-1">Example visualization shown</p>
              </div>
            </div>
          )}
          <div className={`flex items-center justify-between mb-6 ${!hasData ? 'opacity-30' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rates</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className={!hasData ? 'opacity-20' : ''}>
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                name="Spin Rate"
              />
              <Line 
                type="monotone" 
                dataKey="emailCaptureRate" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                name="Email Rate"
              />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Visitor Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Visitor Engagement</h3>
          <Users className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="uniqueVisitors" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Unique Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" unit="s" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  name="Avg Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Prize Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Prize Performance Distribution</h3>
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const percentage = Math.round((segment.weight || 10) / totalWeight * 100);
            return (
              <motion.div 
                key={segment.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{segment.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                      className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};