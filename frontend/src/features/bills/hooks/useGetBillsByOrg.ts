import { useQuery } from "@tanstack/react-query";
import { getBillsByOrg } from "../api";
import type { Bill } from "../types";

export function useBills(orgId: string) {
  return useQuery<Bill[]>({
    queryKey: ["bills", orgId ],
    queryFn: async () => {
      const res = await getBillsByOrg(orgId);
      return res ?? [];
    },
    enabled: Boolean(orgId),
    staleTime: 0,
  });
}