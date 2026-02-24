'use client';

import { useFilterActions, useFilters } from '@/store/filterStore';
import type { Country, PaymentMethod } from '@/lib/types';

/**
 * Filter panel component that provides filtering controls for the dashboard.
 * Contains country, payment method filters, and a reset button.
 */
export function FilterPanel() {
  const filters = useFilters();
  const { toggleCountry, togglePaymentMethod, resetFilters } = useFilterActions();

  const countries: Country[] = ['Mexico', 'Colombia', 'Brazil'];
  const paymentMethods: PaymentMethod[] = ['credit_card', 'debit_card', 'pse', 'pix', 'boleto'];

  const hasActiveFilters =
    filters.countries.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.processors.length > 0 ||
    filters.declineTypes.length > 0;

  const formatPaymentMethod = (method: PaymentMethod): string => {
    return method.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Country Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries
            </label>
            <div className="flex flex-wrap gap-2">
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filters.countries.includes(country)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Methods
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method}
                  onClick={() => togglePaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filters.paymentMethods.includes(method)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatPaymentMethod(method)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              hasActiveFilters
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Active filters: {filters.countries.length + filters.paymentMethods.length}
          </p>
        </div>
      )}
    </div>
  );
}
