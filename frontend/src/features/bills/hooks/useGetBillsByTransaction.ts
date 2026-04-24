import { useQuery } from "@tanstack/react-query";
import { getBillsByTransaction } from "../api";
import type { Bill } from "../types";

export function useBillsByTransaction(orgId: string, txId: string) {
  return useQuery<Bill[]>({
    queryKey: ["bills", orgId, txId],
    queryFn: async () => {
      if (!orgId || !txId) return [];
      const res = await getBillsByTransaction(orgId, txId);
      return res ?? [];
    },
    enabled: Boolean(orgId && txId),
    staleTime: 0,
  });
}