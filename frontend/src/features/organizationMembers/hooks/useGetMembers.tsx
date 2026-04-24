import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api";
import type { Member } from "../types";

export function useGetMembers(orgId: string) {
  return useQuery<Member[], Error>({
    queryKey: ["org", orgId, "members"],
    queryFn: () => getMembers(orgId),
    enabled: Boolean(orgId),
  });
}