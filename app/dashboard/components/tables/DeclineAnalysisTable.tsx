'use client';

import React, { useMemo, useState } from 'react';
import { useFilteredTransactions } from '@/store/filterStore';
import { getDeclineImpact } from '@/lib/analytics';
import {
  formatCurrency,
  formatPercentage,
  getDeclineDescription,
} from '@/lib/formatters';

/**
 * Sort column type
 */
type SortColumn = 'code' | 'count' | 'amount' | 'percentage';

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc';

/**
 * Props for DeclineAnalysisTable
 */
interface DeclineAnalysisTableProps {
  // Currently no props needed, but kept for future extensibility
}

/**
 * Sortable table component analyzing decline code impact.
 *
 * Features:
 * - Sortable columns (code, count, amount, percentage)
 * - Top row highlighting for most impactful decline code
 * - Zebra striping for readability
 * - Currency and percentage formatting
 * - Responsive horizontal scroll on mobile
 * - Semantic HTML structure
 * - Empty state handling
 *
 * Column definitions:
 * - Decline Code: The code identifier (sortable)
 * - Description: Human-readable description
 * - Count: Number of declined transactions (sortable, right-aligned)
 * - Total Amount: Sum of declined transaction amounts (sortable, right-aligned, formatted)
 * - % of Total: Percentage of all declines (sortable, right-aligned)
 *
 * @example
 * <DeclineAnalysisTable />
 */
export const DeclineAnalysisTable: React.FC<DeclineAnalysisTableProps> = () => {
  // Get filtered transactions from store
  const filteredTransactions = useFilteredTransactions();

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Determine primary currency from transactions
  const primaryCurrency = useMemo(() => {
    const declined = filteredTransactions.filter(t => t.status === 'declined');
    if (declined.length === 0) return 'MXN';

    const currencyCounts = declined.reduce((acc, t) => {
      acc[t.currency] = (acc[t.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(currencyCounts).sort(
      ([, countA], [, countB]) => countB - countA
    )[0][0];
  }, [filteredTransactions]);

  // Compute and sort decline analysis
  const sortedDeclines = useMemo(() => {
    const analysis = getDeclineImpact(filteredTransactions);

    // Sort based on current sort column and direction
    const sorted = [...analysis].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (sortColumn) {
        case 'code':
          compareA = a.code;
          compareB = b.code;
          break;
        case 'count':
          compareA = a.count;
          compareB = b.count;
          break;
        case 'amount':
          compareA = a.lostRevenue;
          compareB = b.lostRevenue;
          break;
        case 'percentage':
          compareA = a.percentage;
          compareB = b.percentage;
          break;
      }

      if (typeof compareA === 'string') {
        return sortDirection === 'asc'
          ? compareA.localeCompare(compareB as string)
          : (compareB as string).localeCompare(compareA);
      }

      return sortDirection === 'asc'
        ? (compareA as number) - (compareB as number)
        : (compareB as number) - (compareA as number);
    });

    return sorted;
  }, [filteredTransactions, sortColumn, sortDirection]);

  /**
   * Handle column header click to toggle sorting
   */
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column selected
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  /**
   * Render sort indicator icon
   */
  const renderSortIcon = (column: SortColumn): string => {
    if (sortColumn !== column) return ' ⬍';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const declines = sortedDeclines;

  // Empty state
  if (declines.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No declined transactions in selected period.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort('code')}
              className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Decline Code{renderSortIcon('code')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Description
            </th>
            <th
              onClick={() => handleSort('count')}
              className="cursor-pointer px-6 py-3 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Count{renderSortIcon('count')}
            </th>
            <th
              onClick={() => handleSort('amount')}
              className="cursor-pointer px-6 py-3 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Total Amount{renderSortIcon('amount')}
            </th>
            <th
              onClick={() => handleSort('percentage')}
              className="cursor-pointer px-6 py-3 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              % of Total{renderSortIcon('percentage')}
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {declines.map((decline, index) => (
            <tr
              key={decline.code}
              className={`transition-colors ${
                index === 0
                  ? 'font-semibold bg-gray-100 hover:bg-gray-150'
                  : index % 2 === 0
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Decline Code */}
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {decline.code}
              </td>

              {/* Description */}
              <td className="px-6 py-4 text-sm text-gray-700">
                {getDeclineDescription(decline.code)}
              </td>

              {/* Count */}
              <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {decline.count.toLocaleString()}
              </td>

              {/* Total Amount */}
              <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                {formatCurrency(decline.lostRevenue, primaryCurrency as any)}
              </td>

              {/* Percentage */}
              <td className="px-6 py-4 text-right text-sm text-gray-700">
                {formatPercentage(decline.percentage, 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeclineAnalysisTable;
