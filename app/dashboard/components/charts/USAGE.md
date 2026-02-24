# Chart Components Usage Guide

This document provides examples and guidelines for using the chart components in the payment analytics dashboard.

## Overview

The chart infrastructure includes 5 components:

1. **ChartContainer** - Reusable wrapper with loading/empty states
2. **DeclineImpactBarChart** - Top 10 decline codes by lost revenue
3. **DeclineTrendLineChart** - Decline trends over time
4. **PaymentMethodBreakdownChart** - Approved vs declined by payment method
5. **CountryComparisonChart** - Authorization rates by country

## Installation

All required dependencies are already installed:
- `recharts` - React charting library
- `date-fns` - Date formatting utilities
- `zustand` - State management

## Quick Start

### Import Charts

```tsx
import {
  DeclineImpactBarChart,
  DeclineTrendLineChart,
  PaymentMethodBreakdownChart,
  CountryComparisonChart,
} from '@/app/dashboard/components/charts';
```

### Basic Usage in Dashboard Page

```tsx
'use client';

import React from 'react';
import {
  DeclineImpactBarChart,
  DeclineTrendLineChart,
  PaymentMethodBreakdownChart,
  CountryComparisonChart,
} from '@/app/dashboard/components/charts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards would go here */}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Decline Impact */}
        <DeclineImpactBarChart />

        {/* Country Comparison */}
        <CountryComparisonChart />

        {/* Decline Trend */}
        <DeclineTrendLineChart />

        {/* Payment Method Breakdown */}
        <PaymentMethodBreakdownChart />
      </div>
    </div>
  );
}
```

## Component Details

### 1. ChartContainer

A reusable wrapper that provides consistent styling for all charts.

**Props:**
```tsx
interface ChartContainerProps {
  title: string;              // Chart title
  description?: string;       // Optional subtitle
  children: React.ReactNode;  // Chart content
  isLoading?: boolean;        // Show loading spinner
  isEmpty?: boolean;          // Show empty state
  emptyMessage?: string;      // Custom empty message
}
```

**Example:**
```tsx
<ChartContainer
  title="Custom Chart"
  description="Chart showing custom metrics"
  isEmpty={data.length === 0}
  emptyMessage="No data for selected period"
>
  <ResponsiveContainer width="100%" height={400}>
    {/* Your Recharts component */}
  </ResponsiveContainer>
</ChartContainer>
```

### 2. DeclineImpactBarChart

Horizontal bar chart showing top 10 decline codes ranked by lost revenue.

**Features:**
- Automatically connects to filtered transactions
- Color-coded bars (amber = soft decline, red = hard decline)
- Shows decline code descriptions (not raw codes)
- Detailed tooltip with count, revenue, and percentage

**Data Source:**
- Uses `getDeclineImpact()` from analytics library
- Automatically sorts by lost revenue
- Limited to top 10 results

**Example:**
```tsx
<DeclineImpactBarChart />
```

### 3. DeclineTrendLineChart

Line chart showing decline count trends over time.

**Features:**
- Filters to only declined transactions
- Groups by day
- Red line with dot markers
- Date-formatted X-axis

**Data Source:**
- Uses `groupByTime()` with 'day' granularity
- Only processes declined transactions

**Example:**
```tsx
<DeclineTrendLineChart />
```

### 4. PaymentMethodBreakdownChart

Grouped bar chart comparing approved vs declined by payment method.

**Features:**
- Side-by-side bars for approved (green) and declined (red)
- Human-readable payment method names
- Legend showing color coding
- Detailed tooltip with all metrics

**Data Source:**
- Uses `groupByDimension()` with 'payment_method'
- Shows all payment methods in filtered data

**Example:**
```tsx
<PaymentMethodBreakdownChart />
```

### 5. CountryComparisonChart

Vertical bar chart showing authorization rates by country.

**Features:**
- Dynamic color coding based on performance:
  - Green (>85%): Excellent
  - Amber (75-85%): Warning
  - Red (<75%): Critical
- Percentage-formatted Y-axis
- Comprehensive tooltip with all metrics

