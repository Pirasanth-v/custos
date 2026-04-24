import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccount } from "../api";
import type { UpdateAccountRequest } from "../types";

type UpdateAccountInput = { accountId: string; data: UpdateAccountRequest };

export function useUpdateAccount(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const { accountId, data } = input;
      return updateAccount(orgId, accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
    },
  });
}