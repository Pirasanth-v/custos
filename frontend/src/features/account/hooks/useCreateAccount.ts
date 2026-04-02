import { useMutation } from "@tanstack/react-query";
import type { CreateAccount } from "../types";
import { createAccount } from "../api";

export function useCreateAccount(orgId: string) {
    return useMutation({
        mutationFn: (data: CreateAccount) => createAccount(orgId, data)

    })
}