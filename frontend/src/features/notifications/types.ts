export type InvitationResponse = {
    org_id: string;
    org_name: string;
    role_id: string;
    role_name: string;
    invited_at: string;
    invited_by: string;
};

export type GetInvitationsResult = {
    data: InvitationResponse[] | undefined;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
};