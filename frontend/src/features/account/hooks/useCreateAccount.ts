import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAccount } from "../types";
import { createAccount } from "../api";

export function useCreateAccount(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAccount) => createAccount(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["org", orgId, "accounts"] });
        }
    })
}