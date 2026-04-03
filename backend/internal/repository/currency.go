package repository

import (
	"fmt"
	"context"
	"errors"
	
	"github.com/pirasanth-v/custos/internal/model"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type CurrencyRepository struct {
	db db.DBTX
}

func NewCurrencyRepository(db *pgxpool.Pool) *CurrencyRepository {
	return &CurrencyRepository{ db: db }
}

func (r *CurrencyRepository) WithTx(Tx pgx.Tx) *CurrencyRepository {
	return &CurrencyRepository{ db: Tx }
}

func (r *CurrencyRepository) GetAll(ctx context.Context) ([]model.Currency, error) { 
	query := `
		SELECT id, code, name, symbol, created_at
		FROM currencies
		WHERE deleted_at IS NULL
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get currencies at db: %w", err)
	}
	defer rows.Close()

	var currencies []model.Currency
	for rows.Next() {
		var currency model.Currency
		if err := rows.Scan(
			&currency.ID,
			&currency.Code,
			&currency.Name,
			&currency.Symbol,
			&currency.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan into currency model: %w", err)
		}
		currencies = append(currencies, currency)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return currencies, nil
}

func (r *CurrencyRepository) GetByID(ctx context.Context, currencyID string) (model.Currency, error) {
	query := `
		SELECT id, code, name, symbol, created_at
		FROM currencies
		WHERE id = $1
		AND deleted_at IS NULL
	`

	var currency model.Currency
	row := r.db.QueryRow(ctx, query, currencyID)
	err := row.Scan(
		&currency.ID,
		&currency.Code,
		&currency.Name,
		&currency.Symbol,
		&currency.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Currency{}, errors.New("currency not found")
		}
		return model.Currency{}, fmt.Errorf("failed to get currency from the database: %w", err)
	}

	return currency, nil
}