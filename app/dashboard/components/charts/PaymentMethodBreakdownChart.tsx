'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useFilteredTransactions } from '@/store/filterStore';
import { groupByDimension } from '@/lib/analytics';
import { formatPercentage } from '@/lib/formatters';
import { ChartContainer } from './ChartContainer';

/**
 * Data point for the payment method breakdown chart
 */
interface PaymentMethodDataPoint {
  paymentMethod: string;
  displayName: string;
  approved: number;
  declined: number;
  total: number;
  authorizationRate: number;
}

/**
 * Custom tooltip component for PaymentMethodBreakdownChart
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as PaymentMethodDataPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-900 px-4 py-3 shadow-lg">
      <p className="font-semibold text-white">{data.displayName}</p>
      <div className="mt-2 border-t border-gray-700 pt-2">
        <p className="text-sm text-gray-300">
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
          Authorization Rate:{' '}
          <span className="font-medium text-white">
            {formatPercentage(data.authorizationRate)}
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Maps payment method codes to human-readable display names
 */
const getPaymentMethodDisplayName = (method: string): string => {
  const displayNames: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    pse: 'PSE',
    pix: 'PIX',
    boleto: 'Boleto',
  };
  return displayNames[method] || method;
};

/**
 * Grouped bar chart comparing approved vs declined by payment method.
 *
 * Features:
 * - Connects to Zustand store for filtered transactions
 * - Shows approved and declined counts side by side
 * - Green bars for approved, red bars for declined
 * - Human-readable payment method labels
 * - Legend showing color coding
 * - Detailed tooltip with all metrics
 * - Responsive container with fixed 400px height
 *
 * Data Flow:
 * 1. Gets filtered transactions from store
 * 2. Uses groupByDimension() to group by payment method
 * 3. Maps to chart data format with display names
 *
 * @example
 * <PaymentMethodBreakdownChart />
 */
export const PaymentMethodBreakdownChart: React.FC = () => {
  const filteredTransactions = useFilteredTransactions();

  // Process data for chart
  const chartData = useMemo(() => {
    // Group by payment method
    const paymentMethodData = groupByDimension(
      filteredTransactions,
      'payment_method'
    );

    // Map to chart data format with display names
    return paymentMethodData.map((item) => ({
      paymentMethod: item.dimension,
      displayName: getPaymentMethodDisplayName(item.dimension),
      approved: item.approved,
      declined: item.declined,
      total: item.total,
      authorizationRate: item.authorizationRate,
    }));
  }, [filteredTransactions]);

  return (
    <ChartContainer
      title="Payment Method Comparison"
      description="Approved vs declined transactions by payment method"
      isEmpty={chartData.length === 0}
      emptyMessage="No transaction data available for the selected filters"
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* X-axis: Payment Methods */}
          <XAxis
            dataKey="displayName"
            fontSize={12}
            stroke="#6B7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />

          {/* Y-axis: Transaction Count */}
          <YAxis
            fontSize={12}
            stroke="#6B7280"
            allowDecimals={false}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />

          {/* Legend */}
          <Legend
            wrapperStyle={{ fontSize: '14px', color: '#6B7280' }}
            iconType="rect"
          />

          {/* Bar: Approved (Green) */}
          <Bar
            dataKey="approved"
            name="Approved"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
          />

          {/* Bar: Declined (Red) */}
          <Bar
            dataKey="declined"
            name="Declined"
            fill="#DC2626"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PaymentMethodBreakdownChart;
