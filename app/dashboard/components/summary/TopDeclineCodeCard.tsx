'use client';

import React, { useMemo } from 'react';
import { SummaryCard } from './SummaryCard';
import type { Transaction } from '@/lib/types';
import { getDeclineImpact } from '@/lib/analytics';
import { getDeclineDescription } from '@/lib/formatters';

/**
 * Props for TopDeclineCodeCard
 */
interface TopDeclineCodeCardProps {
  /** Transactions to analyze */
  transactions: readonly Transaction[];
  /** Whether card is loading */
  isLoading?: boolean;
}

/**
 * Displays the most impactful decline code by frequency.
 *
 * Shows:
 * - Top decline code (e.g., "Insufficient Funds")
 * - Count of transactions with that decline code
 *
 * @example
 * <TopDeclineCodeCard transactions={filteredTransactions} />
 */
export const TopDeclineCodeCard: React.FC<TopDeclineCodeCardProps> = ({
  transactions,
  isLoading = false,
}) => {
  // Get top decline code
  const topDecline = useMemo(() => {
    const analysis = getDeclineImpact(transactions);
    return analysis.length > 0 ? analysis[0] : null;
  }, [transactions]);

  const declineCodeDisplay = topDecline
    ? getDeclineDescription(topDecline.code)
    : 'No Declines';

  const subtitle = topDecline
    ? `${topDecline.count.toLocaleString()} transaction${topDecline.count !== 1 ? 's' : ''}`
    : 'No declined transactions in filtered data';

  return (
    <SummaryCard
      title="Top Decline Code"
      value={declineCodeDisplay}
      subtitle={subtitle}
      variant={topDecline ? 'warning' : 'default'}
      isLoading={isLoading}
    />
  );
};

export default TopDeclineCodeCard;
