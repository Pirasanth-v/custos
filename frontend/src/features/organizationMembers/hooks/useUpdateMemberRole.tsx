import { updateMemberRole } from "../api";
import type { updateMemberRoleRequest } from "../types";
import { useMutation } from "@tanstack/react-query";

export function useUpdateMemberRole(orgId: string, memberId: string) {
    return useMutation ({
        mutationFn: (data: updateMemberRoleRequest) => updateMemberRole(orgId, memberId, data)
    })
}