package server

import (
	"net/http"
	"log/slog"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/pirasanth-v/custos/internal/handler"
	m "github.com/pirasanth-v/custos/internal/middleware"
	"github.com/go-chi/cors"

)

func New(AuthMiddleware *m.AuthMiddleware, authHandler *handler.AuthHandler) http.Handler {
	r := chi.NewRouter()

	// runs in every request
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,  // ← critical for cookies
		MaxAge:           300,
	}))

	// routes
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte(`{"status" : "ok"}`))
		if err != nil {
			slog.Error("failed to write response", "error", err)
		}
		
	})

	r.Route("/api/v1", func(r chi.Router) {
		// public routes, no auth needed
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		// protected routes
		r.Group(func(r chi.Router) {
			r.Use(AuthMiddleware.Authenticate)
			r.Post("/auth/logout", authHandler.Logout)
			r.Get("/users/me", authHandler.Me)
		})
    })

	return r
}