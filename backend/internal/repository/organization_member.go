package repository

import (
	"fmt"
	"context"
	"errors"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type OrganizationMemberRepository struct {
	db *pgxpool.Pool
}

func NewOrganizationMemberRepository(db *pgxpool.Pool) *OrganizationMemberRepository {
	return &OrganizationMemberRepository {db: db}
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

func (r *OrganizationMemberRepository) GetMembers(ctx context.Context, orgID string) ([]model.OrganizationMember, error) {
	query := `
		SELECT org_id, user_id, role_id, added_by, status, joined_at, created_at
		FROM organization_members
		WHERE org_id = $1
	`

	rows, err := r.db.Query(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get members: %w", err)
	}
	defer rows.Close()

	var members []model.OrganizationMember
	for rows.Next() {
		var member model.OrganizationMember
		if err := rows.Scan(
			&member.OrgID,
			&member.UserID,
			&member.RoleID,
			&member.AddedBy,
			&member.Status,
			&member.JoinedAt,
			&member.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}
		members = append(members, member)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("iteration error: %w", rows.Err())
	}

	return members, nil
}