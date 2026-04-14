package model

type Category struct {
	ID        string     `json:"id"`
	OrgID	  string     `json:"org_id"`
	Name      string     `json:"name"`
	CreatedBy string     `json:"created_by"`
	CreatedAt string     `json:"created_at"`
	UpdatedAt string     `json:"updated_at"`
	DeletedAt *string    `json:"deleted_at,omitempty"`
}