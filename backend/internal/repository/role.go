package repository

import (
	"context"
	"fmt"

	"github.com/pirasanth-v/custos/internal/model"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type RoleRepository struct {
	db db.DBTX
}

func NewRoleRepository(db *pgxpool.Pool) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) WithTx(tx pgx.Tx) *RoleRepository {
	return &RoleRepository{db: tx}
}

func (r *RoleRepository) GetRoleByID(ctx context.Context, roleID string) (*model.Role, error) {
	query := `
		SELECT id, name, permissions
		FROM roles
		WHERE id = $1 
	`

	var role model.Role
	err := r.db.QueryRow(ctx, query, roleID).Scan(
		&role.ID,
		&role.Name,
		&role.Permissions,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("role not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get role by id from db: %w", err)
	}
	return &role, nil
}