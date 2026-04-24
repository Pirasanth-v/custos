package database

import (
    "fmt"
    "log/slog"

    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)


func RunMigrations(databaseURL string) error {
    m, err := migrate.New(
        "file://database/migrations",
        databaseURL,
    )
    if err != nil {
        return fmt.Errorf("failed to create migrator: %w", err)
    }
    // Ensure the database connection is closed on function exit, log any close errors
    defer func() {
        sourceErr, dbErr := m.Close()
        if sourceErr != nil {
            slog.Error("migration source close error", "err", sourceErr)
        }
        if dbErr != nil {
            slog.Error("migration database close error", "err", dbErr)
        }
    }()

    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        return fmt.Errorf("failed to run migrations: %w", err)
    }

    slog.Info("migrations applied successfully")
    return nil
}