import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteMember } from "../api";
import type { InviteMemberRequest } from "../types";

export function useInviteMember(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InviteMemberRequest) => inviteMember(orgId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["org", orgId, "members"] });
        }
    });
}