package main

import (
	"log"
	"log/slog"
	"context"
	"net/http"
	"os"
	"fmt"

	"github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/database"
	"github.com/pirasanth-v/custos/internal/storage"
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

	// Build the database URL from config
	databaseURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.DB.User, cfg.DB.Password,
		cfg.DB.Host, cfg.DB.Port,
		cfg.DB.Name, cfg.DB.SSLmode,
	)

	if err := database.RunMigrations(databaseURL); err != nil {
        slog.Error("migration failed", "err", err)
        os.Exit(1)
    }

	// Connect to DB
	db, err := database.Connect(cfg.DB)
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

	// Init MinIO client
	minioClient, err := storage.NewMinIOClient(
		cfg.Storage.Endpoint,
		cfg.Storage.AccessKey,
		cfg.Storage.SecretKey,
		cfg.Storage.Bucket,
		cfg.Storage.UseSSL,
		cfg.Storage.PublicHost, // public domain in prod
	)
	if err != nil {
		slog.Error("failed to create minio client", "err", err)
		os.Exit(1)
	}

	// Ensure bucket exists (idempotent)
	if err := minioClient.EnsureBucket(context.Background()); err != nil {
		slog.Error("failed to ensure minio bucket", "err", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() 

	database.StartViewRefresher(ctx, db)

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
	categoryRepo := repository.NewCategoryRepository(db)
	billRepo := repository.NewBillRespository(db)
	dashboardRepo := repository.NewDashboardRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, sessionRepo, orgRepo, memberRepo, cfg.Security, db)
	orgService := service.NewOrgService(db, orgRepo, memberRepo, userRepo)
	accService := service.NewAccountService(db, currencyRepo, accRepo, ownershipRepo)
	currencyService := service.NewCurrencyService(currencyRepo)
	tranService := service.NewTransactionService(db, tranRepo, accRepo, ownershipRepo, auditRepo)
	categoryService := service.NewCategoryService(db, categoryRepo, tranRepo)
	billService := service.NewBillService(db, billRepo, tranRepo, auditRepo, minioClient)
	dashboardService := service.NewDashboardService(dashboardRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authService, cfg.Security, cfg.App)
	OrgHandler := handler.NewOrgHandler(orgService)
	accHandler := handler.NewAccountHandler(accService)
	currencyHandler := handler.NewCurrencyHandler(currencyService)
	tranHandler := handler.NewTransactionHandler(tranService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	billHandler := handler.NewBillHandler(billService)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)

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
		categoryHandler,
		billHandler,
		dashboardHandler,
	)
	if err := http.ListenAndServe(":"+cfg.App.Port, router); err != nil {
		log.Fatalf("Server failed :%v", err)
	}
	
}

