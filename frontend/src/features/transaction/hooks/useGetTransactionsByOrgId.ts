import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactionsByOrgId } from "../api";
import type { PaginatedResponse, Transaction } from "../types";

export function useGetTransactionsByOrgId(
  orgId: string,
  limit: number,
) {
  return useInfiniteQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: ["org", orgId, "transactions", limit],
    enabled: !!orgId,
    initialPageParam: "",
    queryFn: async ({ pageParam }) => {
      return getTransactionsByOrgId(orgId, {
        cursor: String(pageParam ?? ""),
        limit,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.has_more) return undefined;
      return lastPage.next;
    },
  });
}

