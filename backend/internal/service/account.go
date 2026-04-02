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

type AccountService struct{
	db *pgxpool.Pool
	currencyRepo *repository.CurrencyRepository
	accRepo *repository.AccountRepository
	ownershipRepo *repository.AccountOwnershipRepository
}

func NewAccountService(db *pgxpool.Pool, currencyRepo *repository.CurrencyRepository, accRepo *repository.AccountRepository, ownershipRepo *repository.AccountOwnershipRepository) *AccountService {
	return &AccountService{
		db: db,
		currencyRepo: currencyRepo,
		accRepo: accRepo,
		ownershipRepo: ownershipRepo,
	}
}

func (s *AccountService) CreateAccount(ctx context.Context, role model.Role, orgID, userID string, req *dto.CreateAccountRequest) error {
	// Check if the role has permission
	if !role.HasPermission(model.PermManageAccounts) {
		return errors.New("insufficient permissions")
	}

	// Validate currency existence
	currency, err := s.currencyRepo.GetByID(ctx, req.CurrencyID)
	if err != nil {
		if err.Error() == "currency not found" {
			return errors.New("currency not found")
		}
		return fmt.Errorf("failed to get currency by id: %w", err)
	}

	// Generate new account ID
	accID := uuid.New().String()

	// Create the account model
	account := model.Account{
		ID:             accID,
		Name:           req.Name,
		Type:           req.Type,
		CurrencyID:     currency.ID,
		InitialBalance: req.InitialBalance,
		NetBalance:     req.InitialBalance, // On creation, net balance equals initial
		Description:    req.Description,
		CreatedBy:      userID,
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	}

	// Begin a transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// Create tx-scoped repositories
	accRepo := s.accRepo.WithTx(tx)
	ownershipRepo := s.ownershipRepo.WithTx(tx)

	// Step 1: Create account
	if err := accRepo.CreateAccount(ctx, account); err != nil {
		return fmt.Errorf("failed to create account: %w", err)
	}

	// Step 2: Add ownership
	if err := ownershipRepo.CreateOwnership(ctx, orgID, accID); err != nil {
		return fmt.Errorf("failed to create ownership: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (s *AccountService) GetAccountByID(ctx context.Context, orgID, accID string) (dto.AccountResponse, error) {
	// Check if the account belongs to the given organization
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return dto.AccountResponse{}, fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return dto.AccountResponse{}, errors.New("account does not belong to this organization")
	}

	// Retrieve account details
	acc, err := s.accRepo.GetAccountByID(ctx, accID)
	if err != nil {
		return dto.AccountResponse{}, fmt.Errorf("failed to get account: %w", err)
	}

	// Retrieve currency details
	currency, err := s.currencyRepo.GetByID(ctx, acc.CurrencyID)
	if err != nil {
		return dto.AccountResponse{}, fmt.Errorf("failed to get currency: %w", err)
	}

	accountResp := dto.AccountResponse{
		ID:             acc.ID,
		Name:           acc.Name,
		Type:           acc.Type,
		CurrencyID:		acc.CurrencyID,
		CurrencyCode:	currency.Code,
		CurrencyName:   currency.Name,
		CurrencySymbol: *currency.Symbol,
		InitialBalance: acc.InitialBalance,
		NetBalance:     acc.NetBalance,
		Description:    acc.Description,
		CreatedBy:      acc.CreatedBy,
		CreatedAt:      acc.CreatedAt,
		UpdatedAt:      acc.UpdatedAt,
	}

	return accountResp, nil
}

func (s *AccountService) GetAccountsByOrgID(ctx context.Context, orgID string) ([]dto.AccountResponse, error) {
	// get all accounts for org
	accounts, err := s.accRepo.GetAccountsByOrgID(ctx, orgID)
	if err != nil {
		return accounts, fmt.Errorf("failed to get accounts: %w", err)
	}

	return accounts, nil
}

func (s *AccountService) UpdateAccount(ctx context.Context, orgID, accID string, role model.Role, req *dto.UpdateAccountRequest) error {
	// Check permissions
	if !role.HasPermission(model.PermManageAccounts) {
		return errors.New("insufficient permissions")
	}

	// Check account ownership 
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return errors.New("account does not belong to this organization")
	}

	// Must change at least one field
	if req.Name == nil && req.Description == nil {
		return errors.New("no fields provided to update")
	}

	// Update account
	if err := s.accRepo.UpdateAccount(ctx, accID, req); err != nil {
		return fmt.Errorf("failed to update account: %w", err)
	}

	return nil
}

func (s *AccountService) DeleteAccount(ctx context.Context, orgID string, role model.Role, userID, accID string) error {
	// Check role permission
	if !role.HasPermission(model.PermManageAccounts) {
		return errors.New("insufficient permissions")
	}

	// Check account ownership
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return errors.New("account does not belong to this organization")
	}

	// Retrieve account
	account, err := s.accRepo.GetAccountByID(ctx, accID)
	if err != nil {
		return fmt.Errorf("failed to get account: %w", err)
	}

	// Check if net balance is zero 
	if account.NetBalance != "0" {
		return errors.New("can't delete account with remaining balance")
	}

	// Soft delete
	if err := s.accRepo.DeleteAccount(ctx, userID, accID); err != nil {
		return fmt.Errorf("failed to delete account: %w", err)
	}

	return nil
}