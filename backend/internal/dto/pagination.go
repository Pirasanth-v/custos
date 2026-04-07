package dto

import (
	"encoding/base64"
	"encoding/json"
	"time"
	"errors"
    "fmt"
)

// PaginationParams defines params for cursor-based pagination.
type PaginationParams struct {
	Cursor string `json:"cursor"`
	Limit  int    `json:"limit"`
}

// PaginatedResponse represents a generic paginated collection with meta.
type PaginatedResponse[T any] struct {
	Data    []T   `json:"data"`
	Next    string `json:"next"` // Cursor for next page
	HasMore bool   `json:"has_more"`
}

// cursorPayload contains fields encoded in the cursor.
type cursorPayload struct {
	ID        string    `json:"id"`
	CreatedAt int64 `json:"created_at"`	// unix microseconds
}

// EncodeCursor encodes an id and timestamp into a base64 JSON cursor.
func EncodeCursor(id string, createdAt time.Time) (string, error) {
    if id == "" {
        return "", errors.New("id cannot be empty")
    }
    payload := cursorPayload{
        ID:        id,
        CreatedAt: createdAt.UTC().UnixMicro(),
    }
    jsonBytes, err := json.Marshal(payload)
    if err != nil {
        return "", fmt.Errorf("marshal cursor: %w", err)
    }
    return base64.RawURLEncoding.EncodeToString(jsonBytes), nil
}

// DecodeCursor decodes the base64-encoded cursor and returns the id and timestamp.
func DecodeCursor(cursor string) (id string, createdAt time.Time, err error) {
    if cursor == "" {
        return "", time.Time{}, errors.New("cursor is empty")
    }
    data, err := base64.RawURLEncoding.DecodeString(cursor)
    if err != nil {
        return "", time.Time{}, fmt.Errorf("invalid cursor: %w", err)
    }
    var payload cursorPayload
    if err := json.Unmarshal(data, &payload); err != nil {
        return "", time.Time{}, fmt.Errorf("invalid cursor: %w", err)
    }
    if payload.ID == "" {
        return "", time.Time{}, errors.New("cursor missing id")
    }
    if payload.CreatedAt == 0 {
        return "", time.Time{}, errors.New("cursor missing timestamp")
    }
    return payload.ID, time.UnixMicro(payload.CreatedAt).UTC(), nil
}