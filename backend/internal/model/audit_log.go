package model

import (
	"time"
)

type ActionType string
type EntityType string

const (
	ActionTypeCreate   ActionType = "CREATE"
	ActionTypeUpdate   ActionType = "UPDATE"
	ActionTypeDelete   ActionType = "DELETE"
	ActionTypeApproved ActionType = "APPROVED"
	ActionTypeRejected ActionType = "REJECTED"
)

const (
	EntityTypeAccount    EntityType = "ACCOUNT"
	EntityTypeTransaction EntityType = "TRANSACTION"
	EntityTypeOrganization EntityType = "ORGANIZATION"
)

type AuditLog struct {
	ID           string      `json:"id"`
	OrgID        string      `json:"org_id"`
	ActionDoneBy string      `json:"action_done_by"`
	Action       ActionType  `json:"action"`
	Entity       EntityType  `json:"entity_type"`
	EntityID     string      `json:"entity_id"`
	BeforeState  []byte      `json:"before_state"` // JSONB: marshal struct to JSON
	AfterState   []byte      `json:"after_state"`  // JSONB: marshal struct to JSON
	Context      []byte      `json:"context"`      // JSONB: additional info, e.g., approval_id
	CreatedAt    time.Time   `json:"created_at"`
}