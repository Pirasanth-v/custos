package service

import (
	"fmt"
	"context"
	"time"
	"errors"
	"encoding/json"
	"strconv"

	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
)

type TransactionService struct{
	db *pgxpool.Pool
	tranRepo *repository.TransactionRepository
	accRepo *repository.AccountRepository
	ownershipRepo *repository.AccountOwnershipRepository
	auditRepo *repository.AuditLogRepository
}

func NewTransactionService(
	db *pgxpool.Pool, 
	tranRepo *repository.TransactionRepository,
	accRepo *repository.AccountRepository,
	ownershipRepo *repository.AccountOwnershipRepository,
	auditRepo *repository.AuditLogRepository,
) *TransactionService {
	return &TransactionService{
		db:       db,
		tranRepo: tranRepo,
		accRepo:  accRepo,
		ownershipRepo: ownershipRepo,
		auditRepo: auditRepo,
	}
}

func (s *TransactionService) CreateTransaction(ctx context.Context, role model.Role, accID, userID, orgID string, req *dto.CreateTransactionRequest) error {
	// check for permission
	if !role.HasPermission(model.PermCreateTransaction) {
		return errors.New("insufficient permissions")
	}

	// check amount > 0
	amountInt, err := strconv.Atoi(req.Amount)
	if err != nil || amountInt <= 0 {
		return errors.New("transaction amount cannot be zero")
	}

	if req.Type == "transfer" && (req.ToAccountID == nil || *req.ToAccountID == "") {
			return errors.New("to_account_id must be provided for transfer transactions")
	}
	

	// create transaction model
	transaction := model.Transaction{
		ID:            uuid.New().String(),
		FromAccountID: accID,
		CreatedBy:     userID,
		UpdatedBy: 	   userID,
		OrgID:         orgID,
		Type:          req.Type,
		Amount:        req.Amount,
		CategoryID:    &req.CategoryID,
		Description:   req.Description,
		Version: 	   1,
		Status: 	   model.TransactionStatusPosted,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// set ToAccountID for transfer
	if req.Type == "transfer" && req.ToAccountID != nil {
		transaction.ToAccountID = req.ToAccountID
	}

	// serialize transaction for after_state
	afterState, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("failed to marshal transaction for audit log: %w", err)
	}

	// create log
	log := model.AuditLog{
		ID:           uuid.New().String(),
		OrgID:        orgID,
		ActionDoneBy: userID,
		Action:       model.ActionTypeCreate,
		Entity:       model.EntityTypeTransaction,
		EntityID:     transaction.ID,
		BeforeState:  nil,
		AfterState:   afterState,
		Context:      nil,
		CreatedAt:    time.Now(),
	}

	updateNetBalanceBody := dto.UpdateNetBalanceBody{
		Amount:        req.Amount,
		Type:          req.Type,
		FromAccountID: accID,
		ToAccountID:   req.ToAccountID,
	}

	// begin transaction 
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	//create tx-scoped repos
	accRepo := s.accRepo.WithTx(tx)
	tranRepo := s.tranRepo.WithTx(tx)
	auditRepo := s.auditRepo.WithTx(tx)

	fromAccount, err := accRepo.GetAccountByID(ctx, accID)
	if err != nil {
		return fmt.Errorf("failed to get from-account: %w", err)
	}

	belongs, err := s.ownershipRepo.IsBelongs(ctx, accID, orgID)
	if err != nil {
		return fmt.Errorf("failed to check account-organization ownership: %w", err)
	}
	if !belongs {
		return errors.New("from-account does not belong to the same organization")
	}

	toAccountID := ""
	if req.Type == "transfer" && req.ToAccountID != nil {
		toAccountID = *req.ToAccountID
	}

	toAccount, err := accRepo.GetAccountByID(ctx, toAccountID)
	if err != nil {
		return fmt.Errorf("failed to get to-account: %w", err)
	}
	belongs, err = s.ownershipRepo.IsBelongs(ctx, toAccount.ID, orgID)
	if err != nil {
		return fmt.Errorf("failed to check to-account organization ownership: %w", err)
	}
	if !belongs {
		return errors.New("to-account does not belong to the same organization")
	}

	if fromAccount.CurrencyID != toAccount.CurrencyID {
		return errors.New("both accounts should have the same currency")
	}

	// step 1 create transaction
	if err := tranRepo.CreateTransaction(ctx, transaction); err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}

	// step 2 update balance
	if err := accRepo.UpdateNetBalance(ctx, updateNetBalanceBody); err != nil {
		return fmt.Errorf("failed to update net balance: %w", err)
	}

	// step 3 create audit entry
	if err := auditRepo.CreateAuditLog(ctx, log); err != nil {
		return fmt.Errorf("failed to create audit entry: %w", err)
	}

	// commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil

}

