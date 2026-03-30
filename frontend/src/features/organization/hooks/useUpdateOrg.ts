import { updateOrganization } from "../api";
import type { updateOrganizationRequest } from "../types";
import { useMutation } from "@tanstack/react-query";

export function useUpdateOrg(orgId: string) {
  return useMutation({
    mutationFn: (data: updateOrganizationRequest) => updateOrganization(orgId, data)
  });
}