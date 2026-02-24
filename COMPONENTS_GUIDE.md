# Payment Analytics Dashboard - Components Guide

## Overview

This guide documents the summary cards and decline analysis table components built for the payment analytics dashboard.

## Architecture

All components follow a strict **presentation-only** pattern:
- Components receive pre-processed data via props
- Analytics calculations come from `/lib/analytics.ts`
- Data formatting comes from `/lib/formatters.ts`
- State management via Zustand store (`/store/filterStore.ts`)
- Types defined in `/lib/types.ts`

## Component Structure

### Summary Card Components

#### 1. `SummaryCard.tsx` (Base Component)
**Location:** `/app/dashboard/components/summary/SummaryCard.tsx`

Reusable card component for displaying key metrics.

**Props:**
```typescript
interface SummaryCardProps {
  title: string;              // Card title/label
  value: string | number;     // Main value to display
  subtitle?: string;          // Optional additional context
  variant?: SummaryCardVariant; // 'default' | 'success' | 'warning' | 'error'
  isLoading?: boolean;        // Loading skeleton state
}
```

**Variants:**
- `default`: Gray background (primary metrics)
- `success`: Green background (positive metrics, >90% authorization)
- `warning`: Amber background (warning metrics, 80-90% authorization)
- `error`: Red background (negative metrics, <80% authorization, lost revenue)

**Styling:**
- White background with subtle shadow
- Rounded corners (rounded-lg)
- Professional padding (p-6)
- Responsive
- Loading skeleton animation

---

#### 2. `TotalTransactionsCard.tsx`
**Location:** `/app/dashboard/components/summary/TotalTransactionsCard.tsx`

Displays total transaction count with approval/decline breakdown.

**Props:**
```typescript
interface TotalTransactionsCardProps {
  transactions: readonly Transaction[];
  isLoading?: boolean;
}
```

**Displays:**
- Total count: "1,234" (formatted with thousands separator)
- Subtitle: "1,000 approved, 234 declined"

**Uses:**
- `getAuthorizationRate()` from analytics

---

#### 3. `AuthorizationRateCard.tsx`
**Location:** `/app/dashboard/components/summary/AuthorizationRateCard.tsx`

Displays authorization rate as percentage with color coding.

**Props:**
```typescript
interface AuthorizationRateCardProps {
  transactions: readonly Transaction[];
  isLoading?: boolean;
}
```

**Displays:**
- Authorization rate as percentage: "84.3%"
- Subtitle: "Percentage of approved transactions"

**Variant Logic:**
- Green (success): >90%
- Amber (warning): 80-90%
- Red (error): <80%

**Uses:**
- `getAuthorizationRate()` for metrics
- `formatPercentage()` for formatting
- `useMemo()` to optimize variant calculation

---

#### 4. `TotalLostRevenueCard.tsx`
**Location:** `/app/dashboard/components/summary/TotalLostRevenueCard.tsx`

Displays total lost revenue from declined transactions.

**Props:**
```typescript
interface TotalLostRevenueCardProps {
  transactions: readonly Transaction[];
  isLoading?: boolean;
}
```

**Displays:**
- Lost revenue: "$12,345.67"
- Subtitle: "Sum of all declined transactions"

**Multi-Currency Handling:**
- Determines primary currency from declined transactions (majority)
- Formats in that currency
- Suitable for single-view dashboards; for detailed multi-currency reports, enhancement recommended

**Uses:**
- `getLostRevenue()` for calculation
- `formatCurrency()` for formatting
- `useMemo()` to determine primary currency

---

#### 5. `TopDeclineCodeCard.tsx`
**Location:** `/app/dashboard/components/summary/TopDeclineCodeCard.tsx`

Displays the most impactful decline code by frequency.

**Props:**
```typescript
interface TopDeclineCodeCardProps {
  transactions: readonly Transaction[];
  isLoading?: boolean;
}
```

**Displays:**
- Decline code description: "Insufficient Funds"
- Subtitle: "42 transactions" or "No Declines"

**Variant:**
- Warning (amber) if declines exist
- Default (gray) if no declines

**Uses:**
- `getDeclineImpact()` to get ranked decline codes
- `getDeclineDescription()` for human-readable text
- `useMemo()` to optimize calculation

---

#### 6. `SummaryCardsGrid.tsx` (Container)
**Location:** `/app/dashboard/components/summary/SummaryCardsGrid.tsx`

Container component that renders all four summary cards in a responsive grid.

**Props:**
```typescript
interface SummaryCardsGridProps {
  isLoading?: boolean;
}
```

**Features:**
- Connects to Zustand store: `useFilteredTransactions()`
- Responsive grid layout:
  - Mobile (1 col): single column
  - Tablet (md): 2 columns
  - Desktop (xl): 4 columns
