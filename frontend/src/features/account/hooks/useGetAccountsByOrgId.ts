import { useQuery } from "@tanstack/react-query";
import { getAccountsByOrgId } from "../api";
import type { Account } from "../types";

export function useGetAccountsByOrgId(orgId: string) {
  const { data, isLoading: loading, error } = useQuery<Account[], Error>({
    queryKey: ["org", orgId, "accounts"],
    queryFn: () => getAccountsByOrgId(orgId),
    enabled: !!orgId,
  });
  return { data, loading, error };
}