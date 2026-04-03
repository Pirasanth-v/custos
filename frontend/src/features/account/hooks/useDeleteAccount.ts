import { useMutation } from "@tanstack/react-query";
import { deleteAccount } from "../api";

export function useDeleteAccount(orgId: string) {
    return useMutation({
        mutationFn: (accountId: string) => deleteAccount(orgId, accountId)
    })
}