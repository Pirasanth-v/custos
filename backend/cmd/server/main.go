package main

import (
	"log"
	"log/slog"
	"context"
	"net/http"

	"github.com/pirasanth-v/custos/internal/config"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/pirasanth-v/custos/internal/server"
	"github.com/pirasanth-v/custos/internal/handler"
	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/middleware"
)

func main() {
	// Load the Config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	slog.Info("Cfg is loaded and ready to use")

	// Connect to DB
	db, err := db.Connect(cfg.DB)
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	slog.Info("db connection created successfully")
	defer db.Close()

	// DB healthcheck 
	if err := db.Ping(context.Background()); err != nil {
		db.Close()
		log.Fatalf("Unable to ping database: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	authService := service.NewAuthService(userRepo, sessionRepo, cfg.Security)
	authHandler := handler.NewAuthHandler(authService, cfg.Security)

	authMiddleware := middleware.NewAuthMiddleware(sessionRepo)

	router := server.New(authMiddleware, authHandler)
	if err := http.ListenAndServe(":"+cfg.App.Port, router); err != nil {
		log.Fatalf("Server failed :%v", err)
	}
	
}