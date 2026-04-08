import { useMutation } from "@tanstack/react-query";
import { deleteTransaction } from "../api";

export function useDeleteTransaction(orgId: string) {
  return useMutation<
    void,
    Error,
    { fromAccountId: string; tranId: string }
  >({
    mutationFn: async ({ fromAccountId, tranId }) => {
      return deleteTransaction(orgId, fromAccountId, tranId);
    },
  });
}

