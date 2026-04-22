package dto

import (
	"github.com/pirasanth-v/custos/internal/model"
)


type TransactionSummary struct {
	ID             string                  `json:"id"`
	Type           model.TransactionType   `json:"type"`
	Amount         string                  `json:"amount"`
	Description    *string                 `json:"description,omitempty"`
	TransactionDate string                 `json:"transaction_date"`
	Status         model.TransactionStatus `json:"status"`
}

type MonthlySummary struct {
	Month         string `json:"month"`
	TotalIncome   string `json:"total_income"`
	TotalExpense  string `json:"total_expense"`
}

type CategoryBreakdown struct {
	CategoryName string `json:"category_name"`
	Total        string `json:"total"`
}

type DashboardResponse struct {
	NetBalance     string               `json:"net_balance"`
	PendingCount   int                  `json:"pending_count"`
	Monthly        []MonthlySummary     `json:"monthly"`
	Categories     []CategoryBreakdown  `json:"categories"`
	Recent         []TransactionSummary `json:"recent"`
}