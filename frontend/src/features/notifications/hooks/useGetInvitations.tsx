import { useQuery } from "@tanstack/react-query";
import { getInvitations } from "../api";
import type { GetInvitationsResult, InvitationResponse } from "../types";

export function useGetInvitations(): GetInvitationsResult {
    const { data, isLoading, error, refetch } = useQuery<InvitationResponse[], Error>({
        queryKey: ["invitations"],
        queryFn: getInvitations,
    });

    return { data, loading: isLoading, error, refetch };
}