package repository

import (
	"context"
	"fmt"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pirasanth-v/custos/internal/model"
)

type SessionRepository struct {
	DB *pgxpool.Pool
}

func NewSessionRepository(db *pgxpool.Pool) *SessionRepository {
	return &SessionRepository{DB: db}
}

func (r *SessionRepository) CreateSession(ctx context.Context, session model.Session) error {
	query := `
		INSERT INTO sessions(id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.DB.Exec(ctx, query,
		session.ID,
		session.UserID,
		session.TokenHash,
		session.ExpiresAt,
	)
	
	if err != nil {
		return fmt.Errorf("insert session into db failed: %w", err)
	}

	return nil
}

func (r *SessionRepository) RevokeSession(ctx context.Context, tokenHash string) error {
    query := `
        UPDATE sessions
        SET is_revoked = TRUE
        WHERE token_hash = $1
        AND is_revoked = FALSE
    `
    result, err := r.DB.Exec(ctx, query, tokenHash)
    if err != nil {
        return fmt.Errorf("failed to revoke session: %w", err)
    }
    if result.RowsAffected() == 0 {
        return errors.New("session not found")
    }
    return nil
}

func (r *SessionRepository) GetSessionByTokenHash(ctx context.Context, tokenHash string) (model.Session, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, is_revoked, created_at
		FROM sessions
		WHERE token_hash = $1
		AND expires_at > NOW()
		AND is_revoked = FALSE
	`

	var session model.Session
	err := r.DB.QueryRow(ctx, query, tokenHash).Scan(
		&session.ID,
		&session.UserID,
		&session.TokenHash,
		&session.ExpiresAt,
		&session.IsRevoked,
		&session.CreatedAt,
	)

	if err != nil {
		return model.Session{}, fmt.Errorf("failed to get session by tokenhash: %w", err)
	}

	return session, nil
}
