import { useMutation } from "@tanstack/react-query";
import { declineInvitation } from "../api";

export function useDeclineInvitation() {
    return useMutation({
        mutationFn: (orgId: string) => declineInvitation(orgId)
    });
}