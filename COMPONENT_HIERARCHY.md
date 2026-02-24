# Payment Analytics Dashboard - Component Hierarchy

## Visual Architecture

```
DashboardPage
  └── SummaryCardsGrid
      ├── TotalTransactionsCard
      │   └── SummaryCard (variant: default)
      │       └── getAuthorizationRate()
      │
      ├── AuthorizationRateCard
      │   └── SummaryCard (variant: dynamic)
      │       └── getAuthorizationRate()
      │
      ├── TotalLostRevenueCard
      │   └── SummaryCard (variant: error)
      │       └── getLostRevenue()
      │
      └── TopDeclineCodeCard
          └── SummaryCard (variant: warning/default)
              └── getDeclineImpact()

DashboardPage
  └── DeclineAnalysisTable
      └── getDeclineImpact()
          └── formatCurrency()
          └── formatPercentage()
          └── getDeclineDescription()
```

---

## Component Dependency Graph

```
Zustand Store (filterStore)
  │
  ├── useFilteredTransactions()
  │   │
  │   ├── SummaryCardsGrid
  │   │   ├── TotalTransactionsCard ────→ getAuthorizationRate()
  │   │   ├── AuthorizationRateCard ────→ getAuthorizationRate()
  │   │   ├── TotalLostRevenueCard ─────→ getLostRevenue()
  │   │   └── TopDeclineCodeCard ──────→ getDeclineImpact()
  │   │
  │   └── DeclineAnalysisTable ────────→ getDeclineImpact()
  │
  └── Formatters
      ├── formatCurrency()
      ├── formatPercentage()
      ├── formatNumber()
      └── getDeclineDescription()

Types (/lib/types.ts)
  └── Transaction, DeclineCodeAnalysis, etc.
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zustand Store                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  allTransactions: Transaction[]                           │  │
│  │  filteredTransactions: Transaction[]                      │  │
│  │  filters: TransactionFilters                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         │ useFilteredTransactions()
                         │
           ┌─────────────┴──────────────┐
           │                            │
      SummaryCardsGrid             DeclineAnalysisTable
      │                            │
      ├─ TotalTransactionsCard     └─ Sort & display decline codes
      │  └─ getAuthorizationRate()
      │     └─ formatNumber()
      │
      ├─ AuthorizationRateCard
      │  └─ getAuthorizationRate()
      │     └─ formatPercentage()
      │     └─ Variant selection
      │
      ├─ TotalLostRevenueCard
      │  └─ getLostRevenue()
      │     └─ formatCurrency()
      │
      └─ TopDeclineCodeCard
         └─ getDeclineImpact()
            └─ getDeclineDescription()
            └─ Variant selection
```

---

## Component Props Flow

```
┌──────────────────────────────────────────────────────┐
│          SummaryCardsGrid                            │
│  (Uses Zustand hook, no props needed)               │
└──────────────┬───────────────────────────────────────┘
               │
               ├─────────────────────┬─────────────────┬──────────────┐
               │                     │                 │              │
        ┌──────▼──────┐      ┌──────▼──────┐   ┌─────▼────┐   ┌────▼──────┐
        │   Total     │      │   Auth      │   │   Lost   │   │    Top    │
        │ Transactions│      │  Rate       │   │ Revenue  │   │  Decline  │
        └─────┬───────┘      └─────┬───────┘   └────┬─────┘   └────┬──────┘
              │                    │                 │             │
        ┌─────▼──────────────┐     │                 │             │
        │  SummaryCard       │     │                 │             │
        │  Props:            │     │                 │             │
        │  - title: string   │     │                 │             │
        │  - value: number   │     │                 │             │
        │  - subtitle: string│     │                 │             │
        │  - variant         │◄────┴─────────────────┴─────────────┘
        │  - isLoading       │
        └────────────────────┘

┌──────────────────────────────────────────────────────┐
│      DeclineAnalysisTable                            │
│  (Uses Zustand hook, no props needed)               │
│  Renders sorted/paginated decline analysis         │
└──────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
User applies filter
  │
  ├─→ Zustand store updates
  │   - filters object changes
  │   - filterTransactions() runs
  │   - filteredTransactions updates
  │
  ├─→ useFilteredTransactions() selector fires
  │   - Re-evaluates in all subscribed components
  │
  └─→ Components re-render with new data
      - SummaryCardsGrid updates
      - Each card recalculates metrics
      - DeclineAnalysisTable re-sorts
      - All formatters re-run
      - Output displays to user
```

