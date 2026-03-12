package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	config "github.com/pirasanth-v/custos/internal/config"
)

func Connect(cfg config.DBconfig) (*pgxpool.Pool, error) {
	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Name,
		cfg.SSLmode,
	)

	dbPool, err := pgxpool.New(context.Background(), dbURL)

	return dbPool, err
}