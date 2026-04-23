import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api";
import type { DashboardResponse } from "../types";
 
export function useDashboard(orgId: string, months = 6) {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard", orgId, months],
    queryFn: () => getDashboard(orgId, months),
    enabled: Boolean(orgId),
    staleTime: 2 * 60 * 1000,      // 2 min — don't refetch unless stale
    refetchOnWindowFocus: false,
  });
}