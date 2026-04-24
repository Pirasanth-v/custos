import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrganization } from "../api";

export function useDeleteOrg(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await deleteOrganization(orgId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}