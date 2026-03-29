import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api";
import type { Member } from "../types";

export function useGetMembers(orgId: string) {
    const {
        data,
        isLoading: loading,
        error,
    } = useQuery<Member[], Error>({
        queryKey: ["org", orgId],
        queryFn: () => getMembers(orgId),
        enabled: Boolean(orgId),
    });

    return { data, loading, error };
}