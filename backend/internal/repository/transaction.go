package repository

import (
	"context"
	"fmt"
	"strings"
	"errors"
	"time"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/dto"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TransactionRepository struct {
	db db.DBTX
}

func NewTransactionRepository(db *pgxpool.Pool) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) WithTx(tx pgx.Tx) *TransactionRepository {
	return &TransactionRepository{db: tx}
}

func (r *TransactionRepository) CreateTransaction(ctx context.Context, transaction model.Transaction) error {
	query := `
		INSERT INTO transactions (id, org_id, from_account_id, created_by, type, amount, description, category_id, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.Exec(ctx, query,
		transaction.ID,
		transaction.OrgID,
		transaction.FromAccountID,
		transaction.CreatedBy,
		transaction.Type,
		transaction.Amount,
		transaction.Description,
		transaction.CategoryID,
		transaction.Status,
	)

	if err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}

	return nil
}

func (r *TransactionRepository) UpdateTransaction(ctx context.Context, userID, tranID string, transaction *dto.UpdateTransactionRequest) error {
	setClauses := []string{}
	args := []any{}
	i := 1

	// Only update from_account_id if it's non-nil and non-empty
	if transaction.FromAccountID != nil && *transaction.FromAccountID != "" {
		setClauses = append(setClauses, fmt.Sprintf("from_account_id = $%d", i))
		args = append(args, *transaction.FromAccountID)
		i++
	}
	// Only update to_account_id if it's non-nil and non-empty
	if transaction.ToAccountID != nil && *transaction.ToAccountID != "" {
		setClauses = append(setClauses, fmt.Sprintf("to_account_id = $%d", i))
		args = append(args, *transaction.ToAccountID)
		i++
	}

	// Only update amount if it's non-empty (since it's a string, not pointer)
	if *transaction.Amount != "" {
		setClauses = append(setClauses, fmt.Sprintf("amount = $%d", i))
		args = append(args, transaction.Amount)
		i++
	}

	// Only update type if it's non-empty (since it's a string, not pointer)
	if *transaction.Type != "" {
		setClauses = append(setClauses, fmt.Sprintf("type = $%d", i))
		args = append(args, transaction.Type)
		i++
	}

	// Update description only if non-nil
	if transaction.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", i))
		args = append(args, *transaction.Description)
		i++
	}

	// Update category_id only if non-empty (since string, not pointer)
	if *transaction.CategoryID != "" {
		setClauses = append(setClauses, fmt.Sprintf("category_id = $%d", i))
		args = append(args, transaction.CategoryID)
		i++
	}

	// Always increment version and timestamp
	setClauses = append(setClauses, "version = version + 1")
	setClauses = append(setClauses, "updated_at = NOW()")
	setClauses = append(setClauses, fmt.Sprintf("updated_by = $%d", i))
	args = append(args, userID)
	i++

	// If only version and updated_at, don't allow update
	if len(setClauses) <= 3 {
		return fmt.Errorf("no fields provided to update")
	}

	query := fmt.Sprintf(
		"UPDATE transactions SET %s WHERE id = $%d AND version = $%d AND status = 'posted' AND deleted_at IS NULL",
		strings.Join(setClauses, ", "),
		i, i+1,
	)

	args = append(args, tranID)
	args = append(args, transaction.Version)

	res, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update transaction in db: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("transaction update failed: no rows affected")
	}

	return nil
}

func (r *TransactionRepository) DeleteTransaction(ctx context.Context, transactionID string, deletedBy string) error {
	query := `
		UPDATE transactions
		SET
			status = 'deleted',
			deleted_at = NOW(),
			deleted_by = $2,
			version = version + 1
		WHERE id = $1
			AND status = 'posted'
			AND deleted_at IS NULL
	`

	res, err := r.db.Exec(ctx, query, transactionID, deletedBy)
	if err != nil {
		return fmt.Errorf("failed to delete transaction: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("transaction delete failed: no rows affected")
	}

	return nil
}

func (r *TransactionRepository) GetTransactionByID(ctx context.Context, tranID string) (*model.Transaction, error) {
	query := `
		SELECT id, org_id, from_account_id, to_account_id, created_by, updated_by, deleted_by, type, amount, description, category_id, version, status, created_at, updated_at, deleted_at
		FROM transactions
		WHERE id = $1
		  AND status != 'deleted'
		  AND deleted_at IS NULL
	`
	var transaction model.Transaction
	err := r.db.QueryRow(ctx, query, tranID).Scan(
		&transaction.ID,
		&transaction.OrgID,
		&transaction.FromAccountID,
		&transaction.ToAccountID,
		&transaction.CreatedBy,
		&transaction.UpdatedBy,
		&transaction.DeletedBy,
		&transaction.Type,
		&transaction.Amount,
		&transaction.Description,
		&transaction.CategoryID,
		&transaction.Version,
		&transaction.Status,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
		&transaction.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("transaction not found")
		}
		return nil, fmt.Errorf("failed to get transaction from db: %w", err)
	}

	return &transaction, nil
}

func (r *TransactionRepository) GetTransactionsByAccID(ctx context.Context, accID, cursor string, limit int) (*dto.PaginatedResponse[model.Transaction], error) {
	var lastTranID string
	var lastTranCreatedAt time.Time

	if cursor != "" {
		var err error
		lastTranID, lastTranCreatedAt, err = dto.DecodeCursor(cursor)
		if err != nil {
			return nil, fmt.Errorf("failed to decode cursor: %w", err)
		}
	} else {
		lastTranCreatedAt = time.Now()
		lastTranID = ""
	}

	query := `
		SELECT id, org_id, from_account_id, to_account_id, created_by, updated_by, deleted_by, type, amount, description, category_id, version, status, created_at, updated_at, deleted_at
		FROM transactions
		WHERE from_account_id = $1
		  AND (
				(created_at, id) < ($2, $3)
			)
		  AND status != 'deleted'
		  AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT $4
	`

	rows, err := r.db.Query(ctx, query, accID, lastTranCreatedAt, lastTranID, limit+1)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions from database: %w", err)
	}
	defer rows.Close()

	transactions := make([]model.Transaction, 0, limit+1)
	for rows.Next() {
		var transaction model.Transaction
		if err := rows.Scan(
			&transaction.ID,
			&transaction.OrgID,
			&transaction.FromAccountID,
			&transaction.ToAccountID,
			&transaction.CreatedBy,
			&transaction.UpdatedBy,
			&transaction.DeletedBy,
			&transaction.Type,
			&transaction.Amount,
			&transaction.Description,
			&transaction.CategoryID,
			&transaction.Version,
			&transaction.Status,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
			&transaction.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan into transaction: %w", err)
		}
		transactions = append(transactions, transaction)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed during rows iteration: %w", err)
	}

	hasMore := false
	var nextCursor string
	if len(transactions) > limit {
		hasMore = true
		last := transactions[limit]
		var err error
		nextCursor, err = dto.EncodeCursor(last.ID, last.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to encode new cursor: %w", err)
		}
		transactions = transactions[:limit]
	}

	response := &dto.PaginatedResponse[model.Transaction]{
		Data:    transactions,
		Next:    nextCursor,
		HasMore: hasMore,
	}

	return response, nil
}

func (r *TransactionRepository) GetTransactionsByOrgID(ctx context.Context, orgID, cursor string, limit int) (*dto.PaginatedResponse[model.Transaction], error) {
	var lastTranID string
	var lastTranCreatedAt time.Time

	if cursor != "" {
		var err error
		lastTranID, lastTranCreatedAt, err = dto.DecodeCursor(cursor)
		if err != nil {
			return nil, fmt.Errorf("failed to decode cursor: %w", err)
		}
	} else {
		lastTranCreatedAt = time.Now()
		lastTranID = ""
	}

	query := `
		SELECT id, org_id, from_account_id, to_account_id, created_by, updated_by, deleted_by, type, amount, description, category_id, version, status, created_at, updated_at, deleted_at
		FROM transactions
		WHERE org_id = $1
		  AND (
				(created_at, id) < ($2, $3)
			)
		  AND status != 'deleted'
		  AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT $4
	`

	rows, err := r.db.Query(ctx, query, orgID, lastTranCreatedAt, lastTranID, limit+1)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions from database: %w", err)
	}
	defer rows.Close()

	transactions := make([]model.Transaction, 0, limit+1)
	for rows.Next() {
		var transaction model.Transaction
		if err := rows.Scan(
			&transaction.ID,
			&transaction.OrgID,
			&transaction.FromAccountID,
			&transaction.ToAccountID,
			&transaction.CreatedBy,
			&transaction.UpdatedBy,
			&transaction.DeletedBy,
			&transaction.Type,
			&transaction.Amount,
			&transaction.Description,
			&transaction.CategoryID,
			&transaction.Version,
			&transaction.Status,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
			&transaction.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan into transaction: %w", err)
		}
		transactions = append(transactions, transaction)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed during rows iteration: %w", err)
	}

	hasMore := false
	var nextCursor string
	if len(transactions) > limit {
		hasMore = true
		last := transactions[limit]
		var err error
		nextCursor, err = dto.EncodeCursor(last.ID, last.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to encode new cursor: %w", err)
		}
		transactions = transactions[:limit]
	}

	response := &dto.PaginatedResponse[model.Transaction]{
		Data:    transactions,
		Next:    nextCursor,
		HasMore: hasMore,
	}

	return response, nil
}

func (r *TransactionRepository) IsTranBelongsToAcc(ctx context.Context, tranID, accID string) (bool, error) {
	query := `
		SELECT 1 FROM transactions 
		WHERE id = $1 AND from_account_id = $2
		LIMIT 1
	`
	var found int
	err := r.db.QueryRow(ctx, query, tranID, accID).Scan(&found)
	if err != nil {
		// Not found is not an error, just return false
		if err.Error() == "no rows in result set" {
			return false, nil
		}
		return false, fmt.Errorf("failed to check transaction-account ownership: %w", err)
	}
	return true, nil
}

func (r *TransactionRepository) GetTransactionByIDForUpdate(ctx context.Context, tranID string) (*dto.UpdateTransactionRequest, error) {
	query := `
		SELECT from_account_id, COALESCE(to_account_id,'') , type, amount, description, category_id, version
		FROM transactions
		WHERE id = $1
		  AND status = 'posted'
		  AND deleted_at IS NULL
		FOR UPDATE
	`

	transaction := &dto.UpdateTransactionRequest{}
	
	err := r.db.QueryRow(ctx, query, tranID).Scan(
		&transaction.FromAccountID,
		&transaction.ToAccountID,
		&transaction.Type,
		&transaction.Amount,
		&transaction.Description,
        &transaction.CategoryID,
		&transaction.Version,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("transaction not found")
		}
		return nil, fmt.Errorf("failed to get transaction from db: %w", err)
	}

	return transaction, nil
}