package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/model"
)

// UserRepository provides methods for DB operations related to users.
type UserRepository struct {
	db db.DBTX
}

// NewUserRepository instantiates a new UserRepository with a db pool.
func NewUserRepository(dbPool *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: dbPool}
}

func (r *UserRepository) WithTx(tx pgx.Tx) *UserRepository {
	return &UserRepository{db: tx}
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

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (model.User, error) {
	query := `
		SELECT id, first_name, last_name, email, password_hash, current_status, avatar_url, created_at, updated_at, deleted_at
		FROM users
		WHERE email = $1
	`

	var user model.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.Id,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.CurrentStatus,
		&user.AvatarUrl,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, errors.New("user not found")
		}
		return model.User{}, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetUserById(ctx context.Context, userID string) (*dto.UserResponse, error) {
	query := `
		SELECT id, first_name, last_name, email, current_status, avatar_url, created_at
		FROM users
		WHERE id = $1
		AND deleted_at IS NULL
	`

	user := &dto.UserResponse{}
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Status,
		&user.AvatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	return user, nil
}

// Find user by google_id
func (r *UserRepository) GetByGoogleID(ctx context.Context, googleID string) (*model.User, error) {
	query := `
		SELECT id, email, first_name, last_name, created_at
		FROM users
		WHERE google_id = $1
		AND deleted_at IS NULL
	`

	user := model.User{}
	err := r.db.QueryRow(ctx, query, googleID).Scan(
		&user.Id,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user by google id: %w", err)
	}

	return &user, nil
}

// Link google_id to existing user
func (r *UserRepository) LinkGoogleID(ctx context.Context, userID, googleID string) error {
	query := `
		UPDATE users
		SET google_id = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, googleID, userID)
	if err != nil {
		return fmt.Errorf("failed to link google id to user: %w", err)
	}

	return nil
}

// Create new user from Google
func (r *UserRepository) CreateFromGoogle(ctx context.Context, g *model.GoogleUser) (*model.User, error) {
	query := `
		INSERT INTO users (id, email, first_name, last_name, google_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, email, first_name, last_name, created_at, updated_at, deleted_at
	`

	parts := strings.Fields(g.Name)
	firstName := ""
	lastName := ""
	if len(parts) > 0 {
		firstName = parts[0]
	}
	if len(parts) > 1 {
		lastName = strings.Join(parts[1:], " ")
	}

	_, err := r.db.Exec(ctx, query,
		g.UserID,
		g.Email,
		firstName,
		lastName,
		g.GoogleID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user from google: %w", err)
	}

	return &model.User{
		Id:        g.UserID,
		Email:     g.Email,
		FirstName: firstName,
		LastName:  lastName,
	}, nil
}