func (s *TransactionService) GetTransactionsByAccID(ctx context.Context, accID, orgID string, params dto.PaginationParams) (*dto.PaginatedResponse[model.Transaction], error) {
	// Security Check: Cap the limit to prevent Memory Exhaustion / DDoS
	if params.Limit <= 0 {
		params.Limit = 10 // Default fallback limit
	} else if params.Limit > 100 {
		params.Limit = 100 // Hard maximum limit
	}
	
	// Check if the account belongs to the organization
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return nil, fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return nil, errors.New("account does not belong to the specified organization")
	}

	paginatedResp, err := s.tranRepo.GetTransactionsByAccID(ctx, accID, params.Cursor, params.Limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}

	return paginatedResp, nil
}

func (s *TransactionService) GetTransactionsByOrgID(ctx context.Context, orgID string, params dto.PaginationParams) (*dto.PaginatedResponse[model.Transaction], error) {
	// Security Check: Cap the limit to prevent Memory Exhaustion / DDoS
	if params.Limit <= 0 {
		params.Limit = 10 // Default fallback limit
	} else if params.Limit > 100 {
		params.Limit = 100 // Hard maximum limit
	}

	paginatedResp, err := s.tranRepo.GetTransactionsByOrgID(ctx, orgID, params.Cursor, params.Limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get organization transactions: %w", err)
	}

	return paginatedResp, nil
}

func (s *TransactionService) GetTransactionByID(ctx context.Context, orgID, accID, tranID string) (*model.Transaction, error) {
	// Check if the account belongs to the organization
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return nil, fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return nil, errors.New("account does not belong to the specified organization")
	}

	// Check if the transaction belongs to the account
	trBelongs, err := s.tranRepo.IsTranBelongsToAcc(ctx, tranID, accID)
	if err != nil {
		return nil, fmt.Errorf("failed to check transaction-account ownership: %w", err)
	}
	if !trBelongs {
		return nil, errors.New("transaction does not belong to the specified account")
	}

	transaction, err := s.tranRepo.GetTransactionByID(ctx, tranID)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}

	return transaction, nil
}

