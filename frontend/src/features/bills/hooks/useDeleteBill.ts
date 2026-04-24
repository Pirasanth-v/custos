import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBill } from "../api";

export function useDeleteBill(orgId: string, txId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (billId: string) => deleteBill(orgId, txId, billId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills", orgId, txId] });
      qc.invalidateQueries({ queryKey: ["bills", orgId] });
    },
  });
}