import { format, startOfWeek, startOfMonth } from 'date-fns';
import type {
  Transaction,
  TransactionFilters,
  DeclineCode,
  DeclineType,
  AuthorizationMetrics,
  DeclineCodeAnalysis,
  DimensionAggregate,
  TimeSeriesDataPoint,
  GroupByDimension,
  TimeGranularity,
} from './types';

// ============================================================================
// Decline Classification
// ============================================================================

/**
 * Classifies a decline code as soft (recoverable) or hard (not recoverable).
 *
 * Soft declines: Customer can retry with different info or timing
 * Hard declines: Fundamental issue preventing transaction
 *
 * @param code - The decline code to classify
 * @returns 'soft' or 'hard'
 *
 * @example
 * classifyDecline('insufficient_funds') // 'soft'
 * classifyDecline('lost_stolen_card') // 'hard'
 */
export function classifyDecline(code: DeclineCode): DeclineType {
  const softDeclines: DeclineCode[] = [
    'insufficient_funds',
    'issuer_unavailable',
    'processing_error',
    'timeout',
  ];

  const hardDeclines: DeclineCode[] = [
    'card_expired',
    'suspected_fraud',
    'do_not_honor',
    'invalid_card_number',
    'transaction_not_permitted',
    'lost_stolen_card',
  ];

  if (softDeclines.includes(code)) return 'soft';
  if (hardDeclines.includes(code)) return 'hard';

  // Default to hard for safety
  return 'hard';
}

// ============================================================================
// Transaction Filtering
// ============================================================================

/**
 * Filters transactions based on provided filter criteria.
 * Pure function - returns new filtered array without mutation.
 *
 * @param transactions - Array of all transactions
 * @param filters - Filter criteria to apply
 * @returns Filtered array of transactions
 *
 * @example
 * const filtered = filterTransactions(allTransactions, {
 *   dateRange: { start: new Date('2026-01-01'), end: new Date('2026-01-31') },
 *   countries: ['Mexico', 'Brazil'],
 *   declineTypes: ['soft']
 * });
 */