func (s *TransactionService) UpdateTransaction(
	ctx context.Context,
	role model.Role,
	req dto.UpdateTransactionRequest,
	orgID, accID, userID, tranID string,
) error {
	// Check if the account belongs to the organization
	belongs, err := s.ownershipRepo.IsBelongs(ctx, orgID, accID)
	if err != nil {
		return fmt.Errorf("failed to check account ownership: %w", err)
	}
	if !belongs {
		return errors.New("account does not belong to the specified organization")
	}

	// Check if transaction belongs to the account
	trBelongs, err := s.tranRepo.IsTranBelongsToAcc(ctx, tranID, accID)
	if err != nil {
		return fmt.Errorf("failed to check transaction-account ownership: %w", err)
	}
	if !trBelongs {
		return errors.New("transaction does not belong to the specified account")
	}

	// Check role has permission to manage transactions
	if !role.HasPermission(model.PermEditTransaction) {
		return errors.New("insufficient permissions")
	}

	// Begin DB transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	tranRepo := s.tranRepo.WithTx(tx)
	accRepo := s.accRepo.WithTx(tx)
	auditRepo := s.auditRepo.WithTx(tx) 

	// Step 1: Fetch the current transaction for reversal
	oldTran, err := tranRepo.GetTransactionByIDForUpdate(ctx, tranID)
	if err != nil {
		return fmt.Errorf("failed to fetch current transaction for update: %w", err)
	}

	// save the before state using marshal
	beforeBytes, err := json.Marshal(oldTran)
	if err != nil {
		return fmt.Errorf("failed to marshal before transaction state: %w", err)
	}

	// Step 2: Reverse net balance according to old transaction details
	reverseReq := dto.UpdateNetBalanceBody{
		FromAccountID: *oldTran.FromAccountID,
		ToAccountID:   oldTran.ToAccountID,
		Type:          *oldTran.Type,
		Amount:        *oldTran.Amount,
	}

	if err := accRepo.ReverseBalance(ctx, reverseReq); err != nil {
		return fmt.Errorf("failed to reverse account balance: %w", err)
	}

	// Step 3: Create updated transaction model
	updatedTran := dto.UpdateTransactionRequest{
		FromAccountID:   req.FromAccountID,
		ToAccountID: req.ToAccountID,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
		CategoryID:  req.CategoryID,
		Version: req.Version,
	}

	// save after state
	afterBytes, err := json.Marshal(updatedTran)
	if err != nil {
		return fmt.Errorf("failed to marshal after transaction state: %w", err)
	}

	// Step 4: Update the transaction
	if err := tranRepo.UpdateTransaction(ctx, userID, tranID, &updatedTran); err != nil {
		return fmt.Errorf("failed to update transaction: %w", err)
	}

	// Step 5: Adjust net balances for the new transaction details
	updateBalReq := dto.UpdateNetBalanceBody{
		FromAccountID: *req.FromAccountID,
		ToAccountID:   req.ToAccountID,
		Type:          *req.Type,
		Amount:        *req.Amount,
	}
	if err := accRepo.UpdateNetBalance(ctx, updateBalReq); err != nil {
		return fmt.Errorf("failed to update account net balance with new transaction details: %w", err)
	}

	// Step 6: Audit log

	// create log
	log := model.AuditLog{
		ID:           uuid.NewString(),
		OrgID:        orgID,
		ActionDoneBy: userID,
		Action:       model.ActionTypeUpdate,
		Entity:       model.EntityTypeTransaction,
		EntityID:     tranID,
		BeforeState:  beforeBytes,
		AfterState:   afterBytes,
		Context:      nil,
		CreatedAt:    time.Now().UTC(),
	}
	if err := auditRepo.CreateAuditLog(ctx, log); err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (s *TransactionService) DeleteTransaction(ctx context.Context, role model.Role, tranID, userID, orgID, accID string) error {
	// Step 1: Check permissions (basic check, actual logic should go here)
	if !role.HasPermission(model.PermDeleteTransaction) {
		return fmt.Errorf("user does not have permission to delete transaction")
	}

	// Step 2: Begin a new transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// Step 3: Create transaction-scoped repo instances
	tranRepo := s.tranRepo.WithTx(tx)
	accRepo := s.accRepo.WithTx(tx)
	auditRepo := s.auditRepo.WithTx(tx)

	// Step 4: Check transaction belongs to the specified account
	belongs, err := tranRepo.IsTranBelongsToAcc(ctx, tranID, accID)
	if err != nil {
		return err
	}
	if !belongs {
		return fmt.Errorf("transaction does not belong to the account")
	}

	// Step 5: Fetch the transaction data (for audit and reverse balance)
	tran, err := tranRepo.GetTransactionByIDForUpdate(ctx, tranID)
	if err != nil {
		return fmt.Errorf("failed to fetch transaction: %w", err)
	}
	beforeBytes, err := json.Marshal(tran)
	if err != nil {
		return fmt.Errorf("failed to marshal before transaction state: %w", err)
	}

	// Step 6: Reverse the balance
	reverseBalReq := dto.UpdateNetBalanceBody{
		FromAccountID: *tran.FromAccountID,
		ToAccountID:   tran.ToAccountID,
		Amount:        *tran.Amount,
		Type:          *tran.Type, 
	}
	if err := accRepo.ReverseBalance(ctx, reverseBalReq); err != nil {
		return fmt.Errorf("failed to reverse net balance: %w", err)
	}

	// Step 7: Delete (soft delete) the transaction
	if err := tranRepo.DeleteTransaction(ctx, tranID, userID); err != nil {
		return fmt.Errorf("failed to delete transaction: %w", err)
	}

	// Step 8: Audit log
	audit := model.AuditLog{
		ID:           uuid.NewString(),
		OrgID:        orgID,
		ActionDoneBy: userID,
		Action:       model.ActionTypeDelete,
		Entity:       model.EntityTypeTransaction,
		EntityID:     tranID,
		BeforeState:  beforeBytes,
		AfterState:   nil,
		Context:      nil,
		CreatedAt:    time.Now().UTC(),
	}
	if err := auditRepo.CreateAuditLog(ctx, audit); err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	// Step 9: Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

