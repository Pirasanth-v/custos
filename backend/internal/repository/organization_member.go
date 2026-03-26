package repository

import (
	"fmt"
	"context"
	"errors"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/dto"
	db "github.com/pirasanth-v/custos/internal/database"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type OrganizationMemberRepository struct {
	db db.DBTX
}

func NewOrganizationMemberRepository(db *pgxpool.Pool) *OrganizationMemberRepository {
	return &OrganizationMemberRepository {db: db}
}

func (r *OrganizationMemberRepository) WithTx(tx pgx.Tx) *OrganizationMemberRepository {
	return &OrganizationMemberRepository {db: tx}
}

func (r *OrganizationMemberRepository) AddMember(ctx context.Context, member model.OrganizationMember) error {
	query := `
		INSERT INTO organization_members (org_id, user_id, role_id, added_by, status)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(ctx, query, 
		member.OrgID,
		member.UserID,
		member.RoleID,
		member.AddedBy,
		member.Status,
	)

	if err != nil {
		return fmt.Errorf("failed to add member into db: %w", err)
	}

	return nil
}

func (r *OrganizationMemberRepository) RemoveMember(ctx context.Context, orgID string, userID string) error {
	query := `
		UPDATE organization_members
		SET status = 'removed'
		WHERE org_id = $1
		AND user_id = $2
		AND status = 'active'
	`

	result, err := r.db.Exec(ctx, query, orgID, userID)

	if err != nil {
		return fmt.Errorf("failed to remove member in db: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *OrganizationMemberRepository) UpdateMemberRole(ctx context.Context, orgID, userID, roleID string) error {
	query := `
		UPDATE organization_members
		SET role_id = $1
		WHERE org_id = $2
		AND user_id = $3
		AND status = 'active'
	`

	result, err := r.db.Exec(ctx, query, roleID, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to update member role in db: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("active member not found to update")
	}

	return nil
}

func (r *OrganizationMemberRepository) IsMember(ctx context.Context, orgID, userID string) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM organization_members
			WHERE org_id = $1 AND user_id = $2 AND status = 'active'
		)
	`
	var exists bool
	err := r.db.QueryRow(ctx, query, orgID, userID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check member existence: %w", err)
	}
	return exists, nil
}

func (r *OrganizationMemberRepository) GetMember(ctx context.Context, orgID, userID string) (*model.OrganizationMember, error) {
	query := `
		SELECT org_id, user_id, role_id, added_by, status, joined_at, created_at
		FROM organization_members
		WHERE org_id = $1
		AND user_id = $2
		AND status != 'active'
	`

	var member model.OrganizationMember
	err := r.db.QueryRow(ctx, query, orgID, userID).Scan(
		&member.OrgID,
		&member.UserID,
		&member.RoleID,
		&member.AddedBy,
		&member.Status,
		&member.JoinedAt,
		&member.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("member not found")
		}
		return nil, fmt.Errorf("failed to get member from db: %w", err)
	}

	return &member, nil
}

func (r *OrganizationMemberRepository) GetMembers(ctx context.Context, orgID string) ([]dto.MemberResponse, error) {
	query := `
		SELECT om.user_id, u.first_name, u.last_name, u.email, om.role_id, r.name, om.status, om.joined_at
		FROM organization_members om
		INNER JOIN roles r ON om.role_id = r.id
		INNER JOIN users u ON om.user_id = u.id 
		WHERE om.org_id = $1
		AND om.status != 'removed'
	`

	rows, err := r.db.Query(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization members: %w", err)
	}
	defer rows.Close()

	members := make([]dto.MemberResponse, 0)
	for rows.Next() {
		var member dto.MemberResponse
		if err := rows.Scan(
			&member.UserID,
			&member.FirstName,
			&member.LastName,
			&member.Email,
			&member.RoleID,
			&member.RoleName,
			&member.Status,
			&member.JoinedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan organization member: %w", err)
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during member iteration: %w", err)
	}

	return members, nil
}

func (r *OrganizationMemberRepository) InviteMember(ctx context.Context, orgID, inviterID, roleID, inviteeID string) error {
	query := `
		INSERT INTO organization_members (org_id, user_id, role_id, invited_by, status)
		VALUES ($1, $2, $3, $4, 'invited')
	`

	result, err := r.db.Exec(ctx, query, orgID, inviterID, roleID, inviteeID)
	if err != nil {
		return fmt.Errorf("failed to invite member in db: %w", err)
	}
	if result.RowsAffected() == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *OrganizationMemberRepository) AcceptInvitation(ctx context.Context, orgID, userID string) error {
	query := `
		UPDATE organization_members
		SET status = 'active',
		    joined_at = NOW()
		WHERE org_id = $1
		  AND user_id = $2
		  AND status = 'invited'
	`

	result, err := r.db.Exec(ctx, query, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to update invitation status: %w", err)
	}
	if result.RowsAffected() == 0 {
		return errors.New("invited member not found or already accepted")
	}

	return nil
}

func (r *OrganizationMemberRepository) DeclineInvitation(ctx context.Context, orgID, userID string) error {
	query := `
		UPDATE organization_members
		SET status = 'removed'
		WHERE org_id = $1
		  AND user_id = $2
		  AND status = 'invited'
	`

	result, err := r.db.Exec(ctx, query, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to decline invitation: %w", err)
	}
	if result.RowsAffected() == 0 {
		return errors.New("invited member not found or already declined/removed")
	}

	return nil
}

func (r *OrganizationMemberRepository) GetInvitations(ctx context.Context, userID string) ([]dto.InvitationResponse, error) {
	query := `
		SELECT 
			om.org_id,
			o.name AS org_name,
			om.role_id,
			r.name AS role_name,
			om.created_at AS invited_at,
			COALESCE(u.first_name, '') AS invited_by
		FROM organization_members om
			JOIN organizations o ON o.id = om.org_id
			JOIN roles r ON r.id = om.role_id
			LEFT JOIN users u ON u.id = om.added_by
		WHERE om.user_id = $1
			AND om.status = 'invited'
			AND o.deleted_at IS NULL
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations from db: %w", err)
	}
	defer rows.Close()

	var invitations []dto.InvitationResponse
	for rows.Next() {
		var invitation dto.InvitationResponse
		err := rows.Scan(
			&invitation.OrgID,
			&invitation.OrgName,
			&invitation.RoleID,
			&invitation.RoleName,
			&invitation.InvitedAt,
			&invitation.InvitedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan invitation: %w", err)
		}
		invitations = append(invitations, invitation)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during invitation iteration: %w", err)
	}
	return invitations, nil
}