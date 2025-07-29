import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

interface AnalyticsChartProps {
  data: Array<{
    date: string;
    totalSpins: number;
    uniqueVisitors: number;
    emailsCaptured: number;
    conversionRate: number;
  }>;
  type?: 'line' | 'bar' | 'area';
  title?: string;
  description?: string;
}

/**
 * AnalyticsChart displays time-series analytics data
 */
export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data, 
  type = 'area',
  title = 'Performance Over Time',
  description = 'Track your wheel performance metrics'
}) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Conversion Rate' 
                ? `${entry.value.toFixed(1)}%` 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: formattedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend className="text-sm" />
            <Line 
              type="monotone" 
              dataKey="totalSpins" 
              stroke="#3b82f6" 
              name="Total Spins"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="emailsCaptured" 
              stroke="#8b5cf6" 
              name="Emails Captured"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend className="text-sm" />
            <Bar dataKey="totalSpins" fill="#3b82f6" name="Total Spins" />
            <Bar dataKey="emailsCaptured" fill="#8b5cf6" name="Emails Captured" />
          </BarChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSpins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend className="text-sm" />
            <Area
              type="monotone"
              dataKey="totalSpins"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorSpins)"
              name="Total Spins"
            />
            <Area
              type="monotone"
              dataKey="emailsCaptured"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorEmails)"
              name="Emails Captured"
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};