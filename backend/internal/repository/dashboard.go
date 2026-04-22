package repository

import (
	"context"

	"github.com/pirasanth-v/custos/internal/dto"
	db "github.com/pirasanth-v/custos/internal/database"
)


type DashboardRepository struct {
	db db.DBTX
}

func NewDashboardRepository(db db.DBTX) *DashboardRepository {
	return &DashboardRepository{db: db}
}

// Real-time: current net balance across all org accounts
func (r *DashboardRepository) GetNetBalance(ctx context.Context, orgID string) (string, error) {
	query := `
        SELECT COALESCE(SUM(a.net_balance), 0)::TEXT
        FROM accounts a
        JOIN account_ownership ao ON ao.account_id = a.id
        WHERE ao.org_id = $1 AND a.deleted_at IS NULL
    `
	
	var total string
    err := r.db.QueryRow(ctx, query, orgID).Scan(&total)
    if err != nil {
        return "", err
    }
	
    return total, err
}

// Real-time: pending transaction count
func (r *DashboardRepository) GetPendingCount(ctx context.Context, orgID string) (int, error) {
	query := `
        SELECT COUNT(*)
        FROM transactions
        WHERE org_id = $1
          AND status = 'pending'
          AND deleted_at IS NULL
    `
	var count int
	err := r.db.QueryRow(ctx, query, orgID).Scan(&count)
	if err != nil {
		return 0, err
	}
	
	return count, nil
}

// Real-time: recent transactions
func (r *DashboardRepository) GetRecentTransactions(ctx context.Context, orgID string, limit int) ([]dto.TransactionSummary, error) {
	query := `
        SELECT 
            id, 
            type, 
            amount, 
            description, 
            created_at AS transaction_date, 
            status
        FROM transactions
        WHERE org_id = $1 
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $2
    `
	rows, err := r.db.Query(ctx, query, orgID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []dto.TransactionSummary
	for rows.Next() {
		var tx dto.TransactionSummary
		if err := rows.Scan(
			&tx.ID,
			&tx.Type,
			&tx.Amount,
			&tx.Description,
			&tx.TransactionDate,
			&tx.Status,
		); err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}

// Materialized: monthly summary for current + last N months
func (r *DashboardRepository) GetMonthlySummary(ctx context.Context, orgID string, months int) ([]dto.MonthlySummary, error) {
	query := `
        SELECT month, total_income, total_expense
        FROM mv_monthly_org_summary
        WHERE org_id = $1
          AND month >= DATE_TRUNC('month', NOW()) - ($2 - 1) * INTERVAL '1 month'
        ORDER BY month ASC
    `
	
	rows, err := r.db.Query(ctx, query, orgID, months)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []dto.MonthlySummary
	for rows.Next() {
		var summary dto.MonthlySummary
		err := rows.Scan(
			&summary.Month,
			&summary.TotalIncome,
			&summary.TotalExpense,
		)
		if err != nil {
			return nil, err
		}
		summaries = append(summaries, summary)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return summaries, nil
}

// Materialized: category breakdown for current month
func (r *DashboardRepository) GetCategoryBreakdown(ctx context.Context, orgID string) ([]dto.CategoryBreakdown, error) {
	query := `
        SELECT category_name, total
        FROM mv_category_breakdown
        WHERE org_id = $1
          AND month = DATE_TRUNC('month', NOW())
        ORDER BY total DESC
	`
	
	rows, err := r.db.Query(ctx, query, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var breakdowns []dto.CategoryBreakdown
	for rows.Next() {
		var cb dto.CategoryBreakdown
		if err := rows.Scan(
			&cb.CategoryName,
			&cb.Total,
		); err != nil {
			return nil, err
		}
		breakdowns = append(breakdowns, cb)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return breakdowns, nil
}