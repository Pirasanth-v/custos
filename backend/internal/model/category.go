package model

import "time"

type Category struct {
	ID        string     `json:"id"`
	OrgID	  string     `json:"org_id"`
	Name      string     `json:"name"`
	CreatedBy string     `json:"created_by"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt *time.Time  `json:"deleted_at,omitempty"`
}