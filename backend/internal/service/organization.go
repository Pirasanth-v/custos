package service

import (
	"fmt"
	"context"
	"time"
	"errors"

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
	userRepo *repository.UserRepository
}

func NewOrgService(db *pgxpool.Pool, orgRepo *repository.OrganizationRepository, memberRepo *repository.OrganizationMemberRepository, userRepo *repository.UserRepository) *OrgService {
	return &OrgService {
		db: db,
		orgRepo: orgRepo,
		memberRepo: memberRepo,
		userRepo: userRepo,
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

func (s *OrgService) GetOrgByID(ctx context.Context, orgID string) (*model.Organization, error) {
	org, err := s.orgRepo.GetOrgById(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization by id: %w", err)
	}
	return org, nil
}

func (s *OrgService) UpdateOrg(ctx context.Context, role model.Role, orgID string, req dto.UpdateOrgReq) error {
    if !role.HasPermission(model.PermEditOrg) {
        return fmt.Errorf("insufficient permissions")
    }

    if err := s.orgRepo.UpdateOrganization(ctx, orgID, req.Name, req.Email, req.Address); err != nil {
        return fmt.Errorf("failed to update organization: %w", err)
    }

    return nil
}

func (s *OrgService) DeleteOrg(ctx context.Context, orgID string, role model.Role) error {
	if !role.HasPermission(model.PermDeleteOrg) {
		return fmt.Errorf("insufficient permissions")
	}
	
	// 1. check whether it is a personal org or not
	isPersonal, err := s.orgRepo.IsPersonal(ctx, orgID)
	if err != nil {
		return fmt.Errorf("failed to check if org is personal: %w", err)
	}
	if isPersonal {
		return fmt.Errorf("cannot delete personal organization")
	}

	if err := s.orgRepo.DeleteOrganization(ctx, orgID); err != nil {
		return fmt.Errorf("failed to delete org: %w", err)
	}

	return nil
}

func (s *OrgService) GetMembers(ctx context.Context, orgID string) ([]dto.MemberResponse, error) {
	members, err := s.memberRepo.GetMembers(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get members for org: %w", err)
	}
	return members, nil
}

func (s *OrgService) UpdateMemberRole(ctx context.Context, orgID string, req *dto.UpdateMemberRoleRequest) error {
	// Check if user is an active member of the organization
	isMember, err := s.memberRepo.IsMember(ctx, orgID, req.MemberID)
	if err != nil {
		return fmt.Errorf("failed to check if user is an active member: %w", err)
	}
	if !isMember {
		return errors.New("user is not an active member of the organization")
	}

	// Update the member's role in the repository
	if err := s.memberRepo.UpdateMemberRole(ctx, orgID, req.MemberID, req.RoleID); err != nil {
		return fmt.Errorf("failed to update member role: %w", err)
	}

	return nil
}

func (s *OrgService) RemoveMember(ctx context.Context, role *model.Role, orgID, userID string) error {
	// Check permission
	if !role.HasPermission(model.PermManageMembers) {
		return fmt.Errorf("insufficient permissions")
	}

	// Prevent removal if the org would be empty after this operation
	members, err := s.memberRepo.GetMembers(ctx, orgID)
	if err != nil {
		return fmt.Errorf("failed to get members of org: %w", err)
	}
	if len(members) == 1 {
		return fmt.Errorf("organization cannot exist without any member")
	}

	// Remove member
	if err := s.memberRepo.RemoveMember(ctx, orgID, userID); err != nil {
		return fmt.Errorf("failed to remove member from organization: %w", err)
	}

	return nil
}

func (s *OrgService) InviteMember(ctx context.Context, req dto.InviteMemberRequest, role model.Role, orgID, inviterID string) error {
	// Check permissions
	if !role.HasPermission(model.PermManageMembers) {
		return fmt.Errorf("insufficient permissions")
	}

	isPersonal, err := s.orgRepo.IsPersonal(ctx, orgID)
	if err != nil {
		return fmt.Errorf("failed to check personal organization: %w", err)
	}
	if isPersonal {
		return errors.New("cannot invite members to a personal organization")
	}

	if req.RoleID == model.RoleOwnerID {
		return fmt.Errorf("cannot invite user as owner")
	}

	// Get invitee's userID
	inviteeUser, err := s.userRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return fmt.Errorf("user not found")
	}
	inviteeID := inviteeUser.Id

	// Check if invitee is already a member
	isMember, err := s.memberRepo.IsMember(ctx, orgID, inviteeID)
	if err != nil {
		return fmt.Errorf("failed to check if user is already a member: %w", err)
	}
	if isMember {
		return fmt.Errorf("user already a member")
	}

	// Invite the member
	if err := s.memberRepo.InviteMember(ctx, orgID, inviteeID, req.RoleID, inviterID); err != nil {
		return fmt.Errorf("failed to create invitation: %w", err)
	}

	return nil
}

func (s *OrgService) GetInvitations(ctx context.Context, userID string) ([]dto.InvitationResponse, error) {
	// Call memberRepo.GetInvitations
	invitations, err := s.memberRepo.GetInvitations(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations: %w", err)
	}
	return invitations, nil
}

func (s *OrgService) AcceptInvitation(ctx context.Context, orgID, userID string) error {
	// Accept the invitation using the memberRepo
	if err := s.memberRepo.AcceptInvitation(ctx, orgID, userID); err != nil {
		return fmt.Errorf("failed to accept invitation: %w", err)
	}
	return nil
}

func (s *OrgService) DeclineInvitation(ctx context.Context, orgID, userID string) error {
	// Decline the invitation using the memberRepo
	if err := s.memberRepo.DeclineInvitation(ctx, orgID, userID); err != nil {
		return fmt.Errorf("failed to decline invitation: %w", err)
	}
	return nil
}