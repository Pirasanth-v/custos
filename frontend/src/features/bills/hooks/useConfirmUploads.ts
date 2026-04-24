import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmUploads } from "../api";
import type { ConfirmBillInput } from "../types";

interface UseConfirmUploadsInput {
  txId: string;
  bills: ConfirmBillInput[];
}

export const useConfirmUploads = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ txId, bills }: UseConfirmUploadsInput) =>
      confirmUploads(orgId, txId, bills),
    onSuccess: (_, { txId }) => {
      queryClient.invalidateQueries({ queryKey: ["bills", orgId, txId] });
      queryClient.invalidateQueries({ queryKey: ["bills", orgId] });
    },
  });
};