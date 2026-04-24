import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrganization } from "../api";
import type { updateOrganizationRequest } from "../types";

export function useUpdateOrg(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: updateOrganizationRequest) =>
      updateOrganization(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}