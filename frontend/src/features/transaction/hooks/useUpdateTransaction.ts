import { useMutation } from "@tanstack/react-query";
import { updateTransaction } from "../api";
import type { UpdateTransactionRequest } from "../types";

export function useUpdateTransaction(orgId: string) {
  return useMutation<
    void,
    Error,
    { fromAccountId: string; tranId: string; data: UpdateTransactionRequest }
  >({
    mutationFn: async ({ fromAccountId, tranId, data }) => {
      return updateTransaction(orgId, fromAccountId, tranId, data);
    },
  });
}

