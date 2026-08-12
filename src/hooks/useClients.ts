import { useDashboard } from '../context/DashboardContext';

/** Thin alias over DashboardContext for client-focused screens. */
export function useClients() {
  return useDashboard();
}
