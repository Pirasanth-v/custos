import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransaction } from "../api";
import type { UpdateTransactionRequest } from "../types";

export function useUpdateTransaction(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { fromAccountId: string; tranId: string; data: UpdateTransactionRequest }
  >({
    mutationFn: async ({ fromAccountId, tranId, data }) => {
      return updateTransaction(orgId, fromAccountId, tranId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
    },
  });
}

