package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/pirasanth-v/custos/internal/model"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type CategoryRepository struct {
	db db.DBTX
}

func NewCategoryRepository(db *pgxpool.Pool) *CategoryRepository {
	return &CategoryRepository{ db: db }
}

func (r *CategoryRepository) WithTx(tx pgx.Tx) *CategoryRepository {
	return &CategoryRepository{ db: tx }
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, category model.Category) error {
	query := `
		INSERT INTO categories (
			id, name, created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query,
		category.ID,
		category.Name,
		category.CreatedBy,
		category.CreatedAt,
		category.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}
	return nil
}

func (r *CategoryRepository) GetCategoriesByOrgID(ctx context.Context, orgID string) ([]model.Category, error) {
	query := `
		SELECT id, name, created_by, created_at, updated_at, deleted_at
		FROM categories
		WHERE org_id = $1 AND deleted_at IS NULL
	`
	rows, err := r.db.Query(ctx, query, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := []model.Category{}
	for rows.Next() {
		var c model.Category
		err := rows.Scan(
			&c.ID, 
			&c.Name, 
			&c.CreatedBy, 
			&c.CreatedAt, 
			&c.UpdatedAt, 
			&c.DeletedAt,
		); if err != nil {
			return nil, fmt.Errorf("failed to scan into category: %w", err)
		}
		categories = append(categories, c)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed during rows iteration: %w", err)
	}

	return categories, nil
}

func (r *CategoryRepository) UpdateCategory(ctx context.Context, name, catID string) error {
	query := `
		UPDATE categories
		SET name = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`
	cmd, err := r.db.Exec(ctx, query, name, catID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errors.New("category not found or not owned by user")
	}
	return nil
}

func (r *CategoryRepository) DeleteCategory(ctx context.Context, catID string) error {
	query := `
		UPDATE categories
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`
	cmd, err := r.db.Exec(ctx, query, catID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errors.New("category not found or already deleted")
	}
	return nil
}

func (r *CategoryRepository) IsCategoryBelongsToOrg(ctx context.Context, orgID, catID string) (bool, error) {
	query := `
		SELECT 1
		FROM categories
		WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL
	`
	var exists int
	err := r.db.QueryRow(ctx, query, catID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil 
		}
		return false, fmt.Errorf("failed to check category: %w", err) 
	}

	return true, nil
}
