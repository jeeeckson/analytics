# Dashboard Page Example - How to Integrate Components

## Complete Example: Dashboard Page with All Components

Here's a production-ready example of how to integrate the summary cards and decline analysis table into your dashboard page.

### File: `/app/dashboard/page.tsx`

```tsx
'use client';

import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

/**
 * Payment Analytics Dashboard Page
 *
 * Displays key metrics and decline analysis for payment transactions.
 * Uses Zustand store for filtered transaction data.
 */
export default function DashboardPage() {
  return (
    <main className="space-y-8 bg-gray-50 p-8">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor transaction authorizations and decline patterns
        </p>
      </section>

      {/* Key Metrics Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-600">
            Current metrics for all filtered transactions
          </p>
        </div>
        <SummaryCardsGrid />
      </section>

      {/* Decline Analysis Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Decline Analysis</h2>
          <p className="text-sm text-gray-600">
            Click column headers to sort by any metric
          </p>
        </div>
        <DeclineAnalysisTable />
      </section>
    </main>
  );
}
```

---

## Example with Loading States

### File: `/app/dashboard/page.tsx` (with async loading)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading or wait for store initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="space-y-8 bg-gray-50 p-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor transaction authorizations and decline patterns
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <SummaryCardsGrid isLoading={isLoading} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Decline Analysis</h2>
        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <DeclineAnalysisTable />
        )}
      </section>
    </main>
  );
}
```

---

## Example with Filter Panel

### File: `/app/dashboard/page.tsx` (with filters)

```tsx
'use client';

import { useState } from 'react';
import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';
import { useFilterActions, useFilters } from '@/store/filterStore';

/**
 * Filter Panel Component (simplified example)
 */
