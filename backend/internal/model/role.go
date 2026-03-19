package model

// Permission constants — single source of truth
const (
    PermAll                = "all"
    PermDeleteOrg          = "delete_org"
    PermManageMembers      = "manage_members"
    PermManageAccounts     = "manage_accounts"
    PermCreateTransaction  = "create_transactions"
    PermEditTransaction    = "edit_transactions"
    PermDeleteTransaction  = "delete_transactions"
	PermApproveTransaction = "approve_transactions"
)

const (
    RoleOwnerID      = "11111111-1111-1111-1111-111111111111"
    RoleAdminID      = "22222222-2222-2222-2222-222222222222"
    RoleMemberID = "33333333-3333-3333-3333-333333333333"
    RoleViewerID     = "44444444-4444-4444-4444-444444444444"
)

type Role struct {
    ID           string
    Name         string
    Permissions  []string // parsed from JSONB
}

// HasPermission checks if role has a specific permission
func (r *Role) HasPermission(perm string) bool {
    for _, p := range r.Permissions {
        if p == PermAll || p == perm {
            return true
        }
    }
    return false
}


