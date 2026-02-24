'use client';

import React from 'react';

/**
 * Props for ChartContainer component
 */
interface ChartContainerProps {
  /** Chart title displayed at the top */
  title: string;
  /** Optional description/subtitle for additional context */
  description?: string;
  /** Chart content to render */
  children: React.ReactNode;
  /** Loading state - shows spinner overlay */
  isLoading?: boolean;
  /** Empty state - shows when no data is available */
  isEmpty?: boolean;
  /** Custom message for empty state */
  emptyMessage?: string;
}

/**
 * Reusable container component that wraps all charts with consistent styling.
 *
 * Features:
 * - Professional white card with shadow and rounded corners
 * - Title and optional description section
 * - Loading state with spinner overlay
 * - Empty state with customizable message
 * - Responsive padding
 * - Accessible semantic HTML
 *
 * @example
 * <ChartContainer
 *   title="Authorization Rate by Country"
 *   description="Comparison of approval rates across regions"
 *   isEmpty={data.length === 0}
 *   emptyMessage="No data available for selected filters"
 * >
 *   <ResponsiveContainer>...</ResponsiveContainer>
 * </ChartContainer>
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>

      {/* Content Section */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
            role="status"
            aria-live="polite"
            aria-label="Loading chart data"
          >
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="mt-3 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <div
            className="flex min-h-[400px] items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="mt-4 text-base font-medium text-gray-900">
                No Data Available
              </p>
              <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>
            </div>
          </div>
        )}

        {/* Chart Content */}
        {!isLoading && !isEmpty && children}
      </div>
    </div>
  );
};

export default ChartContainer;
