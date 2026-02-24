'use client';

import React from 'react';
import { SummaryCard } from './SummaryCard';
import type { Transaction } from '@/lib/types';
import { getAuthorizationRate } from '@/lib/analytics';

/**
 * Props for TotalTransactionsCard
 */
interface TotalTransactionsCardProps {
  /** Transactions to analyze */
  transactions: readonly Transaction[];
  /** Whether card is loading */
  isLoading?: boolean;
}

/**
 * Displays total transaction count with approval/decline breakdown.
 *
 * Shows:
 * - Total transaction count as large metric
 * - Subtitle with approved and declined counts
 *
 * @example
 * <TotalTransactionsCard transactions={filteredTransactions} />
 */
export const TotalTransactionsCard: React.FC<TotalTransactionsCardProps> = ({
  transactions,
  isLoading = false,
}) => {
  const metrics = getAuthorizationRate(transactions);

  const subtitle = `${metrics.approved.toLocaleString()} approved, ${metrics.declined.toLocaleString()} declined`;

  return (
    <SummaryCard
      title="Total Transactions"
      value={metrics.total.toLocaleString()}
      subtitle={subtitle}
      variant="default"
      isLoading={isLoading}
    />
  );
};

export default TotalTransactionsCard;
