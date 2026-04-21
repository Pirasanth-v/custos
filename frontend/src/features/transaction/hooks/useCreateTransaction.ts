import { useMutation } from "@tanstack/react-query";
import { createTransaction } from "../api";
import type { CreateTransactionRequest } from "../types";

export function useCreateTransaction(orgId: string) {
  return useMutation<
    { id: string }, // mutation returns the object from createTransaction
    Error,
    { fromAccountId: string; data: CreateTransactionRequest }
  >({
    mutationFn: async ({ fromAccountId, data }) => {
      return createTransaction(orgId, fromAccountId, data);
    },
  });
}

