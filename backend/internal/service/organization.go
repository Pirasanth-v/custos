package service

import (
	"fmt"
	"context"
	"time"

	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
)

type OrgService struct {
	db *pgxpool.Pool
	orgRepo *repository.OrganizationRepository
	memberRepo *repository.OrganizationMemberRepository
}

func NewOrgService(db *pgxpool.Pool, orgRepo *repository.OrganizationRepository, memberRepo *repository.OrganizationMemberRepository) *OrgService {
	return &OrgService {
		db: db,
		orgRepo: orgRepo,
		memberRepo: memberRepo,
	}
}

func (s *OrgService) CreateOrganization(ctx context.Context, userID string, req *dto.CreateOrganizationRequest) error {
	// Begin a transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx) // Rollback is safe to call even after commit
	}()

	// Create tx-scoped repositories
	orgRepo := s.orgRepo.WithTx(tx)
	memberRepo := s.memberRepo.WithTx(tx)

	// Step 1: Create the organization
	orgID := uuid.New().String()
	org := model.Organization{
		Id:        orgID,
		Name:      req.Name,
		Email:     req.Email,
		Address:   &req.Address,
		CreatedBy: userID,
	}
	if err := orgRepo.CreateOrganization(ctx, org); err != nil {
		return fmt.Errorf("failed to create organization: %w", err)
	}

	// Step 2: Add the creator as owner member
	now := time.Now().UTC()
	member := model.OrganizationMember{
		OrgID:    orgID,
		UserID:   userID,
		RoleID:   model.RoleOwnerID,
		Status:   "active",
		JoinedAt: &now,
		AddedBy:  &userID,
	}
	if err := memberRepo.AddMember(ctx, member); err != nil {
		return fmt.Errorf("failed to add owner: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (s *OrgService) ViewOrgsByUserID(ctx context.Context, userID string) ([]model.Organization, error) {
	orgs, err := s.orgRepo.GetOrgsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get organizations by user id: %w", err)
	}

	return orgs, nil
}
