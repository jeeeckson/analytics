'use client';

import React, { useMemo } from 'react';
import { SummaryCard, type SummaryCardVariant } from './SummaryCard';
import type { Transaction } from '@/lib/types';
import { getAuthorizationRate } from '@/lib/analytics';
import { formatPercentage } from '@/lib/formatters';

/**
 * Props for AuthorizationRateCard
 */
interface AuthorizationRateCardProps {
  /** Transactions to analyze */
  transactions: readonly Transaction[];
  /** Whether card is loading */
  isLoading?: boolean;
}

/**
 * Displays authorization rate as a percentage with color coding.
 *
 * Color scheme:
 * - Green (success): >90%
 * - Amber (warning): 80-90%
 * - Red (error): <80%
 *
 * @example
 * <AuthorizationRateCard transactions={filteredTransactions} />
 */
export const AuthorizationRateCard: React.FC<AuthorizationRateCardProps> = ({
  transactions,
  isLoading = false,
}) => {
  // Determine variant based on authorization rate
  const variant: SummaryCardVariant = useMemo(() => {
    const metrics = getAuthorizationRate(transactions);
    const rate = metrics.authorizationRate;

    if (rate > 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  }, [transactions]);

  const metrics = getAuthorizationRate(transactions);
  const formattedRate = formatPercentage(metrics.authorizationRate, 1);

  return (
    <SummaryCard
      title="Authorization Rate"
      value={formattedRate}
      subtitle="Percentage of approved transactions"
      variant={variant}
      isLoading={isLoading}
    />
  );
};

export default AuthorizationRateCard;
