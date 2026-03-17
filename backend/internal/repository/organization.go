package repository

import (
	"fmt"
	"errors"
	"context"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type OrganizationRepository struct {
	db *pgxpool.Pool
}

func NewOrganizationRepository(db *pgxpool.Pool) *OrganizationRepository {
	return &OrganizationRepository {db: db}
}

func (r *OrganizationRepository) CreateOrganization(ctx context.Context, org model.Organization) error {
	query := `
		INSERT INTO organizations (id, name, email, address, created_by, is_personal)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Exec(ctx, query,
		org.Id,
		org.Name,
		org.Email,
		org.Address,
		org.CreatedBy,
		org.IsPersonal,
	)

	if err != nil {
		return fmt.Errorf("insert organization into db failed: %w", err)
	}

	return nil
}

func (r *OrganizationRepository) DeleteOrganization(ctx context.Context, orgId string) error {
	query := `
		UPDATE organizations
		SET deleted_at = NOW()
		WHERE id = $1
		AND deleted_at IS NULL
	`

	result, err := r.db.Exec(ctx, query, orgId)

	if err != nil {
		return fmt.Errorf("failed to delete organization: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("organization not found to delete")
	}
	
	return nil
}

func (r *OrganizationRepository) UpdateOrganization(
	ctx context.Context,
	orgId string,
	orgName string,
	orgEmail string,
	orgAddress string,
) error {
	query := `
		UPDATE organizations
		SET name = $1,
			email = $2,
			address = $3,
			updated_at = NOW()
		WHERE id = $4
		AND deleted_at IS NULL
	`

	result, err := r.db.Exec(ctx, query,
		orgName,
		orgEmail,
		orgAddress,
		orgId,
	)

	if err != nil {
		return fmt.Errorf("failed to update organization: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("organization not found to update")
	}

	return nil
}

func (r *OrganizationRepository) GetOrgById(ctx context.Context, orgId string) (*model.Organization, error) {
	query := `
		SELECT id, name, email, address, created_by, is_personal, created_at, updated_at, deleted_at
		FROM organizations
		WHERE id = $1 AND deleted_at IS NULL
	`

	org := &model.Organization{}
	err := r.db.QueryRow(ctx, query, orgId).Scan(
		&org.Id,
		&org.Name,
		&org.Email,
		&org.Address,
		&org.CreatedBy,
		&org.IsPersonal,
		&org.CreatedAt,
		&org.UpdatedAt,
		&org.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("organization not found")
		}
		return nil, fmt.Errorf("failed to get organization by id: %w", err)
	}

	return org, nil
}

func (r *OrganizationRepository) GetOrgsByUserID(ctx context.Context, userID string) ([]model.Organization, error) {
    query := `
        SELECT o.id, o.name, o.email, o.address, o.created_by, o.is_personal, o.created_at, o.updated_at, o.deleted_at
        FROM organizations o
        INNER JOIN organization_members om ON o.id = om.org_id
        WHERE om.user_id = $1
        AND om.status = 'active'
        AND o.deleted_at IS NULL
    `

    rows, err := r.db.Query(ctx, query, userID)
    if err != nil {
        return nil, fmt.Errorf("failed to get organizations: %w", err)
    }
    defer rows.Close()

    var organizations []model.Organization
    for rows.Next() {
        var org model.Organization
        if err := rows.Scan(
            &org.Id,
            &org.Name,
            &org.Email,
            &org.Address,
            &org.CreatedBy,
            &org.IsPersonal,
            &org.CreatedAt,
            &org.UpdatedAt,
            &org.DeletedAt,
        ); err != nil {
            return nil, fmt.Errorf("failed to scan organization: %w", err)
        }
        organizations = append(organizations, org)
    }

    return organizations, nil
}