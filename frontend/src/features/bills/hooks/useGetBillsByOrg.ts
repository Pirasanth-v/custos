import { useQuery } from "@tanstack/react-query";
import { getBillsByOrg } from "../api";
import type { Bill } from "../types";

export function useBills(orgId: string) {
  return useQuery<Bill[]>({
    queryKey: ["bills", orgId ],
    queryFn: async () => {
      const res = await getBillsByOrg(orgId);
      return res.data ?? [];
    },
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}