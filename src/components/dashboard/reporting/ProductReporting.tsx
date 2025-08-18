import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Mail, 
  TrendingUp, 
  Users, 
  MousePointer,
  Target,
  Calendar,
  ChevronDown,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProductReportingProps {
  productId: string;
  productType: 'wheel' | 'jackpot' | 'lottery' | 'scratch-card' | 'slot-machine';
  analyticsComponent?: React.ComponentType<any>;
  emailListComponent?: React.ComponentType<any>;
  customMetrics?: CustomMetric[];
  prizeDistribution?: PrizeDistributionItem[];
}

export interface CustomMetric {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: string;
}

export interface PrizeDistributionItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  date: string;
  impressions: number;
  unique_visitors: number;
  interactions: number;
  emails_captured: number;
  avg_time_on_widget: number;
  conversion_rate: number;
}

export interface DateRange {
  label: string;
  value: number;
  unit: 'days' | 'months';
}

const dateRanges: DateRange[] = [
  { label: 'Últimos 7 días', value: 7, unit: 'days' },
  { label: 'Últimos 30 días', value: 30, unit: 'days' },
  { label: 'Últimos 3 meses', value: 3, unit: 'months' },
  { label: 'Últimos 6 meses', value: 6, unit: 'months' },
];

export const ProductReporting: React.FC<ProductReportingProps> = ({ 
  productId, 
  productType,
  analyticsComponent: AnalyticsComponent,
  emailListComponent: EmailListComponent,
  customMetrics = [],
  prizeDistribution = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'emails'>('overview');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges[1]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (selectedDateRange.unit === 'days') {
      startDate.setDate(endDate.getDate() - selectedDateRange.value);
    } else {
      startDate.setMonth(endDate.getMonth() - selectedDateRange.value);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const { data: analyticsData, refetch } = useQuery<AnalyticsData[]>({
    queryKey: ['product-analytics', productType, productId, selectedDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      
      try {
        const rpcName = productType === 'wheel' 
          ? 'get_widget_analytics'
          : `get_${productType}_analytics`;
        
        const { data, error } = await supabase
          .rpc(rpcName, {
            [`p_${productType}_id`]: productId,
            p_start_date: startDate,
            p_end_date: endDate
          });

        if (error) {
          return [];
        }
        return data || [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!productId
  });

  const summaryMetrics = React.useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        totalImpressions: 0,
        totalInteractions: 0,
        totalEmails: 0,
        avgConversionRate: 0,
        uniqueVisitors: 0,
        avgTimeOnWidget: 0,
        trend: {
          impressions: 0,
          interactions: 0,
          emails: 0
        }
      };
    }

    const total = analyticsData.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      interactions: acc.interactions + day.interactions,
      emails: acc.emails + day.emails_captured,
      visitors: acc.visitors + day.unique_visitors,
      timeOnWidget: acc.timeOnWidget + (day.avg_time_on_widget || 0)
    }), { impressions: 0, interactions: 0, emails: 0, visitors: 0, timeOnWidget: 0 });

    const midPoint = Math.floor(analyticsData.length / 2);
    const firstHalf = analyticsData.slice(0, midPoint);
    const secondHalf = analyticsData.slice(midPoint);
    
    const firstHalfTotal = firstHalf.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      interactions: acc.interactions + day.interactions,
      emails: acc.emails + day.emails_captured
    }), { impressions: 0, interactions: 0, emails: 0 });
    
    const secondHalfTotal = secondHalf.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      interactions: acc.interactions + day.interactions,
      emails: acc.emails + day.emails_captured
    }), { impressions: 0, interactions: 0, emails: 0 });

    return {
      totalImpressions: total.impressions,
      totalInteractions: total.interactions,
      totalEmails: total.emails,
      avgConversionRate: total.impressions > 0 ? (total.interactions / total.impressions) * 100 : 0,
      uniqueVisitors: total.visitors,
      avgTimeOnWidget: analyticsData.length > 0 ? total.timeOnWidget / analyticsData.length : 0,
      trend: {
        impressions: firstHalfTotal.impressions > 0 
          ? ((secondHalfTotal.impressions - firstHalfTotal.impressions) / firstHalfTotal.impressions) * 100 
          : 0,
        interactions: firstHalfTotal.interactions > 0 
          ? ((secondHalfTotal.interactions - firstHalfTotal.interactions) / firstHalfTotal.interactions) * 100 
          : 0,
        emails: firstHalfTotal.emails > 0 
          ? ((secondHalfTotal.emails - firstHalfTotal.emails) / firstHalfTotal.emails) * 100 
          : 0
      }
    };
  }, [analyticsData]);

  const getInteractionLabel = () => {
    switch (productType) {
      case 'wheel': return 'Giros Totales';
      case 'jackpot': return 'Jugadas Totales';
      case 'lottery': return 'Participaciones';
      case 'scratch-card': return 'Tarjetas Raspadas';
      case 'slot-machine': return 'Tiradas Totales';
      default: return 'Interacciones';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-purple-50/20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6 mb-4"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Panel de Análisis
              </h2>
              <p className="text-gray-500 mt-1">Rastrea el rendimiento y participación</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                title="Actualizar datos"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{selectedDateRange.label}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {showDateDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {dateRanges.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => {
                            setSelectedDateRange(range);
                            setShowDateDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            selectedDateRange.label === range.label ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                <Download className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-6"
      >
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1.5 flex gap-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Resumen
          </button>
          {AnalyticsComponent && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Análisis Detallado
            </button>
          )}
          {EmailListComponent && (
            <button
              onClick={() => setActiveTab('emails')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'emails'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Mail className="h-4 w-4" />
              Emails Capturados
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Impresiones Totales</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {summaryMetrics.totalImpressions.toLocaleString()}
                        </p>
                        {summaryMetrics.totalImpressions > 0 && summaryMetrics.trend.impressions !== 0 && (
                          <p className={`text-sm mt-2 flex items-center gap-1 ${
                            summaryMetrics.trend.impressions > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span>{summaryMetrics.trend.impressions > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(summaryMetrics.trend.impressions).toFixed(1)}%</span>
                          </p>
                        )}
                        {summaryMetrics.totalImpressions === 0 && (
                          <p className="text-sm mt-2 text-gray-400">Sin datos aún</p>
                        )}
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <MousePointer className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{getInteractionLabel()}</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {summaryMetrics.totalInteractions.toLocaleString()}
                        </p>
                        {summaryMetrics.totalInteractions > 0 && summaryMetrics.trend.interactions !== 0 && (
                          <p className={`text-sm mt-2 flex items-center gap-1 ${
                            summaryMetrics.trend.interactions > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span>{summaryMetrics.trend.interactions > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(summaryMetrics.trend.interactions).toFixed(1)}%</span>
                          </p>
                        )}
                        {summaryMetrics.totalInteractions === 0 && (
                          <p className="text-sm mt-2 text-gray-400">Sin datos aún</p>
                        )}
                      </div>
                      <div className="p-3 bg-pink-50 rounded-xl">
                        <Target className="h-6 w-6 text-pink-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Tasa de Conversión</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {summaryMetrics.totalImpressions > 0 ? `${summaryMetrics.avgConversionRate.toFixed(1)}%` : '0%'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {summaryMetrics.totalImpressions > 0 ? 'Impresión a interacción' : 'Sin datos aún'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Emails Capturados</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {summaryMetrics.totalEmails.toLocaleString()}
                        </p>
                        {summaryMetrics.totalEmails > 0 && summaryMetrics.trend.emails !== 0 && (
                          <p className={`text-sm mt-2 flex items-center gap-1 ${
                            summaryMetrics.trend.emails > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span>{summaryMetrics.trend.emails > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(summaryMetrics.trend.emails).toFixed(1)}%</span>
                          </p>
                        )}
                        {summaryMetrics.totalEmails === 0 && (
                          <p className="text-sm mt-2 text-gray-400">Sin datos aún</p>
                        )}
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  {customMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:bg-white/70 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {metric.value}
                          </p>
                          {metric.trend !== undefined && metric.trend !== 0 && (
                            <p className={`text-sm mt-2 flex items-center gap-1 ${
                              metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <span>{metric.trend > 0 ? '↑' : '↓'}</span>
                              <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                            </p>
                          )}
                        </div>
                        {metric.icon && (
                          <div className={`p-3 ${metric.color || 'bg-gray-50'} rounded-xl`}>
                            <metric.icon className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Participación de Visitantes</h3>
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Visitantes Únicos</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {summaryMetrics.uniqueVisitors.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tiempo Promedio en Widget</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {summaryMetrics.avgTimeOnWidget.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {prizeDistribution.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Distribución de Premios</h3>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        {prizeDistribution.slice(0, 3).map((item) => {
                          const totalValue = prizeDistribution.reduce((sum, i) => sum + i.value, 0);
                          const percentage = Math.round(item.value / totalValue * 100);
                          return (
                            <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-600">{item.label}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && AnalyticsComponent && (
              <AnalyticsComponent 
                productId={productId} 
                analyticsData={analyticsData}
              />
            )}

            {activeTab === 'emails' && EmailListComponent && (
              <EmailListComponent productId={productId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};