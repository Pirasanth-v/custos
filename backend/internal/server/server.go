package server

import (
	"net/http"
	"log/slog"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/pirasanth-v/custos/internal/handler"

)

func New(authHandler *handler.AuthHandler) http.Handler {
	r := chi.NewRouter()

	// runs in every request
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

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
        r.Post("/auth/register", authHandler.Register)
    })

	return r
}