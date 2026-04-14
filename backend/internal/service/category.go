package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
)

type CategoryService struct {
	db           *pgxpool.Pool
	categoryRepo *repository.CategoryRepository
	tranRepo     *repository.TransactionRepository
}

func NewCategoryService(db *pgxpool.Pool, categoryRepo *repository.CategoryRepository, tranRepo *repository.TransactionRepository) *CategoryService {
	return &CategoryService{
		db:           db,
		categoryRepo: categoryRepo,
		tranRepo:     tranRepo,
	}
}

func (s *CategoryService) CreateCategory(ctx context.Context, role model.Role, orgID, userID string, req *dto.CreateCategoryRequest) error {
	if !role.HasPermission(model.PermManageCategories) {
		return errors.New("insufficient permissions")
	}

	// Check if a category with the same name already exists in the organization
	exists, err := s.categoryRepo.CheckCategoryNameExists(ctx, orgID, req.Name)
	if err != nil {
		return fmt.Errorf("failed to check category name uniqueness: %w", err)
	}
	if exists {
		return errors.New("category name already exists in this organization")
	}

	// Generate new category ID
	catID := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)

	category := model.Category{
		ID:        catID,
		OrgID:     orgID,
		Name:      req.Name,
		CreatedBy: userID,
		CreatedAt: now,
		UpdatedAt: now,
		DeletedAt: nil,
	}

	if err := s.categoryRepo.CreateCategory(ctx, category); err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}

// GetCategoriesByOrgID returns all categories for the provided organization that are not deleted.
func (s *CategoryService) GetCategoriesByOrgID(ctx context.Context, role model.Role, orgID string) ([]model.Category, error) {
	return s.categoryRepo.GetCategoriesByOrgID(ctx, orgID)
}

// UpdateCategory updates the name of a category if it belongs to the org and is not deleted.
func (s *CategoryService) UpdateCategory(ctx context.Context, role model.Role, orgID string, req *dto.UpdateCategoryRequest) error {
	if !role.HasPermission(model.PermManageCategories) {
		return errors.New("insufficient permissions")
	}

	// check belongs to org
	ok, err := s.categoryRepo.IsCategoryBelongsToOrg(ctx, orgID, req.ID)
	if err != nil {
		return fmt.Errorf("failed to check category org: %w", err)
	}
	if !ok {
		return errors.New("category not found in this organization")
	}

	// Check if a category with the same name already exists in the org
	exists, err := s.categoryRepo.CheckCategoryNameExists(ctx, orgID, req.Name)
	if err != nil {
		return fmt.Errorf("failed to check category name uniqueness: %w", err)
	}
	if exists {
		return errors.New("category name already exists in this organization")
	}

	if err := s.categoryRepo.UpdateCategory(ctx, req.Name, req.ID); err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}

	return nil
}

// DeleteCategory marks the category as deleted.
func (s *CategoryService) DeleteCategory(ctx context.Context, role model.Role, orgID, catID string) error {
	if !role.HasPermission(model.PermManageCategories) {
		return errors.New("insufficient permissions")
	}

	ok, err := s.categoryRepo.IsCategoryBelongsToOrg(ctx, orgID, catID)
	if err != nil {
		return fmt.Errorf("failed to check category org: %w", err)
	}
	if !ok {
		return errors.New("category not found in this organization")
	}

	// Check if the category has any transactions, and prevent deletion if so.
	hasTxns, err := s.tranRepo.CheckCategoryHasTransactions(ctx, catID)
	if err != nil {
		return fmt.Errorf("failed to check if category is in use: %w", err)
	}
	if hasTxns {
		return errors.New("category is used by one or more transactions")
	}

	if err := s.categoryRepo.DeleteCategory(ctx, catID); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}