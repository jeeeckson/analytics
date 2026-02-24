// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Supported currencies in the payment system
 */
export type Currency = 'MXN' | 'COP' | 'BRL';

/**
 * Supported countries
 */
export type Country = 'Mexico' | 'Colombia' | 'Brazil';

/**
 * Available payment methods
 */
export type PaymentMethod = 'credit_card' | 'debit_card' | 'pse' | 'pix' | 'boleto';

/**
 * Payment processors
 */
export type Processor = 'PagosRapid' | 'AcquireLocal' | 'BrasilPay';

/**
 * Transaction status
 */
export type TransactionStatus = 'approved' | 'declined';

/**
 * Standard decline codes in the payment system
 */
export type DeclineCode =
  | 'insufficient_funds'
  | 'card_expired'
  | 'suspected_fraud'
  | 'do_not_honor'
  | 'issuer_unavailable'
  | 'invalid_card_number'
  | 'transaction_not_permitted'
  | 'processing_error'
  | 'timeout'
  | 'lost_stolen_card';

/**
 * Classification of decline codes by recoverability
 */
export type DeclineType = 'soft' | 'hard';

// ============================================================================
// Transaction Data Structure
// ============================================================================

/**
 * Core transaction record as stored in data layer
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  country: Country;
  payment_method: PaymentMethod;
  processor: Processor;
  status: TransactionStatus;
  decline_code: DeclineCode | null;
  timestamp: string; // ISO 8601 format
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Date range filter with optional start and end
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Complete filter state for transaction filtering
 */
export interface TransactionFilters {
  dateRange: DateRange;
  countries: Country[];
  paymentMethods: PaymentMethod[];
  processors: Processor[];
  declineCodes: DeclineCode[];
  declineTypes: DeclineType[];
}

// ============================================================================
// Aggregated Data Structures
// ============================================================================

/**
 * Generic time-based data point for charts
 */
export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD format
  timestamp: number; // Unix timestamp for sorting
  approved: number;
  declined: number;
  total: number;
  authorizationRate: number; // 0-100
}

/**
 * Aggregated data by a specific dimension
 */
export interface DimensionAggregate<T extends string = string> {
  dimension: T;
  approved: number;
  declined: number;
  total: number;
  authorizationRate: number; // 0-100
  totalAmount: number;
}

/**
 * Decline code analysis with impact metrics
 */
export interface DeclineCodeAnalysis {
  code: DeclineCode;
  type: DeclineType;
  count: number;
  percentage: number; // % of total declines
  lostRevenue: number;
  averageAmount: number;
  cumulativePercentage?: number; // For Pareto analysis
}

/**
 * Authorization metrics for a specific entity
 */
export interface AuthorizationMetrics {
  total: number;
  approved: number;
  declined: number;
  authorizationRate: number; // 0-100
  totalRevenue: number; // Sum of approved amounts
  lostRevenue: number; // Sum of declined amounts
}

/**
 * Processor performance comparison
 */
export interface ProcessorPerformance extends DimensionAggregate<Processor> {
  rank: number; // 1 = best performing
}

// ============================================================================
// Summary Statistics
// ============================================================================

/**
 * Overall dashboard summary metrics
 */
export interface SummaryMetrics {
  totalTransactions: number;
  approvedTransactions: number;
  declinedTransactions: number;
  authorizationRate: number;
  totalRevenue: number;
  lostRevenue: number;
  averageTransactionAmount: number;
  topDeclineCode: DeclineCode | null;
  worstProcessor: Processor | null;
}

// ============================================================================
// Grouping and Utility Types
// ============================================================================

/**
 * Available dimensions for grouping transactions
 */
export type GroupByDimension = 'country' | 'payment_method' | 'processor' | 'decline_code';

/**
 * Time granularity for time-series grouping
 */
export type TimeGranularity = 'day' | 'week' | 'month';

/**
 * Generic key-value map for grouping results
 */
export type GroupedData<T> = Record<string, T[]>;
