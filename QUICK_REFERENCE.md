# Payment Analytics Dashboard - Quick Reference

## Component Quick Start

### Import & Use Summary Cards Grid

```tsx
import { SummaryCardsGrid } from '@/app/dashboard/components/summary/SummaryCardsGrid';

// In your page/component:
<SummaryCardsGrid />
<SummaryCardsGrid isLoading={true} />
```

### Import & Use Decline Analysis Table

```tsx
import { DeclineAnalysisTable } from '@/app/dashboard/components/tables/DeclineAnalysisTable';

// In your page/component:
<DeclineAnalysisTable />
```

### Use Individual Cards

```tsx
import { TotalTransactionsCard } from '@/app/dashboard/components/summary/TotalTransactionsCard';
import { AuthorizationRateCard } from '@/app/dashboard/components/summary/AuthorizationRateCard';
import { TotalLostRevenueCard } from '@/app/dashboard/components/summary/TotalLostRevenueCard';
import { TopDeclineCodeCard } from '@/app/dashboard/components/summary/TopDeclineCodeCard';
import { useFilteredTransactions } from '@/store/filterStore';

const transactions = useFilteredTransactions();

<TotalTransactionsCard transactions={transactions} />
<AuthorizationRateCard transactions={transactions} />
<TotalLostRevenueCard transactions={transactions} />
<TopDeclineCodeCard transactions={transactions} />
```

---

## Component Descriptions

| Component | Purpose | Location |
|-----------|---------|----------|
| **SummaryCard** | Base reusable metric card | `/summary/SummaryCard.tsx` |
| **TotalTransactionsCard** | Shows total tx count | `/summary/TotalTransactionsCard.tsx` |
| **AuthorizationRateCard** | Shows auth rate % | `/summary/AuthorizationRateCard.tsx` |
| **TotalLostRevenueCard** | Shows lost revenue $ | `/summary/TotalLostRevenueCard.tsx` |
| **TopDeclineCodeCard** | Shows top decline code | `/summary/TopDeclineCodeCard.tsx` |
| **SummaryCardsGrid** | Container grid (all 4) | `/summary/SummaryCardsGrid.tsx` |
| **DeclineAnalysisTable** | Sortable decline table | `/tables/DeclineAnalysisTable.tsx` |

---

## SummaryCard Variants

```tsx
<SummaryCard variant="default" />  // Gray background
<SummaryCard variant="success" />  // Green background
<SummaryCard variant="warning" />  // Amber background
<SummaryCard variant="error" />    // Red background
```

---

## Authorization Rate Color Coding

| Rate | Variant | Color |
|------|---------|-------|
| >90% | success | Green |
| 80-90% | warning | Amber |
| <80% | error | Red |

---

## Table Sorting

**Click column header to sort:**
- First click: Sort descending (↓)
- Second click: Sort ascending (↑)
- Third click: No sort (⬍)

**Sortable columns:**
- Decline Code
- Count
- Total Amount
- % of Total

---

## Grid Responsive Layout

| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| Tablet (md) | 2 |
| Desktop (xl) | 4 |

---

## Styling Classes

### Cards
```css
rounded-lg border border-gray-200 shadow-sm p-6
```

### Grid
```css
grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4
```

### Table
```css
overflow-x-auto rounded-lg border border-gray-200 bg-white
```

---

## Data Dependencies

All components automatically:
1. Connect to Zustand store
2. Get filtered transactions via `useFilteredTransactions()`
3. Run analytics functions
4. Format output
5. Update on filter changes

**No props needed** (except loading states)

---

## Loading States

```tsx
<SummaryCardsGrid isLoading={true} />
<TotalTransactionsCard transactions={tx} isLoading={true} />
<AuthorizationRateCard transactions={tx} isLoading={true} />
<TotalLostRevenueCard transactions={tx} isLoading={true} />
<TopDeclineCodeCard transactions={tx} isLoading={true} />
```

Shows skeleton animation while loading.

---

## Format Examples

### Currency (formatCurrency)
```
$1,234.56          // MXN/COP
R$1,234.56         // BRL
$1.2K              // Compact mode
R$1.2M             // Compact mode
```

### Percentage (formatPercentage)
```
84.3%              // 1 decimal place (default)
84.27%             // 2 decimal places
```

### Numbers (formatNumber)
```
1.2K               // >= 1,000
1.2M               // >= 1,000,000
1.2B               // >= 1,000,000,000
```

