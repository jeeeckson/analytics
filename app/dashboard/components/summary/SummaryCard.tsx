'use client';

import React from 'react';

/**
 * Variant types for SummaryCard styling
 */
export type SummaryCardVariant = 'default' | 'success' | 'warning' | 'error';

/**
 * Props for the reusable SummaryCard component
 */
interface SummaryCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display (typically formatted) */
  value: string | number;
  /** Optional subtitle or additional context */
  subtitle?: string;
  /** Visual variant for conditional styling */
  variant?: SummaryCardVariant;
  /** Whether the card is in loading state */
  isLoading?: boolean;
}

/**
 * Reusable summary card component for displaying key metrics.
 *
 * Features:
 * - Clean, professional card design with shadow
 * - Variant-based styling for visual hierarchy
 * - Loading skeleton state
 * - Responsive padding
 * - Accessible semantic HTML
 *
 * @example
 * <SummaryCard
 *   title="Authorization Rate"
 *   value="84.3%"
 *   subtitle="Industry average: 85%"
 *   variant="success"
 * />
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  isLoading = false,
}) => {
  // Get variant-specific styling
  const getAccentColor = (): string => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const getAccentBg = (): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-amber-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <article
      className={`rounded-lg border border-gray-200 p-6 shadow-sm ${getAccentBg()}`}
      role="region"
      aria-label={title}
    >
      {/* Title */}
      <p className="text-sm font-medium text-gray-600">{title}</p>

      {/* Value - show skeleton while loading */}
      {isLoading ? (
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className={`mt-2 text-4xl font-bold ${getAccentColor()}`}>
          {value}
        </p>
      )}

      {/* Subtitle */}
      {subtitle && !isLoading && (
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      )}
    </article>
  );
};

export default SummaryCard;
