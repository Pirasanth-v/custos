package model

import (
	"time"
)

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"-"`           // Hide sensitive token hash from JSON
	ExpiresAt time.Time `json:"expires_at"`
	IsRevoked bool      `json:"is_revoked"`
	CreatedAt time.Time `json:"created_at"`
}

