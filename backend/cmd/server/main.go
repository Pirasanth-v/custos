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

	// Repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	memberRepo := repository.NewOrganizationMemberRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	accRepo := repository.NewAccountRepository(db)
	ownershipRepo := repository.NewAccountOwnershipRepository(db)
	currencyRepo := repository.NewCurrencyRepository(db)
	tranRepo := repository.NewTransactionRepository(db)
	auditRepo := repository.NewAuditLogRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, sessionRepo, orgRepo, memberRepo, cfg.Security, db)
	orgService := service.NewOrgService(db, orgRepo, memberRepo, userRepo)
	accService := service.NewAccountService(db, currencyRepo, accRepo, ownershipRepo)
	currencyService := service.NewCurrencyService(currencyRepo)
	tranService := service.NewTransactionService(db, tranRepo, accRepo, ownershipRepo, auditRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authService, cfg.Security)
	OrgHandler := handler.NewOrgHandler(orgService)
	accHandler := handler.NewAccountHandler(accService)
	currencyHandler := handler.NewCurrencyHandler(currencyService)
	tranHandler := handler.NewTransactionHandler(tranService)

	// Middlewares
	authMiddleware := middleware.NewAuthMiddleware(sessionRepo)
	orgMiddleware := middleware.NewOrgMiddleware(memberRepo, roleRepo)

	// Server
	router := server.New(
		authMiddleware, 
		orgMiddleware, 
		authHandler, 
		OrgHandler, 
		accHandler, 
		currencyHandler,
		tranHandler,
	)
	if err := http.ListenAndServe(":"+cfg.App.Port, router); err != nil {
		log.Fatalf("Server failed :%v", err)
	}
	
}