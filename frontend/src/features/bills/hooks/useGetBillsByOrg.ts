import { useQuery } from "@tanstack/react-query";
import { getBillsByOrg } from "../api";
import type { Bill, GetOrgBillsParams, PaginatedResponse } from "../types";

export function useBills(orgId: string, params?: GetOrgBillsParams) {
  return useQuery<PaginatedResponse<Bill>>({
    queryKey: ["bills", orgId, params],
    queryFn: async () => {
      return await getBillsByOrg(orgId, params);
    },
    enabled: Boolean(orgId),
    staleTime: 0,
  });
}