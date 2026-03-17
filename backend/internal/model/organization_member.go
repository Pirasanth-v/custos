package model

import ( "time" )

type OrganizationMember struct {
	OrgID     string     `json:"org_id"`
	UserID    string     `json:"user_id"`
	RoleID    string     `json:"role_id"`
	AddedBy   *string    `json:"added_by"`    // May be null if system-added
	Status    string     `json:"status"`      // 'active', 'invited', or 'removed'
	JoinedAt  *time.Time `json:"joined_at"`   // when invitation was accepted
	CreatedAt time.Time  `json:"created_at"`
}