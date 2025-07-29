import React from 'react';
import type { Segment } from './types';

interface WheelAnalyticsProps {
  segments: Segment[];
}

export const WheelAnalytics: React.FC<WheelAnalyticsProps> = ({ segments }) => {
  const totalWeight = segments.reduce((sum, s) => sum + (s.weight || 10), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Total Spins</p>
          <p className="text-3xl font-semibold text-gray-900">1,234</p>
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <span>↑ 12%</span>
            <span className="text-gray-400">vs last week</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Conversion Rate</p>
          <p className="text-3xl font-semibold text-gray-900">68%</p>
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <span>↑ 5%</span>
            <span className="text-gray-400">vs last week</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-2">Emails Captured</p>
          <p className="text-3xl font-semibold text-gray-900">839</p>
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <span>↑ 23%</span>
            <span className="text-gray-400">vs last week</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Prize Performance Distribution</h3>
        <div className="space-y-4">
          {segments.map((segment) => {
            const percentage = Math.round((segment.weight || 10) / totalWeight * 100);
            return (
              <div key={segment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700">{segment.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-600 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};