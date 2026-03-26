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

func New(AuthMiddleware *m.AuthMiddleware, OrgMiddleware *m.OrgMiddleware, authHandler *handler.AuthHandler, orgHandler *handler.OrgHandler) http.Handler {
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

			// user endpoints
			r.Post("/auth/logout", authHandler.Logout)
			r.Get("/users/me", authHandler.Me)

			// Invitation endpoints (personal notification-like)
			r.Get("/invitations", orgHandler.GetInvitations)
			r.Post("/invitations/{orgId}/accept", orgHandler.AcceptInvitation)
			r.Post("/invitations/{orgId}/decline", orgHandler.DeclineInvitation)

			r.Post("/orgs", orgHandler.CreateOrganization)
			r.Get("/orgs", orgHandler.GetUserOrgs)
			
			// require both auth and org access
			r.Group(func(r chi.Router) {
				r.Use(OrgMiddleware.ValidateOrgAccess)

				// Organization endpoints
				r.Get("/orgs/{orgId}", orgHandler.GetOrgByID)
				r.Put("/orgs/{orgId}", orgHandler.UpdateOrg)
				r.Delete("/orgs/{orgId}", orgHandler.DeleteOrg)

				// Organization members endpoints
				r.Get("/orgs/{orgId}/members", orgHandler.GetMembers)
				r.Delete("/orgs/{orgId}/members/{userId}", orgHandler.RemoveMember)
				r.Post("/orgs/{orgId}/members/invite", orgHandler.InviteMember)
			})
		})
    })

	return r
}