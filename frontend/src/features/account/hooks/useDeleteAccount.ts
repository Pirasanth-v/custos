import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "../api";

export function useDeleteAccount(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (accountId: string) => deleteAccount(orgId, accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
        }
    })
}