package repository

import (
	"fmt"
	"context"
	"errors"
	"strings"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/dto"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type AccountRepository struct {
	db db.DBTX
}

func NewAccountRepository(db *pgxpool.Pool) *AccountRepository {
	return &AccountRepository{ db: db }
}

func (r *AccountRepository) WithTx(tx pgx.Tx) *AccountRepository {
	return &AccountRepository{ db: tx }
}

func (r *AccountRepository) CreateAccount(ctx context.Context, account model.Account) error {
	query := `
		INSERT INTO accounts (
			id, name, type, currency_id, initial_balance, net_balance, description, created_by, created_at, updated_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	_, err := r.db.Exec(ctx, query,
		account.ID,
		account.Name,
		account.Type,
		account.CurrencyID,
		account.InitialBalance,
		account.NetBalance,
		account.Description,
		account.CreatedBy,
		account.CreatedAt,
		account.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to insert account: %w", err)
	}

	return nil
}

func (r *AccountRepository) GetAccountByID(ctx context.Context, accID string) (model.Account, error) {
	query := `
		SELECT id, name, type, currency_id, initial_balance, net_balance, description, created_by, created_at, updated_at, deleted_at
		FROM accounts
		WHERE id = $1
		AND deleted_at IS NULL
	`

	var account model.Account
	row := r.db.QueryRow(ctx, query, accID)
	err := row.Scan(
		&account.ID,
		&account.Name,
		&account.Type,
		&account.CurrencyID,
		&account.InitialBalance,
		&account.NetBalance,
		&account.Description,
		&account.CreatedBy,
		&account.CreatedAt,
		&account.UpdatedAt,
		&account.DeletedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Account{}, errors.New("account not found")
		}
		return model.Account{}, fmt.Errorf("failed to get account by id: %w", err)
	}

	return account, nil
}

func (r *AccountRepository) UpdateAccount(ctx context.Context, accID string, req *dto.UpdateAccountRequest) error {
	setClauses := []string{}
	args := []any{}
	i := 1

	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", i))
		args = append(args, *req.Name)
		i++
	}

	if req.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", i))
		args = append(args, *req.Description)
		i++
	}

	// always update updated_at
	setClauses = append(setClauses, "updated_at = NOW()")

	// if nothing was provided except updated_at, optionally block it
	if len(setClauses) == 1 {
		return errors.New("no fields provided to update")
	}

	query := fmt.Sprintf(
		"UPDATE accounts SET %s WHERE id = $%d AND deleted_at IS NULL",
		strings.Join(setClauses, ", "),
		i,
	)
	args = append(args, accID)

	res, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update account: %w", err)
	}

	if res.RowsAffected() == 0 {
		return errors.New("account not found")
	}

	return nil
}

func (r *AccountRepository) DeleteAccount(ctx context.Context, userID, accID string) error {
	query := `
		UPDATE accounts
		SET deleted_at = NOW(), deleted_by = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	res, err := r.db.Exec(ctx, query, userID, accID)
	if err != nil {
		return fmt.Errorf("failed to delete account: %w", err)
	}

	if res.RowsAffected() == 0 {
		return errors.New("account not found or already deleted")
	}

	return nil
}

func (r *AccountRepository) GetAccountsByOrgID(ctx context.Context, orgID string) ([]dto.AccountResponse, error) {
	query := `
		SELECT a.id, a.name, a.type, a.currency_id, c.code, c.name, c.symbol, a.initial_balance, a.net_balance, a.description,
		       a.created_by, a.created_at, a.updated_at
		FROM accounts a
		JOIN account_ownership ao ON a.id = ao.account_id
		JOIN currencies c ON a.currency_id = c.id
		WHERE ao.org_id = $1
		AND a.deleted_at IS NULL
	`
	rows, err := r.db.Query(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get accounts from database: %w", err)
	}
	defer rows.Close()

	var accounts []dto.AccountResponse

	for rows.Next() {
		var account dto.AccountResponse
		if err := rows.Scan(
			&account.ID,
			&account.Name,
			&account.Type,
			&account.CurrencyID,
			&account.CurrencyCode,
			&account.CurrencyName,
			&account.CurrencySymbol,
			&account.InitialBalance,
			&account.NetBalance,
			&account.Description,
			&account.CreatedBy,
			&account.CreatedAt,
			&account.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan account: %w", err)
		}
		accounts = append(accounts, account)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed during rows iteration: %w", err)
	}

	return accounts, nil
}

func (r *AccountRepository) UpdateNetBalance(ctx context.Context, req dto.UpdateNetBalanceBody) error {
	debitQuery := `
		UPDATE accounts
		SET net_balance = net_balance::numeric - $1::numeric
		WHERE id = $2
	`

	creditQuery := `
		UPDATE accounts
		SET net_balance = net_balance::numeric + $1::numeric
		WHERE id = $2
	`

	switch req.Type {
	case "income":
		_, err := r.db.Exec(ctx, creditQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to update net balance for income: %w", err)
		}

	case "expense":
		_, err := r.db.Exec(ctx, debitQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to update net balance for expense: %w", err)
		}

	case "transfer":
		// Validate required field for transfer
		if req.ToAccountID == nil || *req.ToAccountID == "" {
			return errors.New("to_account_id cannot be empty for transfers")
		}

		// Debit from accID (source)
		_, err := r.db.Exec(ctx, debitQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to debit (transfer out) from account: %w", err)
		}

		// Credit to ToAccountID (destination)
		_, err = r.db.Exec(ctx, creditQuery, req.Amount, req.ToAccountID)
		if err != nil {
			return fmt.Errorf("failed to credit (transfer in) to account: %w", err)
		}

	default:
		return errors.New("invalid account operation type")
	}

	return nil
}

func (r *AccountRepository) ReverseBalance(ctx context.Context, req dto.UpdateNetBalanceBody) error {
	debitQuery := `
		UPDATE accounts
		SET net_balance = net_balance::numeric - $1::numeric
		WHERE id = $2
	`

	creditQuery := `
		UPDATE accounts
		SET net_balance = net_balance::numeric + $1::numeric
		WHERE id = $2
	`

	switch req.Type {
	case "income":
		// For reverse income, deduct amount from account
		_, err := r.db.Exec(ctx, debitQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to reverse balance for income: %w", err)
		}

	case "expense":
		// For reverse expense, add amount to account
		_, err := r.db.Exec(ctx, creditQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to reverse balance for expense: %w", err)
		}

	case "transfer":
		// Validate required field for transfer
		if req.ToAccountID == nil || *req.ToAccountID == "" {
			return errors.New("to_account_id cannot be empty for transfer reversal")
		}

		// For transfer reversal:
		// Add to source (accID)
		_, err := r.db.Exec(ctx, creditQuery, req.Amount, req.FromAccountID)
		if err != nil {
			return fmt.Errorf("failed to reverse (credit back) from source account in transfer: %w", err)
		}

		// Deduct from destination (ToAccountID)
		_, err = r.db.Exec(ctx, debitQuery, req.Amount, req.ToAccountID)
		if err != nil {
			return fmt.Errorf("failed to reverse (debit back) from destination account in transfer: %w", err)
		}

	default:
		return errors.New("invalid account operation type for reversal")
	}

	return nil
}



