import { useMutation } from "@tanstack/react-query";
import { confirmUploads } from "../api";
import type { ConfirmBillInput } from "../types";

interface UseConfirmUploadsInput {
  txId: string;
  bills: ConfirmBillInput[];
}

export const useConfirmUploads = (orgId: string) => {
  return useMutation({
    mutationFn: ({ txId, bills }: UseConfirmUploadsInput) =>
      confirmUploads(orgId, txId, bills),
  });
};