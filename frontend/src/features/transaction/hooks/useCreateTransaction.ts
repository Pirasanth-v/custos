import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "../api";
import type { CreateTransactionRequest } from "../types";

export function useCreateTransaction(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string }, // mutation returns the object from createTransaction
    Error,
    { fromAccountId: string; data: CreateTransactionRequest }
  >({
    mutationFn: async ({ fromAccountId, data }) => {
      return createTransaction(orgId, fromAccountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
    },
  });
}

