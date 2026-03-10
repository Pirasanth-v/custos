package handler

import (
	"net/http"
	"log/slog"
	"encoding/json"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// 1. Decode request body into dto
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		if err := json.NewEncoder(w).Encode(map[string]string{
			"error" : "invalid request body",
		}); err != nil {
			slog.Error("failed to write error response", "error", err)
		}

		return
	}	

	// 2. Call service
	if err := h.authService.Register(r.Context(), &req); err != nil {
		w.Header().Set("Content-Type", "application/json")

		switch err.Error() {
		case "email already used":
			w.WriteHeader(http.StatusConflict)
			if err := json.NewEncoder(w).Encode(map[string]string{
				"error": "email already in use",
			}); err != nil {
				slog.Error("Failed to write error response", "error", err)
			}
		default:
			slog.Error("register failed", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			if err := json.NewEncoder(w).Encode(map[string]string{
				"error": "internal server error",
			}); err != nil {
				slog.Error("Failed to write error response", "error", err)
			}
		}
		return
	}

	// 3. Success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err:= json.NewEncoder(w).Encode(map[string]string{
		"message": "user registered successfully",
	}); err !=nil {
		slog.Error("Failed to write error response", "error", err)
	}
}