export function filterTransactions(
  transactions: readonly Transaction[],
  filters: Partial<TransactionFilters>
): Transaction[] {
  return transactions.filter(transaction => {
    // Date range filter
    if (filters.dateRange) {
      const txDate = new Date(transaction.timestamp);
      if (filters.dateRange.start && txDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && txDate > filters.dateRange.end) return false;
    }

    // Country filter (OR logic - any selected country matches)
    if (filters.countries && filters.countries.length > 0) {
      if (!filters.countries.includes(transaction.country)) return false;
    }

    // Payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      if (!filters.paymentMethods.includes(transaction.payment_method)) return false;
    }

    // Processor filter
    if (filters.processors && filters.processors.length > 0) {
      if (!filters.processors.includes(transaction.processor)) return false;
    }

    // Decline code filter (only applies to declined transactions)
    if (filters.declineCodes && filters.declineCodes.length > 0) {
      if (transaction.status === 'declined' && transaction.decline_code) {
        if (!filters.declineCodes.includes(transaction.decline_code)) return false;
      } else {
        // If filtering by decline codes, exclude approved transactions
        return false;
      }
    }

    // Decline type filter (soft vs hard)
    if (filters.declineTypes && filters.declineTypes.length > 0) {
      if (transaction.status === 'declined' && transaction.decline_code) {
        const declineType = classifyDecline(transaction.decline_code);
        if (!filters.declineTypes.includes(declineType)) return false;
      } else {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// Authorization Metrics
// ============================================================================

/**
 * Calculates authorization rate for a set of transactions.
 *
 * @param transactions - Transactions to analyze
 * @returns Authorization metrics including rate and revenue
 *
 * @example
 * const metrics = getAuthorizationRate(mexicoTransactions);
 * // { total: 400, approved: 320, declined: 80, authorizationRate: 80, ... }
 */
export function getAuthorizationRate(
  transactions: readonly Transaction[]
): AuthorizationMetrics {
  const total = transactions.length;
  const approved = transactions.filter(t => t.status === 'approved').length;
  const declined = total - approved;

  const totalRevenue = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const lostRevenue = transactions
    .filter(t => t.status === 'declined')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    total,
    approved,
    declined,
    authorizationRate: total > 0 ? (approved / total) * 100 : 0,
    totalRevenue,
    lostRevenue,
  };
}

/**
 * Calculates total lost revenue from declined transactions.
 * Can be filtered by specific criteria (e.g., per processor, per country).
 *
 * @param transactions - Transactions to analyze
 * @returns Total amount lost to declines
 *
 * @example
 * const totalLost = getLostRevenue(allTransactions);
 * const lostInMexico = getLostRevenue(
 *   allTransactions.filter(t => t.country === 'Mexico')
 * );
 */
export function getLostRevenue(
  transactions: readonly Transaction[]
): number {
  return transactions
    .filter(t => t.status === 'declined')
    .reduce((sum, t) => sum + t.amount, 0);
}

// ============================================================================
// Decline Impact Analysis
// ============================================================================

/**
 * Analyzes decline codes and computes impact metrics including Pareto analysis.
 * Results are sorted by count descending with cumulative percentages.
 *
 * @param transactions - Transactions to analyze (typically filtered to declined only)
 * @returns Array of decline code analysis, sorted by frequency
 *
 * @example
 * const declinedOnly = transactions.filter(t => t.status === 'declined');
 * const analysis = getDeclineImpact(declinedOnly);
 * // First item will be the most frequent decline code
 */
export function getDeclineImpact(
  transactions: readonly Transaction[]
): DeclineCodeAnalysis[] {
  // Filter to declined transactions only
  const declined = transactions.filter(
    t => t.status === 'declined' && t.decline_code !== null
  );

  if (declined.length === 0) return [];

  // Group by decline code
  const grouped = declined.reduce((acc, t) => {
    const code = t.decline_code!;
    if (!acc[code]) {
      acc[code] = [];
    }
    acc[code].push(t);
    return acc;
  }, {} as Record<DeclineCode, Transaction[]>);

  // Compute metrics per decline code
  const analysis = Object.entries(grouped).map(([code, txns]) => {
    const count = txns.length;
    const lostRevenue = txns.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = lostRevenue / count;

    return {
      code: code as DeclineCode,
      type: classifyDecline(code as DeclineCode),
      count,
      percentage: (count / declined.length) * 100,
      lostRevenue,
      averageAmount,
    };
  }).sort((a, b) => b.count - a.count); // Sort by frequency

  // Add cumulative percentage for Pareto analysis
  let cumulative = 0;
  return analysis.map(item => {
    cumulative += item.percentage;
    return {
      ...item,
      cumulativePercentage: cumulative,
    };
  });
}

// ============================================================================
// Grouping Functions
// ============================================================================

/**
 * Groups transactions by a specific dimension and computes aggregates.
 *
 * @param transactions - Transactions to group
 * @param dimension - The dimension to group by
 * @returns Array of aggregated data per dimension value
 *
 * @example
 * const byCountry = groupByDimension(transactions, 'country');
 * // [
 * //   { dimension: 'Mexico', approved: 300, declined: 100, total: 400, ... },
 * //   { dimension: 'Brazil', approved: 200, declined: 50, total: 250, ... }
 * // ]
 */
export function groupByDimension(
  transactions: readonly Transaction[],
  dimension: GroupByDimension
): DimensionAggregate[] {
  // Map dimension to transaction property
  const keyMap: Record<GroupByDimension, keyof Transaction> = {
    country: 'country',
    payment_method: 'payment_method',
    processor: 'processor',
    decline_code: 'decline_code',
  };

  const key = keyMap[dimension];

  // Group transactions by dimension value
  const grouped = transactions.reduce((acc, transaction) => {
    const value = transaction[key] as string;
    if (!value) return acc; // Skip null values (e.g., null decline_code for approved)

    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Compute aggregates for each group
  return Object.entries(grouped).map(([dimensionValue, txns]) => {
    const approved = txns.filter(t => t.status === 'approved').length;
    const declined = txns.filter(t => t.status === 'declined').length;
    const total = txns.length;
    const totalAmount = txns
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      dimension: dimensionValue,
      approved,
      declined,
      total,
      authorizationRate: total > 0 ? (approved / total) * 100 : 0,
      totalAmount,
    };
  }).sort((a, b) => b.total - a.total); // Sort by volume descending
}

/**
 * Groups transactions by time periods and computes time-series metrics.
 *
 * @param transactions - Transactions to group
 * @param granularity - Time period granularity (day, week, month)
 * @returns Array of time-series data points, sorted chronologically
 *
 * @example
 * const dailyData = groupByTime(transactions, 'day');
 * // [
 * //   { date: '2026-01-01', approved: 30, declined: 10, total: 40, ... },
 * //   { date: '2026-01-02', approved: 25, declined: 8, total: 33, ... }
 * // ]
 */
export function groupByTime(
  transactions: readonly Transaction[],
  granularity: TimeGranularity = 'day'
): TimeSeriesDataPoint[] {
  // Helper to format date based on granularity
  const formatDate = (date: Date): string => {
    if (granularity === 'day') {
      return format(date, 'yyyy-MM-dd');
    } else if (granularity === 'week') {
      return format(startOfWeek(date), 'yyyy-MM-dd');
    } else {
      return format(startOfMonth(date), 'yyyy-MM-dd');
    }
  };

  // Group by formatted date
  const grouped = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.timestamp);
    const key = formatDate(date);

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Compute metrics for each time period
  return Object.entries(grouped)
    .map(([dateStr, txns]) => {
      const approved = txns.filter(t => t.status === 'approved').length;
      const declined = txns.filter(t => t.status === 'declined').length;
      const total = txns.length;

      return {
        date: dateStr,
        timestamp: new Date(dateStr).getTime(),
        approved,
        declined,
        total,
        authorizationRate: total > 0 ? (approved / total) * 100 : 0,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}
