import { useMutation } from "@tanstack/react-query";
import { acceptInvitation } from "../api";

export function useAcceptInvitation() {
    return useMutation({ 
        mutationFn: (orgId: string) => acceptInvitation(orgId)
    })
}