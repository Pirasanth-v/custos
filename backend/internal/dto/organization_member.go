package dto

type MemberResponse struct {
    UserID    string  `json:"user_id"`
    FirstName string  `json:"first_name"`
    LastName  string  `json:"last_name"`
    Email     string  `json:"email"`
    RoleID    string  `json:"role_id"`
    RoleName  string  `json:"role_name"`
    Status    string  `json:"status"`
    JoinedAt  *string `json:"joined_at"`
}

type InvitationResponse struct {
    OrgID     string `json:"org_id"`
    OrgName   string `json:"org_name"`
    RoleID    string `json:"role_id"`
    RoleName  string `json:"role_name"`
    InvitedAt string `json:"invited_at"`
    InvitedBy string `json:"invited_by"`
}

type InviteMemberRequest struct {
    Email     string `json:"email"`
    RoleID    string `json:"role_id"`
}