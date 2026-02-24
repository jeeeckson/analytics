'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { useFilteredTransactions } from '@/store/filterStore';
import { getDeclineImpact } from '@/lib/analytics';
import { formatCurrency, getDeclineDescription } from '@/lib/formatters';
import { ChartContainer } from './ChartContainer';

/**
 * Data point for the decline impact chart
 */
interface DeclineImpactDataPoint {
  code: string;
  description: string;
  type: 'soft' | 'hard';
  count: number;
  lostRevenue: number;
  averageAmount: number;
  percentage: number;
}

/**
 * Custom tooltip component for DeclineImpactBarChart
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as DeclineImpactDataPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-900 px-4 py-3 shadow-lg">
      <p className="font-semibold text-white">{data.description}</p>
      <p className="mt-1 text-sm text-gray-300">Code: {data.code}</p>
      <p className="mt-1 text-sm text-gray-300">
        Type: <span className="capitalize">{data.type}</span> Decline
      </p>
      <div className="mt-2 border-t border-gray-700 pt-2">
        <p className="text-sm text-gray-300">
          Count: <span className="font-medium text-white">{data.count}</span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Lost Revenue:{' '}
          <span className="font-medium text-white">
            {formatCurrency(data.lostRevenue, 'MXN', false)}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Avg Amount:{' '}
          <span className="font-medium text-white">
            {formatCurrency(data.averageAmount, 'MXN', false)}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          {data.percentage.toFixed(1)}% of all declines
        </p>
      </div>
    </div>
  );
};

/**
 * Horizontal bar chart showing top 10 decline codes by lost revenue.
 *
 * Features:
 * - Connects to Zustand store for filtered transactions
 * - Shows top 10 decline codes ranked by lost revenue
 * - Color-coded bars (soft declines = amber, hard declines = red)
 * - Human-readable decline code labels
 * - Detailed tooltip with metrics
 * - Currency-formatted X-axis
 * - Responsive container with fixed 400px height
 *
 * Data Flow:
 * 1. Gets filtered transactions from store
 * 2. Uses getDeclineImpact() to analyze decline codes
 * 3. Takes top 10 by lost revenue
 * 4. Maps to chart data format with descriptions
 *
 * @example
 * <DeclineImpactBarChart />
 */
export const DeclineImpactBarChart: React.FC = () => {
  const filteredTransactions = useFilteredTransactions();

  // Process data for chart
  const chartData = useMemo(() => {
    // Get decline analysis from filtered transactions
    const declineAnalysis = getDeclineImpact(filteredTransactions);

    // Sort by lost revenue (descending) and take top 10
    const topDeclines = declineAnalysis
      .sort((a, b) => b.lostRevenue - a.lostRevenue)
      .slice(0, 10);

    // Map to chart data format with descriptions
    return topDeclines.map((decline) => ({
      code: decline.code,
      description: getDeclineDescription(decline.code),
      type: decline.type,
      count: decline.count,
      lostRevenue: decline.lostRevenue,
      averageAmount: decline.averageAmount,
      percentage: decline.percentage,
    }));
  }, [filteredTransactions]);

  // Determine bar color based on decline type
  const getBarColor = (entry: DeclineImpactDataPoint): string => {
    return entry.type === 'soft' ? '#F59E0B' : '#DC2626';
  };

  return (
    <ChartContainer
      title="Top Decline Codes by Revenue Impact"
      description="Top 10 decline codes ranked by lost revenue"
      isEmpty={chartData.length === 0}
      emptyMessage="No decline data available for the selected filters"
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* X-axis: Lost Revenue */}
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(value, 'MXN', true)}
            fontSize={12}
            stroke="#6B7280"
          />

          {/* Y-axis: Decline Code Descriptions */}
          <YAxis
            type="category"
            dataKey="description"
            width={90}
            fontSize={12}
            stroke="#6B7280"
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />

          {/* Bar with dynamic color based on decline type */}
          <Bar
            dataKey="lostRevenue"
            fill="#DC2626"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DeclineImpactBarChart;
