'use client';

import { FilterPanel } from './filters/FilterPanel';
import { SummaryCardsGrid } from './summary/SummaryCardsGrid';
import { DeclineAnalysisTable } from './tables/DeclineAnalysisTable';
import {
  DeclineImpactBarChart,
  DeclineTrendLineChart,
  PaymentMethodBreakdownChart,
  CountryComparisonChart,
} from './charts';

/**
 * Main dashboard layout component that integrates all sections:
 * - Filter panel
 * - Summary cards
 * - Decline analysis table
 * - Visualization charts
 */
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Decline analysis and revenue impact insights
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Filter Panel */}
          <FilterPanel />

          {/* Summary Cards */}
          <SummaryCardsGrid />

          {/* Decline Analysis Table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Decline Code Analysis
            </h2>
            <DeclineAnalysisTable />
          </div>

          {/* Charts Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Visualizations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeclineImpactBarChart />
              <CountryComparisonChart />
              <DeclineTrendLineChart />
              <PaymentMethodBreakdownChart />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-600 text-center">
            Payment Analytics Dashboard - Yuno Engineering Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
