import { useQuery } from "@tanstack/react-query";
import { getUserOrgs } from "../api";
import type { Organization } from "../types";

export function useGetUserOrgs() {
  return useQuery<Organization[], Error>({
    queryKey: ["orgs"],
    queryFn: getUserOrgs,
  });
}
