import { useQuery } from "@tanstack/react-query";
import { getCategoriesByOrgId } from "../api";
import type { Category } from "../types";

export function useGetCategoriesByOrgId(orgId: string) {
  const { data, isLoading: loading, error } = useQuery<Category[], Error>({
    queryKey: ["org", orgId, "categories"],
    queryFn: () => getCategoriesByOrgId(orgId),
    enabled: !!orgId,
  });

  return { data, loading, error };
}

