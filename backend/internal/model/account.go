package model

import (
	"time"
)

type AccountType string

const (
	AccountTypeBank   AccountType = "bank"
	AccountTypeCash   AccountType = "cash"
	AccountTypeCredit AccountType = "credit"
	AccountTypeWallet AccountType = "wallet"
	AccountTypeOther  AccountType = "other"
)

type Account struct {
	ID             string      `json:"id"`
	Name           string      `json:"name"`
	Type           AccountType `json:"type"`
	CurrencyID     string      `json:"currency_id"`
	InitialBalance string     `json:"initial_balance"`
	NetBalance     string     `json:"net_balance"`
	Description    *string     `json:"description,omitempty"`
	CreatedBy      string      `json:"created_by"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
	DeletedAt      *time.Time  `json:"deleted_at"`
}