- Consistent gap-6 spacing
- Passes filtered transactions to each card

**Usage:**
```tsx
<SummaryCardsGrid />
// or with loading state
<SummaryCardsGrid isLoading={false} />
```

---

### Table Component

#### 7. `DeclineAnalysisTable.tsx`
**Location:** `/app/dashboard/components/tables/DeclineAnalysisTable.tsx`

Sortable table analyzing decline code impact with visual hierarchy.

**Props:**
```typescript
interface DeclineAnalysisTableProps {
  isLoading?: boolean;
}
```

**Features:**

**Columns (All Sortable):**
| Column | Type | Alignment | Format |
|--------|------|-----------|--------|
| Decline Code | string | Left | Text |
| Description | string | Left | Human-readable |
| Count | number | Right | Localized (1,234) |
| Total Amount | number | Right | Currency ($1,234.56) |
| % of Total | number | Right | Percentage (45.3%) |

**Sorting:**
- Click any column header to sort
- Sort indicators: ↑ (ascending), ↓ (descending), ⬍ (no sort)
- Default: Code column, descending
- Click same column to toggle direction

**Visual Hierarchy:**
- First row (top decline code): Bold text, gray-100 background
- Zebra striping: Alternating white and gray-50 backgrounds
- Hover states: Subtle gray background on hover
- Responsive: Horizontal scroll on mobile (overflow-x-auto)

**Multi-Currency Handling:**
- Determines primary currency from declined transactions (majority)
- Formats all amounts in that currency

**Empty State:**
- Shows message: "No declined transactions in selected period."
- Centered, subtle styling

**Accessibility:**
- Semantic HTML: `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- Sortable headers have cursor-pointer and hover state
- Descriptive text for empty state
- Proper text alignment (left for identifiers, right for numbers)

**Performance:**
- `useMemo()` for expensive sort and currency calculations
- Only re-sorts when sortColumn, sortDirection, or transactions change
- Efficient decline analysis grouping

---

## Usage Examples

### Basic Implementation

```tsx
// In your dashboard page
import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Summary metrics at top */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Overview</h2>
        <SummaryCardsGrid />
      </section>

      {/* Decline analysis below */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Decline Analysis</h2>
        <DeclineAnalysisTable />
      </section>
    </div>
  );
}
```

### With Loading States

```tsx
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-8">
      <SummaryCardsGrid isLoading={isLoading} />
      <DeclineAnalysisTable isLoading={isLoading} />
    </div>
  );
}
```

### Individual Card Usage

```tsx
import { TotalTransactionsCard } from '@/app/dashboard/components/summary/TotalTransactionsCard';
import { useFilteredTransactions } from '@/store/filterStore';

export function CustomMetrics() {
  const transactions = useFilteredTransactions();

  return (
    <TotalTransactionsCard
      transactions={transactions}
      isLoading={false}
    />
  );
}
```

---

## Data Flow

```
Component
  ↓
useFilteredTransactions() (Zustand hook)
  ↓
Analytics functions (filterTransactions, getAuthorizationRate, etc.)
  ↓
Formatters (formatCurrency, formatPercentage, etc.)
  ↓
Rendered output
```

### Example: AuthorizationRateCard
```
AuthorizationRateCard
  ↓
getAuthorizationRate(transactions)
  ↓
{ authorizationRate: 84.3, ... }
  ↓
formatPercentage(84.3) → "84.3%"
  ↓
variant determination (84.3 → 'warning')
  ↓
