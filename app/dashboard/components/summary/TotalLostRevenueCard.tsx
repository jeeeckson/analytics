'use client';

import React, { useMemo } from 'react';
import { SummaryCard } from './SummaryCard';
import type { Transaction } from '@/lib/types';
import { getLostRevenue } from '@/lib/analytics';
import { formatCurrency } from '@/lib/formatters';

/**
 * Props for TotalLostRevenueCard
 */
interface TotalLostRevenueCardProps {
  /** Transactions to analyze */
  transactions: readonly Transaction[];
  /** Whether card is loading */
  isLoading?: boolean;
}

/**
 * Displays total lost revenue from declined transactions.
 *
 * Shows the aggregate amount across all declines.
 * Note: For multi-currency environments, this shows the primary currency
 * based on the majority of declined transactions.
 *
 * @example
 * <TotalLostRevenueCard transactions={filteredTransactions} />
 */
export const TotalLostRevenueCard: React.FC<TotalLostRevenueCardProps> = ({
  transactions,
  isLoading = false,
}) => {
  // Determine primary currency from declined transactions
  const primaryCurrency = useMemo(() => {
    const declined = transactions.filter(t => t.status === 'declined');
    if (declined.length === 0) return 'MXN';

    // Get most common currency among declined transactions
    const currencyCounts = declined.reduce((acc, t) => {
      acc[t.currency] = (acc[t.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(currencyCounts).sort(
      ([, countA], [, countB]) => countB - countA
    )[0][0];
  }, [transactions]);

  const lostRevenue = getLostRevenue(transactions);
  const formattedAmount = formatCurrency(lostRevenue, primaryCurrency as any);

  return (
    <SummaryCard
      title="Total Lost Revenue"
      value={formattedAmount}
      subtitle="Sum of all declined transactions"
      variant="error"
      isLoading={isLoading}
    />
  );
};

export default TotalLostRevenueCard;
