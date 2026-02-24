import { StoreProvider } from '@/components/providers/StoreProvider';
import { DashboardLayout } from './components/DashboardLayout';

export default function DashboardPage() {
  return (
    <StoreProvider>
      <DashboardLayout />
    </StoreProvider>
  );
}