---

## Multi-Currency Handling

**Automatic currency detection:**
- Looks at declined transactions
- Selects most common currency
- Formats all amounts in that currency

**Example:** 200 transactions declined in MXN, 50 in BRL → Uses MXN

---

## Empty States

**SummaryCards:**
- If no transactions: Shows 0 counts, N/A values

**DeclineAnalysisTable:**
- If no declines: Shows message "No declined transactions in selected period."

**TopDeclineCodeCard:**
- If no declines: Shows "No Declines", subtitle "No declined transactions in filtered data"

---

## Accessibility Features

- Semantic HTML tables
- ARIA labels on cards
- Keyboard sortable columns
- Cursor pointer on interactive elements
- Color + text indicators (not color alone)
- WCAG AA contrast ratios

---

## Performance Notes

**Optimized with:**
- `useMemo()` for expensive calculations
- Zustand selectors for efficient subscriptions
- Memoized sorting in tables
- Only re-render on relevant changes

**No performance issues with:**
- 300+ transactions
- Multiple filters
- Frequent updates

---

## Common Customizations

### Change Grid Columns
```tsx
// In SummaryCardsGrid.tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-2">
```

### Change Card Spacing
```tsx
// In SummaryCardsGrid.tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
```

### Change Variant Colors
```tsx
// In SummaryCard.tsx, modify getAccentColor()
case 'success':
  return 'text-blue-600';  // Change to blue
```

### Add Sort Indicator Style
```tsx
// Modify renderSortIcon() in DeclineAnalysisTable.tsx
return sortDirection === 'asc' ? ' 🔼' : ' 🔽';
```

---

## TypeScript Types

### SummaryCardProps
```typescript
interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  isLoading?: boolean;
}
```

### Individual Card Props
```typescript
interface CardProps {
  transactions: readonly Transaction[];
  isLoading?: boolean;
}
```

### DeclineAnalysisTable Props
```typescript
interface DeclineAnalysisTableProps {
  // No required props - connects to store
}
```

---

## File Structure

```
/app/dashboard/components/
├── summary/
│   ├── SummaryCard.tsx
│   ├── TotalTransactionsCard.tsx
│   ├── AuthorizationRateCard.tsx
│   ├── TotalLostRevenueCard.tsx
│   ├── TopDeclineCodeCard.tsx
│   └── SummaryCardsGrid.tsx
└── tables/
    └── DeclineAnalysisTable.tsx
```

---

## Related Files

**Core Libraries:**
- `/lib/types.ts` - Type definitions
- `/lib/analytics.ts` - Calculation functions
- `/lib/formatters.ts` - Format functions
- `/store/filterStore.ts` - Zustand state

**Data:**
- `/data/transactions.json` - 300 transaction records

---

## Useful Functions

### From Analytics
```typescript
getAuthorizationRate(transactions)     // Returns authorization metrics
getLostRevenue(transactions)           // Returns lost revenue amount
getDeclineImpact(transactions)         // Returns ranked decline codes
```

### From Formatters
```typescript
formatCurrency(amount, currency)       // Formats money
formatPercentage(value, decimals)      // Formats %
formatNumber(value, decimals)          // Formats large numbers
getDeclineDescription(code)            // Gets human-readable text
```

### From Store
```typescript
useFilteredTransactions()              // Get filtered tx array
useFilters()                           // Get current filters
useFilterActions()                     // Get filter setters
```

---

## Troubleshooting

**Components not updating on filter change?**
- Check that you're using `useFilteredTransactions()` hook
- Verify Zustand store is properly initialized

**Currency showing wrong symbol?**
- Check transaction data currency field
- Verify currency is 'MXN', 'COP', or 'BRL'

**Table not sorting?**
- Check column header is clickable (should have cursor-pointer)
- Verify data is populated

**Cards showing skeleton?**
- Check `isLoading` prop is false
- Verify transactions are being passed

**Styling not applying?**
- Verify Tailwind CSS is configured
- Check for conflicting CSS
- Use `!important` only as last resort

---

## Next Steps

1. **Import components** into your dashboard page
2. **Test responsiveness** at different breakpoints
3. **Connect filters** if not already integrated
4. **Customize colors** if needed
5. **Add loading states** for data fetching
6. **Test with real data** in your environment

---

## Questions?

Refer to:
- `COMPONENTS_GUIDE.md` - Comprehensive documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- Component JSDoc comments - Inline documentation
