import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMember } from "../api";

type RemoveMemberPayload = {
  orgId: string;
  userId: string;
};

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: RemoveMemberPayload) =>
      removeMember(orgId, userId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["members", variables.orgId],
      });
    },
  });
}