import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Mail } from 'lucide-react';
import { WheelAnalytics } from './WheelAnalytics';
import { WheelEmailList } from './WheelEmailList';
import type { Segment } from './types';

interface WheelReportingProps {
  wheelId: string;
  segments: Segment[];
}

export const WheelReporting: React.FC<WheelReportingProps> = ({ wheelId, segments }) => {
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'emails'>('analytics');

  return (
    <div className="h-full flex flex-col px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Reportes y Analíticas
        </h2>
        <p className="text-gray-600 mt-1">Visualiza el rendimiento de tu rueda</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-1.5 flex gap-1.5 shadow-sm mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analíticas
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'emails'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="h-4 w-4" />
          Emails Capturados
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'analytics' ? (
            <WheelAnalytics segments={segments} />
          ) : (
            <WheelEmailList wheelId={wheelId} />
          )}
        </motion.div>
      </div>
    </div>
  );
};