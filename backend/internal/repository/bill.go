package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/pirasanth-v/custos/internal/dto"
)

type BillRepo struct {
	db db.DBTX
}

func NewBillRespository(db db.DBTX) *BillRepo {
	return &BillRepo{db: db}
}

func (r *BillRepo) WithTx(tx pgx.Tx) *BillRepo {
	return &BillRepo{db: tx}
}

// CreateBill inserts a new bill record (is_confirmed=false initially).
func (r *BillRepo) CreateBill(ctx context.Context, id, txID, orgID, uploadedBy, objectKey, fileName, mimeType string, fileSize int64) error {
	query := `
        INSERT INTO transaction_bills
            (id, transaction_id, org_id, uploaded_by, object_key, file_name, mime_type, file_size_bytes, is_confirmed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
        RETURNING id
    `

	_, err := r.db.Exec(ctx, query, id, txID, orgID, uploadedBy, objectKey, fileName, mimeType, fileSize)
	if err != nil {
		return fmt.Errorf("create bill: %w", err)
	}
	return nil
}

// ConfirmBill marks a bill as confirmed (upload finished).
func (r *BillRepo) ConfirmBill(ctx context.Context, objectKey, orgID string) error {
	query := `
        UPDATE transaction_bills
        SET is_confirmed = TRUE, updated_at = NOW()
        WHERE object_key = $1 AND org_id = $2 AND deleted_at IS NULL
    `

	tag, err := r.db.Exec(ctx, query, objectKey, orgID)
	if err != nil {
		return fmt.Errorf("confirm bill: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("bill not found")
	}
	return nil
}

// GetBillsByTransactionID returns all active confirmed bills for a transaction.
func (r *BillRepo) GetBillsByTransactionID(ctx context.Context, txID string) ([]dto.BillResponse, error) {
	query := `
        SELECT id, transaction_id, org_id, uploaded_by, object_key,
               file_name, mime_type, file_size_bytes, created_at
        FROM transaction_bills
        WHERE transaction_id = $1
          AND is_confirmed = TRUE
          AND deleted_at IS NULL
        ORDER BY created_at ASC
    `

	rows, err := r.db.Query(ctx, query, txID)
	if err != nil {
		return nil, fmt.Errorf("get bills by tx: %w", err)
	}
	defer rows.Close()

	var bills []dto.BillResponse
	for rows.Next() {
		var b dto.BillResponse
		if err := rows.Scan(
			&b.ID, &b.TransactionID, &b.OrgID, &b.UploadedBy,
			&b.ObjectKey, &b.FileName, &b.MimeType, &b.FileSizeBytes, &b.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan bill: %w", err)
		}
		bills = append(bills, b)
	}
	return bills, nil
}

// GetBillsByOrgID returns confirmed bills for the files section using cursor-based pagination.
func (r *BillRepo) GetBillsByOrgID(ctx context.Context, orgID, cursor string, limit int) (*dto.PaginatedResponse[dto.BillResponse], error) {
	var lastID *string
	var lastCreatedAt *time.Time

	if cursor != "" {
		var err error
		lastID, lastCreatedAt, err = dto.DecodeCursor(cursor)
		if err != nil {
			return nil, fmt.Errorf("get bills by org: decode cursor: %w", err)
		}
	}

	query := `
        SELECT b.id, b.transaction_id, b.org_id, b.uploaded_by, b.object_key,
               b.file_name, b.mime_type, b.file_size_bytes, b.created_at
        FROM transaction_bills b
        WHERE b.org_id = $1
          AND (
                $2::timestamptz IS NULL
                OR (b.created_at, b.id) < ($2, $3::uuid)
              )
          AND b.is_confirmed = TRUE
          AND b.deleted_at IS NULL
        ORDER BY b.created_at DESC, b.id DESC
        LIMIT $4
    `

	rows, err := r.db.Query(ctx, query, orgID, lastCreatedAt, lastID, limit+1)
	if err != nil {
		return nil, fmt.Errorf("get bills by org: %w", err)
	}
	defer rows.Close()

	bills := make([]dto.BillResponse, 0, limit+1)
	for rows.Next() {
		var b dto.BillResponse
		if err := rows.Scan(
			&b.ID,
			&b.TransactionID,
			&b.OrgID,
			&b.UploadedBy,
			&b.ObjectKey,
			&b.FileName,
			&b.MimeType,
			&b.FileSizeBytes,
			&b.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("get bills by org: scan: %w", err)
		}
		bills = append(bills, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("get bills by org: rows: %w", err)
	}

	hasMore := false
	var nextCursor string
	if len(bills) > limit {
		bills = bills[:limit]
		hasMore = true
		last := bills[limit-1]
		nextCursor, err = dto.EncodeCursor(last.ID, last.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("get bills by org: encode cursor: %w", err)
		}
	}

	response := &dto.PaginatedResponse[dto.BillResponse]{
		Data:    bills,
		Next:    nextCursor,
		HasMore: hasMore,
	}

	return response, nil
}

// GetBillByID fetches one bill; used for delete validation.
func (r *BillRepo) GetBillByID(ctx context.Context, billID, orgID string) (*dto.BillResponse, error) {
	query := `
        SELECT id, transaction_id, org_id, uploaded_by, object_key,
               file_name, mime_type, file_size_bytes, created_at
        FROM transaction_bills
        WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL
    `

	var b dto.BillResponse
	err := r.db.QueryRow(ctx, query, billID, orgID).Scan(
		&b.ID,
		&b.TransactionID,
		&b.OrgID,
		&b.UploadedBy,
		&b.ObjectKey,
		&b.FileName,
		&b.MimeType,
		&b.FileSizeBytes,
		&b.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("bill not found")
	}
	if err != nil {
		return nil, fmt.Errorf("get bill by id: %w", err)
	}
	return &b, nil
}

// SoftDeleteBill marks a bill deleted. Returns the objectKey so the caller can delete from MinIO.
func (r *BillRepo) SoftDeleteBill(ctx context.Context, billID, orgID string) (string, error) {
	query := `
        UPDATE transaction_bills
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL
        RETURNING object_key
    `

	var objectKey string
	err := r.db.QueryRow(ctx, query, billID, orgID).Scan(&objectKey)
	if err == pgx.ErrNoRows {
		return "", fmt.Errorf("bill not found")
	}
	if err != nil {
		return "", fmt.Errorf("soft delete bill: %w", err)
	}
	return objectKey, nil
}

// DeleteUnconfirmedBills cleans up stale pending rows (run via cron).
func (r *BillRepo) DeleteUnconfirmedBills(ctx context.Context, olderThan time.Duration) ([]string, error) {
	query := `
        UPDATE transaction_bills
        SET deleted_at = NOW()
        WHERE is_confirmed = FALSE
          AND created_at < NOW() - $1::interval
          AND deleted_at IS NULL
        RETURNING object_key
    `

	rows, err := r.db.Query(ctx, query, fmt.Sprintf("%d seconds", int(olderThan.Seconds())))
	if err != nil {
		return nil, fmt.Errorf("cleanup unconfirmed: %w", err)
	}
	defer rows.Close()

	var keys []string
	for rows.Next() {
		var k string
		if err := rows.Scan(&k); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, nil
}

// GetStats retrieves statistics about bills for an organization.
func (r *BillRepo) GetStats(ctx context.Context, orgID string) (*dto.BillStats, error) {
	query := `
		SELECT
			COUNT(*)                                              AS total,
			COUNT(*) FILTER (WHERE mime_type LIKE 'image/%')      AS images,
			COUNT(*) FILTER (WHERE mime_type = 'application/pdf') AS pdfs,
			COALESCE(SUM(file_size_bytes), 0)                     AS total_bytes
		FROM transaction_bills
		WHERE org_id = $1
			AND deleted_at IS NULL
			AND is_confirmed = TRUE
	`

	var stats dto.BillStats
	err := r.db.QueryRow(ctx, query, orgID).Scan(
		&stats.Total, 
		&stats.Images, 
		&stats.PDFs, 
		&stats.TotalBytes,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("bill not found")
		}
		return nil, fmt.Errorf("get bill stats: %w", err)
	}

	return &stats, nil
}
