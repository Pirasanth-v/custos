package model

import (
	"time"
)

type TransactionType string
type TransactionStatus string

const (
	TransactionTypeIncome   TransactionType = "income"
	TransactionTypeExpense  TransactionType = "expense"
	TransactionTypeTransfer TransactionType = "transfer"
)

const (
	TransactionStatusPosted    TransactionStatus = "posted"
	TransactionStatusDeleted   TransactionStatus = "deleted"
	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCancelled TransactionStatus = "cancelled"
)

type Transaction struct {
	ID            string            `json:"id"`
	OrgID         string            `json:"org_id"`
	FromAccountID string            `json:"from_account_id"`
	ToAccountID   *string           `json:"to_account_id"`
	CreatedBy     string            `json:"created_by"`
	CreatedByName  *string          `json:"created_by_name"`
	UpdatedBy      *string          `json:"updated_by"`
	UpdatedByName  *string          `json:"updated_by_name"`
	DeletedBy     *string           `json:"deleted_by,omitempty"`
	Type          TransactionType   `json:"type"`
	Amount        string            `json:"amount"`
	Description   *string           `json:"description,omitempty"`
	CategoryID    *string           `json:"category_id,omitempty"`
	Version       int               `json:"version"`
	Status        TransactionStatus `json:"status"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	DeletedAt     *time.Time        `json:"deleted_at,omitempty"`
}