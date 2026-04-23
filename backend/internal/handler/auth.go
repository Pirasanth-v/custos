package handler

import (
	"net/http"
	"log/slog"
	"encoding/json"
	"time"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/middleware"
)

type AuthHandler struct {
	authService *service.AuthService
	cfg config.SecurityConfig
}

func NewAuthHandler(authService *service.AuthService, cfg config.SecurityConfig) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		cfg: cfg,
	}
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
			return
		default:
			slog.Error("register failed", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			if err := json.NewEncoder(w).Encode(map[string]string{
				"error": "internal server error",
			}); err != nil {
				slog.Error("Failed to write error response", "error", err)
			}
			return
		}
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

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest

	// handle request
	err := json.NewDecoder(r.Body).Decode(&req) 					// 1. decode request body into dto
	if err != nil {
		w.Header().Set("content-type", "application/json") 			// 2. set header
		w.WriteHeader(http.StatusBadRequest)               			// 3. write header

		if err := json.NewEncoder(w).Encode( 						// 4. encode body to send 
			map[string]string{
				"error": "invalid request body",
			},
		); err != nil {
			slog.Error("failed to write response", "error", err)
		}

		return
	}

	// call service
	token, err := h.authService.Login(r.Context(), &req) 
	if err != nil { 
		switch err.Error() {
		case "invalid email", "invalid password":
			w.Header().Set("content-type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)

			err := json.NewEncoder(w).Encode(
				map[string]string{
					"error": "invalid credentials",
				},
			)
			if err != nil {
				slog.Error("failed to write response", "error", err)
			}
			return

		default:
			slog.Error("login failed", "error", err)
			w.Header().Set("content-type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			if err := json.NewEncoder(w).Encode(map[string]string{
				"error": "internal server error",
			}); err != nil {
				slog.Error("Failed to write error response", "error", err)
			}
			return
		}
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		HttpOnly: true, // JS cannot access it - XSS protection
		Secure:   true, // HTTPs only
		Expires:  time.Now().Add(time.Duration(h.cfg.SessionExpiryHours) * time.Hour),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	// success response
	w.Header().Set("content-type", "application/json") 
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(map[string]string{
		"message": "login success",
	}); err != nil {
		slog.Error("failed to write error response", "error", err)
	}

}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("session_token")
	if err != nil {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		if err := json.NewEncoder(w).Encode(
			map[string]string{
				"error" : "unauthorized",
			},
		); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	// call service
	token := cookie.Value

	if err := h.authService.Logout(r.Context(), token); err != nil {
		slog.Error("logout failed", "error", err)
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		if err := json.NewEncoder(w).Encode(
			map[string]string{
				"error" : "internal server error",
			},
		); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	// clear the cookie
	http.SetCookie(w, &http.Cookie {
		Name:     "session_token",
        Value:    "",
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteLaxMode,
        Path:     "/",
        MaxAge:   -1, // tells browser to delete the cookie immediately
	})

	// success response
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(
		map[string]string{
			"message" : "logged out successfully",
		},
	); err != nil {
		slog.Error("failed to write response", "error", err)
	}
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	// get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Error("failed to read a value from cookie")
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		if err := json.NewEncoder(w).Encode(map[string]string{"error" : "unauthorized"}); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	// get user details
	userResponse, err := h.authService.Me(r.Context(), userID)
	if err != nil {
		slog.Error("get user by id failed", "error", err)
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		if err := json.NewEncoder(w).Encode(map[string]string{"error" : "internal server error"}); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	// success response
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(userResponse); err != nil {
		slog.Error("failed to write response", "error", err)
	}
}
