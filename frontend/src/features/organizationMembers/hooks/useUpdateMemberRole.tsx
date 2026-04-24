import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberRole } from "../api";
import type { updateMemberRoleRequest } from "../types";

export function useUpdateMemberRole(orgId: string, memberId: string) {
    const queryClient = useQueryClient();
    return useMutation ({
        mutationFn: (data: updateMemberRoleRequest) => updateMemberRole(orgId, memberId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["org", orgId, "members"] });
        }
    })
}