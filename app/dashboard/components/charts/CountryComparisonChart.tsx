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
import { groupByDimension } from '@/lib/analytics';
import { formatPercentage, formatCurrency } from '@/lib/formatters';
import { ChartContainer } from './ChartContainer';

/**
 * Data point for the country comparison chart
 */
interface CountryDataPoint {
  country: string;
  approved: number;
  declined: number;
  total: number;
  authorizationRate: number;
  totalAmount: number;
  barColor: string;
}

/**
 * Custom tooltip component for CountryComparisonChart
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as CountryDataPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-900 px-4 py-3 shadow-lg">
      <p className="font-semibold text-white">{data.country}</p>
      <div className="mt-2 border-t border-gray-700 pt-2">
        <p className="text-sm text-gray-300">
          Authorization Rate:{' '}
          <span className="font-medium text-white">
            {formatPercentage(data.authorizationRate)}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Total Transactions:{' '}
          <span className="font-medium text-white">
            {data.total.toLocaleString()}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Approved:{' '}
          <span className="font-medium text-green-400">
            {data.approved.toLocaleString()}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Declined:{' '}
          <span className="font-medium text-red-400">
            {data.declined.toLocaleString()}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Total Revenue:{' '}
          <span className="font-medium text-white">
            {formatCurrency(data.totalAmount, 'MXN', true)}
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Determines bar color based on authorization rate thresholds
 */
const getBarColor = (authorizationRate: number): string => {
  if (authorizationRate >= 85) {
    return '#10B981'; // Green - Excellent
  } else if (authorizationRate >= 75) {
    return '#F59E0B'; // Amber - Warning
  } else {
    return '#DC2626'; // Red - Critical
  }
};

/**
 * Vertical bar chart comparing authorization rates by country.
 *
 * Features:
 * - Connects to Zustand store for filtered transactions
 * - Shows authorization rate as percentage (0-100%)
 * - Color-coded bars based on performance thresholds:
 *   - Green (>85%): Excellent performance
 *   - Amber (75-85%): Warning, needs attention
 *   - Red (<75%): Critical, immediate action needed
 * - Country names on X-axis
 * - Percentage values on Y-axis
 * - Detailed tooltip with all transaction metrics
 * - Responsive container with fixed 400px height
 *
 * Data Flow:
 * 1. Gets filtered transactions from store
 * 2. Uses groupByDimension() to group by country
 * 3. Maps to chart data format with color assignment
 *
 * @example
 * <CountryComparisonChart />
 */
export const CountryComparisonChart: React.FC = () => {
  const filteredTransactions = useFilteredTransactions();

  // Process data for chart
  const chartData = useMemo(() => {
    // Group by country
    const countryData = groupByDimension(filteredTransactions, 'country');

    // Map to chart data format with color assignment
    return countryData.map((item) => ({
      country: item.dimension,
      approved: item.approved,
      declined: item.declined,
      total: item.total,
      authorizationRate: item.authorizationRate,
      totalAmount: item.totalAmount,
      barColor: getBarColor(item.authorizationRate),
    }));
  }, [filteredTransactions]);

  return (
    <ChartContainer
      title="Authorization Rate by Country"
      description="Compare authorization rates across different countries"
      isEmpty={chartData.length === 0}
      emptyMessage="No transaction data available for the selected filters"
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* X-axis: Countries */}
          <XAxis
            dataKey="country"
            fontSize={12}
            stroke="#6B7280"
          />

          {/* Y-axis: Authorization Rate (0-100%) */}
          <YAxis
            fontSize={12}
            stroke="#6B7280"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />

          {/* Bar: Authorization Rate with dynamic color per country */}
          <Bar
            dataKey="authorizationRate"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CountryComparisonChart;