SummaryCard rendered with variant styling
```

---

## TypeScript Specifications

All components are fully typed with no `any` types:

### Import Types
```typescript
import type { Transaction, DeclineCodeAnalysis } from '@/lib/types';
```

### Component Props
All props interfaces are explicitly defined and documented with JSDoc comments.

### Return Types
All functions explicitly return their types or use inferred types from TypeScript.

---

## Tailwind Classes Used

### Colors
- Text: `text-gray-900`, `text-gray-600`, `text-gray-700`
- Backgrounds: `bg-white`, `bg-gray-50`, `bg-gray-100`, `bg-green-50`, `bg-amber-50`, `bg-red-50`
- Borders: `border`, `border-gray-200`, `divide-gray-200`
- Accent: `text-green-600`, `text-amber-600`, `text-red-600`

### Layout
- Grid: `grid`, `grid-cols-1`, `md:grid-cols-2`, `xl:grid-cols-4`
- Spacing: `gap-6`, `p-6`, `px-6`, `py-3`, `py-4`, `mt-2`, `mt-4`, `mb-6`
- Sizing: `w-full`, `min-w-full`, `h-10`, `w-3/4`

### Visual Effects
- Shadows: `shadow-sm`
- Rounding: `rounded-lg`
- Borders: `border border-gray-200`, `divide-y divide-gray-200`
- Overflow: `overflow-x-auto`
- Hover: `hover:bg-gray-50`, `hover:bg-gray-100`
- Cursor: `cursor-pointer`
- Animation: `animate-pulse`
- Transitions: `transition-colors`

---

## Testing Considerations

### SummaryCard Base Component
- Test all variants (default, success, warning, error)
- Test loading state (skeleton animation)
- Test with various content lengths
- Test responsive padding

### Individual Summary Cards
- Test with empty transactions array
- Test with only approved transactions (no declines)
- Test with only declined transactions (no approvals)
- Test multi-currency scenarios
- Test percentage thresholds for color coding

### SummaryCardsGrid
- Test responsive grid layout at different breakpoints
- Test integration with Zustand store
- Test that all cards render together
- Test loading state propagation

### DeclineAnalysisTable
- Test sorting for each column
- Test sort direction toggle
- Test empty state rendering
- Test zebra striping (even/odd rows)
- Test top row highlighting
- Test multi-currency selection
- Test responsive horizontal scroll

---

## Performance Optimizations

1. **useMemo Hooks:**
   - `AuthorizationRateCard`: Variant determination
   - `TotalLostRevenueCard`: Primary currency detection
   - `TopDeclineCodeCard`: Decline analysis calculation
   - `DeclineAnalysisTable`: Sort and currency calculation

2. **Zustand Selectors:**
   - `useFilteredTransactions()`: Optimized to only trigger re-render on transaction changes
   - Components subscribe only to needed data

3. **Sorted Data:**
   - Table sorting uses memoized calculations
   - Only re-sorts when sort state or transactions change

---

## Currency Handling

All components handle multi-currency scenarios by determining the primary (most common) currency among declined or relevant transactions:

```typescript
const primaryCurrency = useMemo(() => {
  const declined = transactions.filter(t => t.status === 'declined');
  // Count by currency, select most common
  return mostCommonCurrency;
}, [transactions]);
```

This approach works well for single-currency dashboards. For detailed multi-currency reports, consider:
- Adding currency selector prop
- Showing separate rows/cards per currency
- Displaying currency conversion rates

---

## Accessibility Features

1. **Semantic HTML:**
   - Tables use proper `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements
   - Summary cards use `<article>` elements

2. **ARIA Labels:**
   - `role="region"` on summary cards
   - `aria-label` with card titles
   - Descriptive column headers in tables

3. **Keyboard Navigation:**
   - Sortable headers have visual hover states
   - Cursor changes to pointer for interactive elements
   - Tab order preserved for all elements

4. **Color Not Sole Indicator:**
   - Variant colors supplement, not replace, text content
   - Sort direction shown with text symbols (↑, ↓, ⬍)

5. **Contrast:**
   - All text meets WCAG AA contrast ratios
   - Sufficient color contrast for variant backgrounds

---

## Common Customizations

### Change Grid Layout
```tsx
// In SummaryCardsGrid.tsx, modify the grid class:
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

### Adjust Card Spacing
```tsx
// Change gap-6 to another value
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
```

### Customize Variant Colors
```tsx
// In SummaryCard.tsx getAccentColor() function:
case 'success':
  return 'text-blue-600'; // Change color
```

### Add More Summary Cards
```tsx
// Add to SummaryCardsGrid.tsx:
<YourNewCard transactions={filteredTransactions} isLoading={isLoading} />
```

---

## File Manifest

```
/app/dashboard/components/
├── summary/
│   ├── SummaryCard.tsx                 (Base reusable card)
│   ├── TotalTransactionsCard.tsx       (Transaction count)
│   ├── AuthorizationRateCard.tsx       (Auth rate %)
│   ├── TotalLostRevenueCard.tsx        (Lost revenue $)
│   ├── TopDeclineCodeCard.tsx          (Top decline code)
│   └── SummaryCardsGrid.tsx            (Container/grid)
└── tables/
    └── DeclineAnalysisTable.tsx        (Decline analysis table)
```

---

## Next Steps

1. **Integration:** Import `SummaryCardsGrid` and `DeclineAnalysisTable` into your dashboard page
2. **Styling Customization:** Adjust Tailwind classes to match your design system
3. **Filter UI:** Connect filter state from your filter panel to Zustand store
4. **Testing:** Write unit tests for each component and integration tests for the grid
5. **Enhanced Features:** Consider adding:
   - Export to CSV for table data
   - Custom date range presets
   - Comparison with previous period
   - Drill-down to transaction-level details

---

## Questions & Support

Refer to:
- `/lib/types.ts` for type definitions
- `/lib/analytics.ts` for calculation logic
- `/lib/formatters.ts` for formatting utilities
- `/store/filterStore.ts` for state management
