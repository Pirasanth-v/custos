package middleware

import (
	"net/http"
	"encoding/hex"
	"encoding/json"
	"context" 
	"crypto/sha256"
	"log/slog"

	"github.com/pirasanth-v/custos/internal/repository"
)

type AuthMiddleware struct {
	sessionRepo *repository.SessionRepository
}

type contextKey string

const UserIDKey contextKey = "user_id"
const SessionIDKey contextKey = "session_key"

func NewAuthMiddleware(sessionRepo *repository.SessionRepository) *AuthMiddleware {
	return &AuthMiddleware{sessionRepo: sessionRepo}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc( func(w http.ResponseWriter, r *http.Request) {
		// 1. Read cookie
		cookie, err := r.Cookie("session_token")
		if err != nil {
			writeUnauthorized(w)
			return
		}

		// 2. Hash the token
		hash := sha256.Sum256([]byte(cookie.Value))
		tokenHash := hex.EncodeToString(hash[:])

		// 3. Validate session in db
		session, err := m.sessionRepo.GetSessionByTokenHash(r.Context(), tokenHash)
		if err != nil {
			writeUnauthorized(w)
			return
		}

		// 4. Attach to context
		ctx := context.WithValue(r.Context(), UserIDKey, session.UserID)
		ctx = context.WithValue(ctx, SessionIDKey, session.ID)

		// 5. Continue to handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func writeUnauthorized(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	if err := json.NewEncoder(w).Encode(
		map[string]string{
			"error": "unauthorized",
		},
	); err != nil {
		slog.Error("failed to write response", "error", err)
	}
}