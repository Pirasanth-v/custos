package dto

import ( "time" )

type MemberResponse struct {
    UserID    string  `json:"user_id"`
    FirstName string  `json:"first_name"`
    LastName  string  `json:"last_name"`
    Email     string  `json:"email"`
    RoleID    string  `json:"role_id"`
    RoleName  string  `json:"role_name"`
    Status    string  `json:"status"`
    JoinedAt  *time.Time `json:"joined_at"`
}

type UpdateMemberRoleRequest struct {
    MemberID string `json:"member_id"`
    RoleID   string `json:"role_id"`
}

type InvitationResponse struct {
    OrgID     string    `json:"org_id"`
    OrgName   string    `json:"org_name"`
    RoleID    string    `json:"role_id"`
    RoleName  string    `json:"role_name"`
    InvitedAt time.Time `json:"invited_at"`
    InvitedBy string    `json:"invited_by"`
}

type InviteMemberRequest struct {
    Email     string `json:"email"`
    RoleID    string `json:"role_id"`
}