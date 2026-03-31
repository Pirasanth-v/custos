package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/pirasanth-v/custos/internal/database"
)

type AccountOwnershipRepository struct {
	db db.DBTX
}

func NewAccountOwnershipRepository(db *pgxpool.Pool) *AccountOwnershipRepository {
	return &AccountOwnershipRepository{db: db}
}

func (r *AccountOwnershipRepository) WithTx(tx pgx.Tx) *AccountOwnershipRepository {
	return &AccountOwnershipRepository{db: tx}
}

func (r *AccountOwnershipRepository) CreateOwnership(ctx context.Context, orgID, accID string) error {
	query := `
		INSERT INTO account_ownership (org_id, account_id, created_at)
		VALUES ($1, $2, NOW())
	`

	res, err := r.db.Exec(ctx, query, orgID, accID)
	if err != nil {
		return fmt.Errorf("failed to create ownership at database: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("no rows were inserted into account_ownership")
	}

	return nil
}

func (r *AccountOwnershipRepository) IsBelongs(ctx context.Context, orgID, accID string) (bool, error) {
	query := `
		SELECT EXISTS (SELECT 1 FROM account_ownership WHERE org_id = $1 AND account_id = $2)
	`

	var exists bool
	err := r.db.QueryRow(ctx, query, orgID, accID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check account ownership: %w", err)
	}
	return exists, nil
}