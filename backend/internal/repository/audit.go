package repository

import (
	"fmt"
	"context"

	"github.com/pirasanth-v/custos/internal/model"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type AuditLogRepository struct {
	db db.DBTX
}

func NewAuditLogRepository(db *pgxpool.Pool) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

func (r *AuditLogRepository) WithTx(tx pgx.Tx) *AuditLogRepository {
	return &AuditLogRepository{db: tx}
}

func (r *AuditLogRepository) CreateAuditLog(ctx context.Context, log model.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			id, org_id, action_done_by, action, entity_type, entity_id, before_state, after_state, context, created_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	_, err := r.db.Exec(ctx, query,
		log.ID,
		log.OrgID,
		log.ActionDoneBy,
		log.Action,
		log.Entity,
		log.EntityID,
		log.BeforeState,
		log.AfterState,
		log.Context,
		log.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create audit log at db: %w", err)
	}

	return nil
}