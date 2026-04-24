package dto

import "github.com/pirasanth-v/custos/internal/model"

type CreateTransactionRequest struct {
	Type        model.TransactionType  `json:"type"`
	Amount      string  `json:"amount"`
	Description *string `json:"description"`
	CategoryID  string  `json:"category_id"`
	ToAccountID *string `json:"to_account_id"`
}

type UpdateTransactionRequest struct {
	FromAccountID *string               `json:"from_account_id"`
	ToAccountID   *string               `json:"to_account_id"`
	Type          *model.TransactionType`json:"type"`
	Amount        *string               `json:"amount"`
	Description   *string               `json:"description"`
	CategoryID    *string               `json:"category_id"`
	Version       int                   `json:"version"`
}

type UpdateNetBalanceBody struct {
	FromAccountID string                 `json:"from_account_id"`
	ToAccountID   *string                `json:"to_account_id"`
	Type          model.TransactionType  `json:"type"`
	Amount        string                 `json:"amount"`
}

type TransactionFilters struct {
	Search     string   `json:"search"`
	Type       string   `json:"type"`
	AccountIDs []string `json:"account_ids"` 
	CategoryIDs []string `json:"category_ids"`
	SortKey    string   `json:"sort_key"`  // "date", "amount"
	SortDir    string   `json:"sort_dir"`  // "asc", "desc"
}
