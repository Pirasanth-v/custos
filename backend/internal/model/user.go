package model

import (
	"time"
)

type User struct {
	Id            string     `json:"id"`
	FirstName     string     `json:"first_name"`
	LastName      string     `json:"last_name"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"` // hide password field in json
	CurrentStatus string     `json:"current_status"`
	AvatarUrl     *string    `json:"avatar_url"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `json:"deleted_at"`
}

type GoogleUser struct {
	GoogleID string
	UserID   string
	Email    string
	Name     string
	Picture  string
}
