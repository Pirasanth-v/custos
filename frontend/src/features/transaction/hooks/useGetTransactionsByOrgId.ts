import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactionsByOrgId } from "../api";
import type { PaginatedResponse, Transaction, TransactionFilters } from "../types";

export function useGetTransactionsByOrgId(
  orgId: string,
  limit: number,
  filters: TransactionFilters = {},
) {
  return useInfiniteQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: ["org", orgId, "transactions", limit, filters],
    enabled: !!orgId,
    initialPageParam: "",
    queryFn: async ({ pageParam }) => {
      return getTransactionsByOrgId(orgId, {
        cursor: String(pageParam ?? ""),
        limit,
        ...filters,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.has_more) return undefined;
      return lastPage.next;
    },
  });
}

