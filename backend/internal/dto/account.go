package dto

type UpdateAccountRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}