---

## Component Composition Pattern

### Container Components (Smart)
```
SummaryCardsGrid
- Connects to Zustand store
- Receives filtered transactions via hook
- Manages isLoading state
- Passes data to presentational children
```

### Presentational Components (Dumb)
```
TotalTransactionsCard
AuthorizationRateCard
TotalLostRevenueCard
TopDeclineCodeCard
SummaryCard
DeclineAnalysisTable

- Receive data via props
- No store connections (mostly)
- Calculate display values
- Render JSX
- Focus on presentation
```

---

## Variant Mapping

### SummaryCard Variants

```
SummaryCard
  │
  ├─ variant: "default"
  │  └─ bg-white, text-gray-900
  │     (TotalTransactionsCard)
  │
  ├─ variant: "success" (green)
  │  └─ bg-green-50, text-green-600
  │     (AuthorizationRateCard when rate > 90%)
  │
  ├─ variant: "warning" (amber)
  │  └─ bg-amber-50, text-amber-600
  │     (AuthorizationRateCard when 80-90%)
  │     (TopDeclineCodeCard when declines exist)
  │
  └─ variant: "error" (red)
     └─ bg-red-50, text-red-600
        (AuthorizationRateCard when rate < 80%)
        (TotalLostRevenueCard)
```

---

## Analytics Function Calls

```
getAuthorizationRate(transactions)
  ├─ Input: Transaction[] (from Zustand)
  ├─ Output: {
  │   total: number
  │   approved: number
  │   declined: number
  │   authorizationRate: number (0-100)
  │   totalRevenue: number
  │   lostRevenue: number
  │ }
  │
  ├─ Used by:
  │  ├─ TotalTransactionsCard
  │  ├─ AuthorizationRateCard
  │  └─ SummaryCard (base)
  │

getLostRevenue(transactions)
  ├─ Input: Transaction[]
  ├─ Output: number (total lost amount)
  │
  └─ Used by:
     └─ TotalLostRevenueCard

getDeclineImpact(transactions)
  ├─ Input: Transaction[]
  ├─ Output: DeclineCodeAnalysis[] (sorted by count)
  │   └─ { code, type, count, percentage, lostRevenue, ... }
  │
  └─ Used by:
     ├─ TopDeclineCodeCard
     └─ DeclineAnalysisTable
```

---

## Formatter Function Calls

```
formatCurrency(amount, currency)
  └─ Used by:
     ├─ TotalLostRevenueCard
     └─ DeclineAnalysisTable

formatPercentage(value, decimals)
  └─ Used by:
     ├─ AuthorizationRateCard
     └─ DeclineAnalysisTable

getDeclineDescription(code)
  └─ Used by:
     ├─ TopDeclineCodeCard
     └─ DeclineAnalysisTable (Description column)
```

---

## Render Tree Example

```
<DashboardPage>
  <main>
    <section>
      <h1>Payment Analytics</h1>
      <SummaryCardsGrid isLoading={false}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article> {/* TotalTransactionsCard */}
            <p>Total Transactions</p>
            <p>1,234</p>
            <p>1,000 approved, 234 declined</p>
          </article>

          <article> {/* AuthorizationRateCard */}
            <p>Authorization Rate</p>
            <p>84.3%</p>
            <p>Percentage of approved transactions</p>
          </article>

          <article> {/* TotalLostRevenueCard */}
            <p>Total Lost Revenue</p>
            <p>$45,678.90</p>
            <p>Sum of all declined transactions</p>
          </article>

          <article> {/* TopDeclineCodeCard */}
            <p>Top Decline Code</p>
            <p>Insufficient Funds</p>
            <p>42 transactions</p>
          </article>
        </div>
      </SummaryCardsGrid>
    </section>

    <section>
      <h2>Decline Analysis</h2>
      <DeclineAnalysisTable>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Decline Code ↓</th>
                <th>Description</th>
                <th>Count</th>
                <th>Total Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="font-semibold bg-gray-100"> {/* Top row */}
                <td>insufficient_funds</td>
                <td>Insufficient Funds</td>
                <td className="text-right">42</td>
                <td className="text-right text-red-600">$12,345.67</td>
                <td className="text-right">35.2%</td>
              </tr>
              <tr className="bg-white">
                {/* More rows... */}
              </tr>
            </tbody>
          </table>
        </div>
      </DeclineAnalysisTable>
    </section>
  </main>
</DashboardPage>
```

