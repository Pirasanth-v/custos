import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api";
import type { BillsStats } from "../types";

export function useBillStats(orgId: string) {
  return useQuery<BillsStats>({
    queryKey: ["bills-stats", orgId],
    queryFn: async () => getStats(orgId),
    enabled: Boolean(orgId),
    staleTime: 30_000, 
  });
}