function FilterPanel() {
  const filters = useFilters();
  const { resetFilters, setCountries } = useFilterActions();

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>

      {/* Country Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Countries</label>
        <div className="flex gap-4">
          {['Mexico', 'Colombia', 'Brazil'].map(country => (
            <label key={country} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.countries.includes(country as any)}
                onChange={e => {
                  if (e.target.checked) {
                    setCountries([...filters.countries, country as any]);
                  } else {
                    setCountries(filters.countries.filter(c => c !== country));
                  }
                }}
              />
              <span className="text-sm text-gray-700">{country}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </section>
  );
}

/**
 * Main Dashboard Page with Filters
 */
export default function DashboardPage() {
  return (
    <main className="space-y-8 bg-gray-50 p-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
      </section>

      {/* Filters */}
      <FilterPanel />

      {/* Metrics */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <SummaryCardsGrid />
      </section>

      {/* Analysis */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Decline Analysis</h2>
        <DeclineAnalysisTable />
      </section>
    </main>
  );
}
```

---

## Example with Custom Layout

### File: `/app/dashboard/page.tsx` (custom 2-column layout)

```tsx
'use client';

import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';
import { TotalTransactionsCard } from '@/app/dashboard/components/summary/TotalTransactionsCard';
import { useFilteredTransactions } from '@/store/filterStore';

/**
 * Custom dashboard with 2-column layout
 * Left: Key cards
 * Right: Analysis table
 */
export default function DashboardPage() {
  const transactions = useFilteredTransactions();

  return (
    <main className="space-y-8 bg-gray-50 p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Summary Cards (wider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top row: 2 cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TotalTransactionsCard transactions={transactions} />
            {/* Add another card here */}
          </div>

          {/* Decline Analysis Table */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Decline Details</h2>
            <DeclineAnalysisTable />
          </section>
        </div>

        {/* Right Column: Sidebar (narrower) */}
        <aside className="space-y-6">
          {/* Quick stats or filters */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            {/* Add stat cards here */}
          </div>
        </aside>
      </div>
    </main>
  );
}
```

---

## Example with Individual Cards

### File: `/app/dashboard/page.tsx` (custom card selection)

```tsx
'use client';

import { useFilteredTransactions } from '@/store/filterStore';
import { TotalTransactionsCard } from '@/app/dashboard/components/summary/TotalTransactionsCard';
import { AuthorizationRateCard } from '@/app/dashboard/components/summary/AuthorizationRateCard';
import { TotalLostRevenueCard } from '@/app/dashboard/components/summary/TotalLostRevenueCard';
import { TopDeclineCodeCard } from '@/app/dashboard/components/summary/TopDeclineCodeCard';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

/**
 * Custom dashboard using individual cards
 * Allows fine-grained control over card placement
 */
export default function DashboardPage() {
  const transactions = useFilteredTransactions();

  return (
    <main className="space-y-8 bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>

      {/* Custom grid with specific card order */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TotalTransactionsCard transactions={transactions} />
        <AuthorizationRateCard transactions={transactions} />
        <TotalLostRevenueCard transactions={transactions} />
        <TopDeclineCodeCard transactions={transactions} />
      </div>

      {/* Full-width table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Decline Analysis</h2>
        <DeclineAnalysisTable />
      </section>

      {/* Additional sections */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Custom content sections */}
      </section>
    </main>
  );
}
```

---

## Styling Customization Examples

### Example 1: Dark Mode Support

```tsx
'use client';

import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

export default function DashboardPage() {
  return (
    <main className="space-y-8 bg-gray-900 p-8 dark">
      {/* Dark mode styling */}
      <h1 className="text-3xl font-bold text-white">Payment Analytics</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <SummaryCardsGrid />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Analysis</h2>
        <DeclineAnalysisTable />
      </section>
    </main>
  );
}
```

### Example 2: Compact Layout

```tsx
'use client';

import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

export default function DashboardPage() {
  return (
    <main className="space-y-4 bg-gray-50 p-4">
      {/* Smaller padding and gaps for compact view */}
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <section className="space-y-2">
        <SummaryCardsGrid />
      </section>

      <section className="space-y-2">
        <DeclineAnalysisTable />
      </section>
    </main>
  );
}
```

---

## Common Integration Patterns

### Pattern 1: Sidebar Layout

```tsx
<div className="grid gap-8 lg:grid-cols-4">
  <aside className="lg:col-span-1">
    {/* Filters and quick controls */}
  </aside>
  <main className="lg:col-span-3">
    <SummaryCardsGrid />
    <DeclineAnalysisTable />
  </main>
</div>
```

### Pattern 2: Stacked Layout

```tsx
<main className="space-y-8">
  <SummaryCardsGrid />
  <DeclineAnalysisTable />
  {/* More sections */}
</main>
```

### Pattern 3: Tabbed Layout

```tsx
<div className="space-y-4">
  <div className="flex gap-4 border-b border-gray-200">
    <button className="px-4 py-2 border-b-2 border-blue-500">Overview</button>
    <button className="px-4 py-2 text-gray-600">Details</button>
  </div>

  {/* Tab 1: Overview */}
  <SummaryCardsGrid />

  {/* Tab 2: Details */}
  <DeclineAnalysisTable />
</div>
```

---

## Integration Checklist

Before deploying to production:

- [ ] Import components into dashboard page
- [ ] Verify components render without errors
- [ ] Test on mobile/tablet/desktop sizes
- [ ] Verify filter integration works
- [ ] Check that data updates when filters change
- [ ] Test table sorting functionality
- [ ] Verify all colors display correctly
- [ ] Test loading states
- [ ] Check accessibility (keyboard navigation)
- [ ] Verify TypeScript compilation succeeds
- [ ] Test with real transaction data
- [ ] Review and adjust spacing if needed
- [ ] Add any custom styling per brand guidelines
- [ ] Deploy to staging for QA testing
- [ ] Deploy to production

---

## File Locations

**Component Imports:**
```typescript
import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';
import { TotalTransactionsCard } from '@/app/dashboard/components/summary/TotalTransactionsCard';
import { AuthorizationRateCard } from '@/app/dashboard/components/summary/AuthorizationRateCard';
import { TotalLostRevenueCard } from '@/app/dashboard/components/summary/TotalLostRevenueCard';
import { TopDeclineCodeCard } from '@/app/dashboard/components/summary/TopDeclineCodeCard';
```

**Store Imports:**
```typescript
import { useFilteredTransactions } from '@/store/filterStore';
import { useFilters } from '@/store/filterStore';
import { useFilterActions } from '@/store/filterStore';
```

---

## Next Steps

1. Copy one of the examples above into your `/app/dashboard/page.tsx`
2. Adjust layout and spacing to match your design
3. Add any custom filter UI if needed
4. Test thoroughly at different breakpoints
5. Deploy and monitor for any issues

All components are production-ready and can be deployed immediately!
