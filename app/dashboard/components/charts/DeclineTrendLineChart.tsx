'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useFilteredTransactions } from '@/store/filterStore';
import { groupByTime } from '@/lib/analytics';
import { formatDate } from '@/lib/formatters';
import { ChartContainer } from './ChartContainer';

/**
 * Data point for the decline trend chart
 */
interface DeclineTrendDataPoint {
  date: string;
  displayDate: string;
  declined: number;
}

/**
 * Custom tooltip component for DeclineTrendLineChart
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as DeclineTrendDataPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-900 px-4 py-3 shadow-lg">
      <p className="font-semibold text-white">{data.displayDate}</p>
      <div className="mt-2 border-t border-gray-700 pt-2">
        <p className="text-sm text-gray-300">
          Declined:{' '}
          <span className="font-medium text-red-400">
            {data.declined.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Line chart showing decline trends over time (past 30 days).
 *
 * Features:
 * - Connects to Zustand store for filtered transactions
 * - Filters to only declined transactions
 * - Groups by day using groupByTime()
 * - Red line with smooth curve
 * - Dot markers on data points
 * - Date-formatted X-axis (MMM dd)
 * - Detailed tooltip with count
 * - Responsive container with fixed 400px height
 *
 * Data Flow:
 * 1. Gets filtered transactions from store
 * 2. Filters to only declined transactions
 * 3. Groups by day using groupByTime()
 * 4. Maps to chart data format with formatted dates
 *
 * @example
 * <DeclineTrendLineChart />
 */
export const DeclineTrendLineChart: React.FC = () => {
  const filteredTransactions = useFilteredTransactions();

  // Process data for chart
  const chartData = useMemo(() => {
    // Filter to only declined transactions
    const declinedTransactions = filteredTransactions.filter(
      (t) => t.status === 'declined'
    );

    // Group by day
    const dailyData = groupByTime(declinedTransactions, 'day');

    // Map to chart data format with formatted dates
    return dailyData.map((point) => ({
      date: point.date,
      displayDate: formatDate(point.date, 'MMM dd'),
      declined: point.declined,
    }));
  }, [filteredTransactions]);

  return (
    <ChartContainer
      title="Decline Trend Over Time"
      description="Daily decline count for the selected period"
      isEmpty={chartData.length === 0}
      emptyMessage="No decline data available for the selected filters"
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* X-axis: Dates */}
          <XAxis
            dataKey="displayDate"
            fontSize={12}
            stroke="#6B7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />

          {/* Y-axis: Decline Count */}
          <YAxis
            fontSize={12}
            stroke="#6B7280"
            allowDecimals={false}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Line: Declined Count */}
          <Line
            type="monotone"
            dataKey="declined"
            stroke="#DC2626"
            strokeWidth={2}
            dot={{ fill: '#DC2626', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DeclineTrendLineChart;
