import { inviteMember } from "../api";
import type { InviteMemberRequest } from "../types";
import { useMutation } from "@tanstack/react-query";

export function useInviteMember(orgId: string) {
    return useMutation({
        mutationFn: (data: InviteMemberRequest) => inviteMember(orgId, data)
    });
}