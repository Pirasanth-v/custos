package service

import (
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"
	"time"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/storage"
)

// Allowed MIME types for bills
var allowedMimeTypes = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/webp":      true,
	"application/pdf": true,
}

const (
	maxFileSize   = 25 * 1024 * 1024 // 25 MB
	maxBillsPerTx = 10
	presignExpiry = 15 * time.Minute
	viewURLExpiry = 15 * time.Minute
)

type BillService struct {
	db          *pgxpool.Pool
	billRepo    *repository.BillRepo
	txRepo      *repository.TransactionRepository
	auditRepo   *repository.AuditLogRepository
	minioClient *storage.MinIOClient
}

func NewBillService(
	db *pgxpool.Pool,
	billRepo *repository.BillRepo,
	txRepo *repository.TransactionRepository,
	auditRepo *repository.AuditLogRepository,
	minioClient *storage.MinIOClient,
) *BillService {
	return &BillService{db, billRepo, txRepo, auditRepo, minioClient}
}

// PresignUploads generates presigned PUT URLs for each requested file.
// It creates unconfirmed DB rows so we can track pending uploads.
func (s *BillService) PresignUploads(
	ctx context.Context,
	txID, orgID, userID string,
	role *model.Role,
	files []dto.PresignFileInput,
) ([]dto.PresignBillResult, error) {
	if !role.HasPermission(model.PermCreateTransaction) && !role.HasPermission(model.PermEditTransaction) {
		return nil, fmt.Errorf("forbidden")
	}

	// Validate the transaction belongs to this org
	tx, err := s.txRepo.GetTransactionByID(ctx, txID)
	if err != nil {
		return nil, err
	}
	if tx.OrgID != orgID {
		return nil, fmt.Errorf("transaction not found")
	}
	if tx.Status == "voided" {
		return nil, fmt.Errorf("cannot add bills to a voided transaction")
	}

	// Check current bill count
	existing, err := s.billRepo.GetBillsByTransactionID(ctx, txID)
	if err != nil {
		return nil, err
	}
	if len(existing)+len(files) > maxBillsPerTx {
		return nil, fmt.Errorf("transaction cannot have more than %d bills", maxBillsPerTx)
	}

	var results []dto.PresignBillResult

	for _, f := range files {
		// Validate
		if !allowedMimeTypes[f.MimeType] {
			return nil, fmt.Errorf("file type %s not allowed", f.MimeType)
		}
		if f.FileSize > maxFileSize {
			return nil, fmt.Errorf("file %s exceeds 25MB limit", f.FileName)
		}

		// Build object key: bills/{orgID}/{txID}/{uuid}-{sanitized-name}
		ext := filepath.Ext(f.FileName)
		safeName := sanitizeFileName(strings.TrimSuffix(f.FileName, ext))
		objectKey := fmt.Sprintf("bills/%s/%s/%s-%s%s",
			orgID, txID, uuid.New().String(), safeName, ext)

		// Generate presigned URL
		uploadURL, err := s.minioClient.PresignedPutURL(ctx, objectKey, presignExpiry)
		if err != nil {
			return nil, fmt.Errorf("presign url for %s: %w", f.FileName, err)
		}

		// Generate new account ID
		billID := uuid.New().String()

		// Create unconfirmed DB row — acts as an intent record
		err = s.billRepo.CreateBill(ctx, billID, txID, orgID, userID, objectKey, f.FileName, f.MimeType, f.FileSize)
		if err != nil {
			return nil, err
		}

		results = append(results, dto.PresignBillResult{
			UploadURL: uploadURL,
			ObjectKey: objectKey,
			FileName:  f.FileName,
		})
	}

	return results, nil
}

// ConfirmUploads verifies files were actually uploaded to MinIO, then confirms them in DB + writes audit.
func (s *BillService) ConfirmUploads(
	ctx context.Context,
	txID, orgID, userID string,
	role *model.Role,
	bills []dto.ConfirmBillInput,
) ([]dto.BillResponse, error) {
	if !role.HasPermission(model.PermCreateTransaction) && !role.HasPermission(model.PermEditTransaction) {
		return nil, fmt.Errorf("forbidden")
	}

	tx, err := s.txRepo.GetTransactionByID(ctx, txID)
	if err != nil {
		return nil, err
	}
	if tx.OrgID != orgID {
		return nil, fmt.Errorf("transaction not found")
	}

	for _, b := range bills {
		// Security: object key must be scoped to this org and transaction
		expectedPrefix := fmt.Sprintf("bills/%s/%s/", orgID, txID)
		if !strings.HasPrefix(b.ObjectKey, expectedPrefix) {
			return nil, fmt.Errorf("invalid object key: %s", b.ObjectKey)
		}

		// Verify the file actually landed in MinIO
		exists, err := s.minioClient.ObjectExists(ctx, b.ObjectKey)
		if err != nil {
			return nil, fmt.Errorf("verify upload for %s: %w", b.FileName, err)
		}
		if !exists {
			return nil, fmt.Errorf("file %s was not uploaded successfully", b.FileName)
		}

		// Mark confirmed in DB
		if err := s.billRepo.ConfirmBill(ctx, b.ObjectKey, orgID); err != nil {
			return nil, err
		}
	}

	// Audit log: bill upload confirmed
	auditCtx, _ := json.Marshal(map[string]any{
		"transaction_id": txID,
		"bill_count":     len(bills),
		"file_names":     billFileNames(bills),
	})
	_ = s.auditRepo.CreateAuditLog(ctx, model.AuditLog{
		ID:           uuid.New().String(),
		OrgID:        orgID,
		ActionDoneBy: userID,
		Action:       model.ActionTypeCreate,
		Entity:       model.EntityTypeTransaction,
		EntityID:     txID,
		Context:      auditCtx,
		CreatedAt:    time.Now(),
	})

	// Fetch full records to return with view URLs
	rows, err := s.billRepo.GetBillsByTransactionID(ctx, txID)
	if err != nil {
		return nil, err
	}

	return s.buildBillResponses(ctx, rows)
}

