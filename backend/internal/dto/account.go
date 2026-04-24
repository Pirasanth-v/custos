package dto

import (
	"time"

	"github.com/pirasanth-v/custos/internal/model"
)

type CreateAccountRequest struct {
	Name           string   		   `json:"name"`            
	Type           model.AccountType   `json:"type"`           
	CurrencyID     string   		   `json:"currency_id"`     
	InitialBalance string     		   `json:"initial_balance"` 
	Description    *string  		   `json:"description"`     
}

type AccountResponse struct {
	ID             string              `json:"id"`
	Name           string              `json:"name"`
	Type           model.AccountType   `json:"type"`
	CurrencyID	   string			   `json:"currency_id"`
	CurrencyCode   string			   `json:"currency_code"`
	CurrencyName   string              `json:"currency_name"`
	CurrencySymbol string			   `json:"currency_symbol"`
	InitialBalance string              `json:"initial_balance"`
	NetBalance     string              `json:"net_balance"`
	Description    *string             `json:"description"`
	CreatedBy      string              `json:"created_by"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}


type UpdateAccountRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}