import { create } from 'zustand';
import type {
  Transaction,
  TransactionFilters,
  DateRange,
  Country,
  PaymentMethod,
  Processor,
  DeclineCode,
  DeclineType,
} from '@/lib/types';
import { filterTransactions } from '@/lib/analytics';
import transactionsData from '@/data/transactions.json';

// ============================================================================
// Store State Interface
// ============================================================================

interface FilterState {
  // Raw data (loaded once)
  allTransactions: Transaction[];

  // Current filter values
  filters: TransactionFilters;

  // Computed filtered data (memoized)
  filteredTransactions: Transaction[];

  // Actions - Filter setters
  setDateRange: (range: DateRange) => void;
  setCountries: (countries: Country[]) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setProcessors: (processors: Processor[]) => void;
  setDeclineCodes: (codes: DeclineCode[]) => void;
  setDeclineTypes: (types: DeclineType[]) => void;

  // Actions - Toggles (for multi-select UX)
  toggleCountry: (country: Country) => void;
  togglePaymentMethod: (method: PaymentMethod) => void;
  toggleProcessor: (processor: Processor) => void;
  toggleDeclineCode: (code: DeclineCode) => void;
  toggleDeclineType: (type: DeclineType) => void;

  // Actions - Utility
  resetFilters: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: TransactionFilters = {
  dateRange: { start: null, end: null },
  countries: [],
  paymentMethods: [],
  processors: [],
  declineCodes: [],
  declineTypes: [],
};

// ============================================================================
// Store Creation
// ============================================================================

export const useFilterStore = create<FilterState>((set, get) => ({
  // Load transactions from JSON
  allTransactions: transactionsData as Transaction[],

  // Initial filter state
  filters: initialFilters,

  // Initially no filters, so all transactions shown
  filteredTransactions: transactionsData as Transaction[],

  // ========================================================================
  // Filter Setters
  // ========================================================================

  setDateRange: (range: DateRange) => {
    set(state => {
      const newFilters = { ...state.filters, dateRange: range };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  setCountries: (countries: Country[]) => {
    set(state => {
      const newFilters = { ...state.filters, countries };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  setPaymentMethods: (methods: PaymentMethod[]) => {
    set(state => {
      const newFilters = { ...state.filters, paymentMethods: methods };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  setProcessors: (processors: Processor[]) => {
    set(state => {
      const newFilters = { ...state.filters, processors };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  setDeclineCodes: (codes: DeclineCode[]) => {
    set(state => {
      const newFilters = { ...state.filters, declineCodes: codes };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  setDeclineTypes: (types: DeclineType[]) => {
    set(state => {
      const newFilters = { ...state.filters, declineTypes: types };
      return {
        filters: newFilters,
        filteredTransactions: filterTransactions(state.allTransactions, newFilters),
      };
    });
  },

  // ========================================================================
  // Toggle Helpers (for multi-select checkboxes)
  // ========================================================================

  toggleCountry: (country: Country) => {
    const current = get().filters.countries;
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    get().setCountries(updated);
  },

  togglePaymentMethod: (method: PaymentMethod) => {
    const current = get().filters.paymentMethods;
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    get().setPaymentMethods(updated);
  },

  toggleProcessor: (processor: Processor) => {
    const current = get().filters.processors;
    const updated = current.includes(processor)
      ? current.filter(p => p !== processor)
      : [...current, processor];
    get().setProcessors(updated);
  },

  toggleDeclineCode: (code: DeclineCode) => {
    const current = get().filters.declineCodes;
    const updated = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];
    get().setDeclineCodes(updated);
  },

  toggleDeclineType: (type: DeclineType) => {
    const current = get().filters.declineTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    get().setDeclineTypes(updated);
  },

  // ========================================================================
  // Reset
  // ========================================================================

  resetFilters: () => {
    set(state => ({
      filters: initialFilters,
      filteredTransactions: state.allTransactions,
    }));
  },
}));

// ============================================================================
// Selectors (for optimized component subscriptions)
// ============================================================================

/**
 * Hook to get only filtered transactions (avoids re-renders on filter changes)
 */
export const useFilteredTransactions = () =>
  useFilterStore(state => state.filteredTransactions);

/**
 * Hook to get current filter values
 */
export const useFilters = () =>
  useFilterStore(state => state.filters);

/**
 * Hook to get filter actions only
 */
export const useFilterActions = () =>
  useFilterStore(state => ({
    setDateRange: state.setDateRange,
    setCountries: state.setCountries,
    setPaymentMethods: state.setPaymentMethods,
    setProcessors: state.setProcessors,
    setDeclineCodes: state.setDeclineCodes,
    setDeclineTypes: state.setDeclineTypes,
    toggleCountry: state.toggleCountry,
    togglePaymentMethod: state.togglePaymentMethod,
    toggleProcessor: state.toggleProcessor,
    toggleDeclineCode: state.toggleDeclineCode,
    toggleDeclineType: state.toggleDeclineType,
    resetFilters: state.resetFilters,
  }));
