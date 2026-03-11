package dto

import (
    "time"
)

type UserResponse struct {
    ID        string `json:"id"`
    FirstName      string `json:"first_name"`
    LastName      string `json:"last_name"`
    Email     string `json:"email"`
    Status    string `json:"status"`
    AvatarURL *string `json:"avatar_url"`
    CreatedAt time.Time `json:"created_at"`
}