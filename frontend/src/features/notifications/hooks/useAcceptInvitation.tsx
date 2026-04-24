import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptInvitation } from "../api";

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => acceptInvitation(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}