package handler

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/service"
	response "github.com/pirasanth-v/custos/pkg"
)

type AuthGoogleHandler struct {
	authService *service.AuthService
	cfg         config.SecurityConfig
	cfgApp      config.AppConfig
	cfgGoogle   config.GoogleAuthConfig
}

func NewAuthGoogleHandler(authService *service.AuthService, cfg config.SecurityConfig, cfgApp config.AppConfig, cfgGoogle config.GoogleAuthConfig) *AuthGoogleHandler {
	return &AuthGoogleHandler{
		authService: authService,
		cfg:         cfg,
		cfgApp:      cfgApp,
		cfgGoogle:   cfgGoogle,
	}
}

// GoogleSignIn authenticates/links a user using an ID token from Google.
func (h *AuthGoogleHandler) GoogleSignIn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		IDToken string `json:"id_token"`
	}

	if !response.Decode(w, r, &body) {
		return
	}
	if body.IDToken == "" {
		response.Error(w, http.StatusBadRequest, "id_token required")
		return
	}

	// 1. Verify token with Google.
	gUser, err := service.VerifyGoogleToken(r.Context(), body.IDToken, h.cfgGoogle.ClientID)
	if err != nil {
		slog.Warn("invalid google token", "error", err)
		response.Error(w, http.StatusUnauthorized, "invalid google token")
		return
	}

	// 2. Find or create/Link user
	token, err := h.authService.LoginWithGoogle(r.Context(), gUser)
	if err != nil {
		switch err.Error() {
		case "user not found":
			response.Error(w, http.StatusUnauthorized, "user not found")
		case "invalid google user":
			response.Error(w, http.StatusUnauthorized, "invalid google user")
		case "invalid google token":
			response.Error(w, http.StatusUnauthorized, "invalid google token")
		default:
			slog.Error("failed to login with google", "error", err)
			response.Error(w, http.StatusInternalServerError, "failed to login with google")
		}
		return
	}

	isProd := h.cfgApp.Env == "production"
	// 3. Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		HttpOnly: true,   // JS cannot access it - XSS protection
		Secure:   isProd, // HTTPs only
		Expires:  time.Now().Add(time.Duration(h.cfg.SessionExpiryHours) * time.Hour),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	response.JSON(w, http.StatusOK, map[string]string{"message": "ok"})
}