---

## Hook Usage Map

```
Component                          │ Hook Usage
───────────────────────────────────┼──────────────────────────────────
SummaryCardsGrid                   │ useFilteredTransactions()
TotalTransactionsCard              │ (props passed)
AuthorizationRateCard              │ useMemo() for variant
TotalLostRevenueCard               │ useMemo() for currency
TopDeclineCodeCard                 │ useMemo() for decline calc
SummaryCard                        │ None (presentation only)
DeclineAnalysisTable               │ useFilteredTransactions()
                                   │ useState() for sort
                                   │ useMemo() for sorting logic
```

---

## Performance Optimization Map

```
Component                          │ Optimization
───────────────────────────────────┼──────────────────────────────────
AuthorizationRateCard              │ useMemo(variant calculation)
TotalLostRevenueCard               │ useMemo(currency detection)
TopDeclineCodeCard                 │ useMemo(decline calculation)
DeclineAnalysisTable               │ useMemo(sort + currency)
Zustand selectors                  │ useFilteredTransactions()
                                   │ useFilters()
                                   │ useFilterActions()
```

---

## File Import Structure

```
TotalTransactionsCard.tsx
├── './SummaryCard'
├── '@/lib/types' (Transaction)
└── '@/lib/analytics' (getAuthorizationRate)

AuthorizationRateCard.tsx
├── './SummaryCard'
├── '@/lib/types' (Transaction)
├── '@/lib/analytics' (getAuthorizationRate)
└── '@/lib/formatters' (formatPercentage)

TotalLostRevenueCard.tsx
├── './SummaryCard'
├── '@/lib/types' (Transaction)
├── '@/lib/analytics' (getLostRevenue)
└── '@/lib/formatters' (formatCurrency)

TopDeclineCodeCard.tsx
├── './SummaryCard'
├── '@/lib/types' (Transaction)
├── '@/lib/analytics' (getDeclineImpact)
└── '@/lib/formatters' (getDeclineDescription)

SummaryCardsGrid.tsx
├── '@/store/filterStore' (useFilteredTransactions)
├── './TotalTransactionsCard'
├── './AuthorizationRateCard'
├── './TotalLostRevenueCard'
└── './TopDeclineCodeCard'

DeclineAnalysisTable.tsx
├── '@/store/filterStore' (useFilteredTransactions)
├── '@/lib/analytics' (getDeclineImpact)
└── '@/lib/formatters' (formatCurrency, formatPercentage, getDeclineDescription)
```

---

## Component Reusability Map

```
SummaryCard
├── Used by: TotalTransactionsCard
├── Used by: AuthorizationRateCard
├── Used by: TotalLostRevenueCard
└── Used by: TopDeclineCodeCard

SummaryCardsGrid
└── Contains all 4 summary cards

DeclineAnalysisTable
└── Standalone component

Analytics Functions
├── Used by: All summary cards
└── Used by: DeclineAnalysisTable

Formatter Functions
├── Used by: All components
└── Reusable in other features
```

---

## Summary

- **7 components total** (1 base + 4 specific cards + 1 grid + 1 table)
- **3 documentation files** (guide, summary, reference)
- **0 props needed** for main grid/table (uses Zustand)
- **100% TypeScript** (no `any` types)
- **Performance optimized** (useMemo, selectors)
- **Fully accessible** (WCAG 2.1 AA)
- **Production ready** (clean, maintainable code)
