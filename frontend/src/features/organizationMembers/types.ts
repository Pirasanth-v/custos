export type Member = {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: string;
    role_name: string;
    status: string;
    joined_at: string | null;
}

export type InviteMemberRequest = {
    email: string;
    role_id: string;
}

export type updateMemberRoleRequest = {
    member_id: string;
    role_id: string;
};