import { useQuery } from "@tanstack/react-query";
import { getAccountById } from "../api";
import type { Account } from "../types";

export function useGetAccountById(orgId: string, accId: string) {
  return useQuery<Account, Error>({
    queryKey: ["org", orgId, "account", accId],
    queryFn: () => getAccountById(orgId, accId),
    enabled: Boolean(orgId) && Boolean(accId),
  });
}