package main

import (
	"log"
	"log/slog"
	
	config "github.com/Pirasanth-v/custos/internal/config"
)

func main() {
	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	slog.Info("Cfg is loaded and ready to use")

	_ = cfg
}