**Data Source:**
- Uses `groupByDimension()` with 'country'
- Shows authorization rate as percentage

**Example:**
```tsx
<CountryComparisonChart />
```

## Responsive Layout Patterns

### Two-Column Grid (Desktop)

```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  <DeclineImpactBarChart />
  <CountryComparisonChart />
  <DeclineTrendLineChart />
  <PaymentMethodBreakdownChart />
</div>
```

### Full-Width Charts

```tsx
<div className="space-y-6">
  <DeclineTrendLineChart />
  <DeclineImpactBarChart />
</div>
```

### Mixed Layout

```tsx
<div className="space-y-6">
  {/* Full width */}
  <DeclineTrendLineChart />

  {/* Two columns */}
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <CountryComparisonChart />
    <PaymentMethodBreakdownChart />
  </div>

  {/* Full width */}
  <DeclineImpactBarChart />
</div>
```

## State Management

All charts automatically connect to the Zustand filter store:

```tsx
import { useFilteredTransactions } from '@/store/filterStore';

// Inside component:
const filteredTransactions = useFilteredTransactions();
```

When filters change (country, date range, payment method, etc.), all charts automatically re-render with the filtered data.

## Customization

### Creating Custom Charts

Use ChartContainer for consistent styling:

```tsx
'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useFilteredTransactions } from '@/store/filterStore';
import { ChartContainer } from './ChartContainer';

export const CustomChart: React.FC = () => {
  const filteredTransactions = useFilteredTransactions();

  const chartData = useMemo(() => {
    // Process your data here
    return processData(filteredTransactions);
  }, [filteredTransactions]);

  return (
    <ChartContainer
      title="Custom Metric"
      description="Description of custom chart"
      isEmpty={chartData.length === 0}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          {/* Your chart configuration */}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
```

## Styling Guidelines

### Colors Used

**Status Colors:**
- Approved: `#10B981` (green-500)
- Soft Decline: `#F59E0B` (amber-500)
- Hard Decline: `#DC2626` (red-600)

**Performance Thresholds:**
- Excellent (>85%): `#10B981` (green)
- Warning (75-85%): `#F59E0B` (amber)
- Critical (<75%): `#DC2626` (red)

**Chart Elements:**
- Grid: `#E5E7EB` (gray-200)
- Axis Text: `#6B7280` (gray-500)
- Tooltip Background: `#1F2937` (gray-900)

### Typography

- Chart Title: `text-lg font-semibold text-gray-900`
- Description: `text-sm text-gray-600`
- Axis Labels: `fontSize={12}`
- Tooltip Title: `font-semibold text-white`

## Performance Tips

1. **Use useMemo**: All data processing is wrapped in `useMemo()` to prevent unnecessary recalculations
2. **Filter First**: Charts only process filtered transactions, not all 300 transactions
3. **Limit Results**: DeclineImpactBarChart limits to top 10 for better performance and readability

## Accessibility

All charts include:
- Semantic HTML elements
- ARIA labels for loading states
- Color contrast ratios meeting WCAG guidelines
- Keyboard-accessible tooltips

## Troubleshooting

### Chart Not Rendering

1. Check that Recharts is installed: `npm install recharts`
2. Verify the component is client-side: `'use client'` at top of file
3. Check browser console for errors

### Empty State Showing

1. Verify transactions exist in store
2. Check active filters - may be too restrictive
3. Inspect data in browser dev tools: `useFilteredTransactions()`

### Data Not Updating

1. Ensure component is using `useFilteredTransactions()` hook
2. Verify data processing is wrapped in `useMemo()`
3. Check that filters are changing in Zustand store

## TypeScript Types

All components are fully typed. Key interfaces:

```tsx
import type {
  Transaction,
  DimensionAggregate,
  TimeSeriesDataPoint,
  DeclineCodeAnalysis,
} from '@/lib/types';
```

## Next Steps

1. Add these charts to your dashboard page
2. Customize the layout based on your needs
3. Consider adding filters UI components
4. Extend with additional custom charts using ChartContainer
