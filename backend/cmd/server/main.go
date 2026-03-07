package main

import (
	"log"
	"log/slog"
	"context"
	"net/http"

	config "github.com/pirasanth-v/custos/internal/config"
	db "github.com/pirasanth-v/custos/internal/database"
	server "github.com/pirasanth-v/custos/internal/server"
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

	router := server.New()
	if err := http.ListenAndServe(":"+cfg.App.Port, router); err != nil {
		log.Fatalf("Server failed :%v", err)
	}
	
}