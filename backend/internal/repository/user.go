package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pirasanth-v/custos/internal/model"
)

// UserRepository provides methods for DB operations related to users.
type UserRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository instantiates a new UserRepository with a db pool.
func NewUserRepository(dbPool *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: dbPool}
}

// CreateUser inserts a new user record into the database.
func (r *UserRepository) CreateUser(ctx context.Context, user model.User) error {
	query := `
		INSERT INTO users (id, first_name, last_name, email, password_hash)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query,
		user.Id,
		user.FirstName,
		user.LastName,
		user.Email,
		user.PasswordHash,
	)

	if err != nil {
		return fmt.Errorf("insert user to db failed: %w", err)
	}

	return nil
}

func (r *UserRepository) IsEmailExists(ctx context.Context, email string) (bool, error) {
	query := `
		SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)
	`

	var exists bool
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("email exists check failed :%w", err)
	}

	return exists, nil
}