// GetBillsByTransaction returns bills for a transaction with presigned view URLs.
func (s *BillService) GetBillsByTransaction(
	ctx context.Context,
	txID, orgID string,
) ([]dto.BillResponse, error) {
	// Verify transaction belongs to org
	tx, err := s.txRepo.GetTransactionByID(ctx, txID)
	if err != nil {
		return nil, err
	}
	if tx.OrgID != orgID {
		return nil, fmt.Errorf("transaction not found")
	}

	rows, err := s.billRepo.GetBillsByTransactionID(ctx, txID)
	if err != nil {
		return nil, err
	}
	return s.buildBillResponses(ctx, rows)
}

// GetBillsByOrg returns bills for the Files section with cursor-based pagination.
func (s *BillService) GetBillsByOrg(
	ctx context.Context,
	orgID, cursor string,
	limit int,
) (*dto.PaginatedResponse[dto.BillResponse], error) {
	page, err := s.billRepo.GetBillsByOrgID(ctx, orgID, cursor, limit)
	if err != nil {
		return nil, err
	}
	enriched, err := s.buildBillResponses(ctx, page.Data)
	if err != nil {
		return nil, err
	}
	return &dto.PaginatedResponse[dto.BillResponse]{
		Data:    enriched,
		Next:    page.Next,
		HasMore: page.HasMore,
	}, nil
}

// DeleteBill soft-deletes the DB record and removes the object from MinIO.
func (s *BillService) DeleteBill(
	ctx context.Context,
	billID, orgID, userID string,
	role *model.Role,
) error {
	if !role.HasPermission(model.PermEditTransaction) && !role.HasPermission(model.PermDeleteTransaction) {
		return fmt.Errorf("forbidden")
	}

	// Fetch bill first for audit log before_state
	bill, err := s.billRepo.GetBillByID(ctx, billID, orgID)
	if err != nil {
		return err
	}

	// Soft delete in DB
	objectKey, err := s.billRepo.SoftDeleteBill(ctx, billID, orgID)
	if err != nil {
		return err
	}

	// Delete from MinIO AFTER DB commit (best-effort; log if fails)
	if err := s.minioClient.DeleteObject(ctx, objectKey); err != nil {
		// Don't fail the request — the DB record is already marked deleted.
		// A reconciliation job can clean up orphaned objects.
		slog.Error("failed to delete object from minio", "object_key", objectKey, "error", err)
	}

	// Audit
	beforeBytes, _ := json.Marshal(map[string]any{
		"bill_id":    bill.ID,
		"file_name":  bill.FileName,
		"object_key": bill.ObjectKey,
	})
	_ = s.auditRepo.CreateAuditLog(ctx, model.AuditLog{
		ID:           uuid.New().String(),
		OrgID:        orgID,
		ActionDoneBy: userID,
		Action:       model.ActionTypeDelete,
		Entity:       model.EntityTypeTransaction,
		EntityID:     bill.TransactionID,
		BeforeState:  beforeBytes,
		CreatedAt:    time.Now(),
	})

	return nil
}

// ---- helpers ----

// buildBillResponses replaces each row's raw ObjectKey with a short-lived presigned GET URL.
func (s *BillService) buildBillResponses(ctx context.Context, rows []dto.BillResponse) ([]dto.BillResponse, error) {
	out := make([]dto.BillResponse, 0, len(rows))
	for _, r := range rows {
		viewURL, err := s.minioClient.PresignedGetURL(ctx, r.ObjectKey, viewURLExpiry)
		if err != nil {
			return nil, fmt.Errorf("generate view url for %s: %w", r.FileName, err)
		}
		r.ObjectKey = viewURL
		out = append(out, r)
	}
	return out, nil
}

func sanitizeFileName(name string) string {
	// Replace anything that isn't alphanumeric, dash, underscore, dot
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		} else {
			b.WriteRune('-')
		}
	}
	return b.String()
}

func billFileNames(bills []dto.ConfirmBillInput) []string {
	names := make([]string, len(bills))
	for i, b := range bills {
		names[i] = b.FileName
	}
	return names
}
