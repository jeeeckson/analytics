'use client';

import React from 'react';
import { useFilteredTransactions } from '@/store/filterStore';
import { TotalTransactionsCard } from './TotalTransactionsCard';
import { AuthorizationRateCard } from './AuthorizationRateCard';
import { TotalLostRevenueCard } from './TotalLostRevenueCard';
import { TopDeclineCodeCard } from './TopDeclineCodeCard';

/**
 * Props for SummaryCardsGrid
 */
interface SummaryCardsGridProps {
  /** Whether cards are loading */
  isLoading?: boolean;
}

/**
 * Grid container that renders all summary cards.
 *
 * Features:
 * - Connects to Zustand store to get filtered transactions
 * - Responsive grid layout:
 *   - Mobile: 1 column
 *   - Tablet (md): 2 columns
 *   - Desktop (xl): 4 columns
 * - Consistent spacing with gap-6
 *
 * @example
 * <SummaryCardsGrid />
 */
export const SummaryCardsGrid: React.FC<SummaryCardsGridProps> = ({
  isLoading = false,
}) => {
  // Get filtered transactions from store
  const filteredTransactions = useFilteredTransactions();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <TotalTransactionsCard
        transactions={filteredTransactions}
        isLoading={isLoading}
      />
      <AuthorizationRateCard
        transactions={filteredTransactions}
        isLoading={isLoading}
      />
      <TotalLostRevenueCard
        transactions={filteredTransactions}
        isLoading={isLoading}
      />
      <TopDeclineCodeCard
        transactions={filteredTransactions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SummaryCardsGrid;
