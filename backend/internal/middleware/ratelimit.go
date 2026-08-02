package middleware

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/pirasanth-v/custos/pkg/ratelimit" 
)

// RateLimit returns a Chi-compatible middleware for the given store.
func RateLimit(store *ratelimit.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := ratelimit.GetIP(r)

			if !store.Allow(ip) {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "60")
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(store.Burst()))
				w.WriteHeader(http.StatusTooManyRequests)
				if err := json.NewEncoder(w).Encode(map[string]string{
					"error": "too many requests, please slow down",
				}); err != nil {
					http.Error(w, "failed to encode error response", http.StatusInternalServerError)
				}
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}