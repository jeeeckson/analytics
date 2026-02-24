import { format } from 'date-fns';
import type { Currency } from './types';

/**
 * Formats currency values based on currency type.
 * Uses appropriate symbols and formatting conventions.
 *
 * @param amount - Numeric amount to format
 * @param currency - Currency code
 * @param compact - If true, uses compact notation (e.g., $1.2K)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'MXN') // "$1,234.56"
 * formatCurrency(1234567, 'BRL', true) // "R$1.2M"
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  compact: boolean = false
): string {
  const symbols: Record<Currency, string> = {
    MXN: '$',
    COP: '$',
    BRL: 'R$',
  };

  const symbol = symbols[currency];

  if (compact && amount >= 1000) {
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats percentage values consistently.
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(76.5) // "76.5%"
 * formatPercentage(76.543, 2) // "76.54%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats date for display in charts and tables.
 *
 * @param dateStr - ISO date string or Date object
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 *
 * @example
 * formatDate('2026-02-24') // "Feb 24, 2026"
 * formatDate(new Date(), 'MMM dd') // "Feb 24"
 */
export function formatDate(
  dateStr: string | Date,
  formatStr: string = 'MMM dd, yyyy'
): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return format(date, formatStr);
}

/**
 * Formats large numbers with K/M/B suffixes.
 *
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234) // "1.2K"
 * formatNumber(1234567) // "1.2M"
 */
export function formatNumber(
  value: number,
  decimals: number = 1
): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(decimals)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Human-readable decline code descriptions.
 */
export const declineCodeDescriptions: Record<string, string> = {
  insufficient_funds: 'Insufficient Funds',
  card_expired: 'Card Expired',
  suspected_fraud: 'Suspected Fraud',
  do_not_honor: 'Do Not Honor',
  issuer_unavailable: 'Issuer Unavailable',
  invalid_card_number: 'Invalid Card Number',
  transaction_not_permitted: 'Transaction Not Permitted',
  processing_error: 'Processing Error',
  timeout: 'Timeout',
  lost_stolen_card: 'Lost/Stolen Card',
};

/**
 * Gets human-readable description for a decline code.
 *
 * @param code - The decline code
 * @returns Human-readable description
 */
export function getDeclineDescription(code: string): string {
  return declineCodeDescriptions[code] || code;
}
