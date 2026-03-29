import { useQuery } from "@tanstack/react-query";
import { getOrgByID } from "../api";
import type { Organization } from "../types";

export function useGetOrgByID(orgId: string) {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<Organization, Error>({
    queryKey: ["org", orgId],
    queryFn: () => getOrgByID(orgId),
    enabled: !!orgId,
  });

  return { data, loading, error };
}