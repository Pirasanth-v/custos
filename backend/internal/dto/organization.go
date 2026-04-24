package dto

import (
	"time"
)

type CreateOrganizationRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Address string `json:"address"`
}

type OrganizationResponse struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Address    *string    `json:"address"`
	CreatedBy  string     `json:"created_by"`
	IsPersonal bool	      `json:"is_personal"`
	CreatedAt  time.Time  `json:"created_at"`
}

type UpdateOrgReq struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Address string `json:"address"`
}
