import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Mail, 
  Target, 
  Percent 
} from 'lucide-react';

interface AnalyticsOverviewProps {
  data: {
    totalSpins: number;
    uniqueVisitors: number;
    emailsCaptured: number;
    conversionRate: number;
    previousPeriod?: {
      totalSpins: number;
      uniqueVisitors: number;
      emailsCaptured: number;
      conversionRate: number;
    };
  };
}

/**
 * AnalyticsOverview displays key metrics for wheel performance
 */
export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data }) => {
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const metrics = [
    {
      title: 'Total Spins',
      value: data.totalSpins,
      previousValue: data.previousPeriod?.totalSpins,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Unique Visitors',
      value: data.uniqueVisitors,
      previousValue: data.previousPeriod?.uniqueVisitors,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Emails Captured',
      value: data.emailsCaptured,
      previousValue: data.previousPeriod?.emailsCaptured,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Conversion Rate',
      value: data.conversionRate,
      previousValue: data.previousPeriod?.conversionRate,
      icon: Percent,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      isPercentage: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const change = calculateChange(metric.value, metric.previousValue);
        const Icon = metric.icon;
        
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.isPercentage 
                  ? `${metric.value.toFixed(1)}%`
                  : metric.value.toLocaleString()
                }
              </div>
              {change !== null && (
                <div className="flex items-center mt-2">
                  {change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(change).toFixed(1)}% from last period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};