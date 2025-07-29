import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SegmentData {
  segmentId: string;
  label: string;
  value: string;
  timesWon: number;
  weight: number;
  winPercentage: number;
  expectedPercentage: number;
}

interface SegmentPerformanceProps {
  segments: SegmentData[];
}

/**
 * SegmentPerformance displays win distribution and performance metrics for wheel segments
 */
export const SegmentPerformance: React.FC<SegmentPerformanceProps> = ({ segments }) => {
  const COLORS = [
    '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', 
    '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'
  ];

  const pieData = segments.map((segment, index) => ({
    name: segment.label,
    value: segment.timesWon,
    percentage: segment.winPercentage,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-xs text-gray-600">
            Won: {data.value} times ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // Don't show label for very small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Win Distribution</CardTitle>
          <CardDescription>
            Visual breakdown of segment wins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value: string) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>
            Compare actual vs expected win rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium">Segment</th>
                    <th className="text-center p-3 text-sm font-medium">Times Won</th>
                    <th className="text-center p-3 text-sm font-medium">Actual %</th>
                    <th className="text-center p-3 text-sm font-medium">Expected %</th>
                    <th className="text-center p-3 text-sm font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment, index) => {
                    const variance = segment.winPercentage - segment.expectedPercentage;
                    const varianceColor = Math.abs(variance) < 5 
                      ? 'text-gray-600' 
                      : variance > 0 
                        ? 'text-green-600' 
                        : 'text-red-600';
                    
                    return (
                      <tr key={segment.segmentId} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div>
                              <div className="font-medium text-sm">{segment.label}</div>
                              <div className="text-xs text-gray-500">{segment.value}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm">
                          {segment.timesWon}
                        </td>
                        <td className="p-3 text-center text-sm font-medium">
                          {segment.winPercentage.toFixed(1)}%
                        </td>
                        <td className="p-3 text-center text-sm text-gray-600">
                          {segment.expectedPercentage.toFixed(1)}%
                        </td>
                        <td className={`p-3 text-center text-sm font-medium ${varianceColor}`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>* Expected percentage is based on segment weights</p>
              <p>* Variance shows the difference between actual and expected win rates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};