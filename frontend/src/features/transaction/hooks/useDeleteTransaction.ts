import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../api";

export function useDeleteTransaction(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { fromAccountId: string; tranId: string }
  >({
    mutationFn: async ({ fromAccountId, tranId }) => {
      return deleteTransaction(orgId, fromAccountId, tranId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
    },
  });
}

