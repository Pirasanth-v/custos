package handler

import (
	"net/http"
	"log/slog"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	response "github.com/pirasanth-v/custos/pkg"
)

type TransactionHandler struct {
	tranService *service.TransactionService
}

func NewTransactionHandler(s *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{ tranService: s }
}

func (h *TransactionHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Get accID from request parameters
	accID := chi.URLParam(r, "accID")
	if accID == "" {
		slog.Warn("missing account id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// decode request
	var req dto.CreateTransactionRequest
	if !response.Decode(w, r, &req) {
		return
	}

	// call service
	if err := h.tranService.CreateTransaction(
		r.Context(),
		*role,
		accID,
		userID,
		orgID,
		&req,
	); err != nil {
		switch err.Error() {
		case "insufficient permissions":
			slog.Warn("insufficient permissions in CreateTransaction")
			response.Error(w, http.StatusForbidden, "insufficient permissions")
			return
		case "transaction amount cannot be zero":
			slog.Warn("transaction amount cannot be zero in CreateTransaction")
			response.Error(w, http.StatusUnprocessableEntity, "transaction amount cannot be zero")
			return
		case "to_account_id must be provided for transfer transactions":
			slog.Warn("missing to_account_id for transfer in CreateTransaction")
			response.Error(w, http.StatusUnprocessableEntity, "destination account must be provided for transfer transactions")
			return
		case "both accounts should have the same currency":
			slog.Warn("both accounts should have the same currency")
			response.Error(w, http.StatusUnprocessableEntity, "both accounts should have the same currency")
			return
		default:
			slog.Error("failed to create transaction", "err", err)
			response.Error(w, http.StatusInternalServerError, "failed to create transaction")
			return
		}
	}

	response.Success(w, http.StatusCreated, "transaction created successfully")

}

func (h *TransactionHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Get accID from request parameters
	accID := chi.URLParam(r, "accID")
	if accID == "" {
		slog.Warn("missing account id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get tranID from request parameters
	tranID := chi.URLParam(r, "tranID")
	if tranID == "" {
		slog.Warn("missing transaction id in UpdateTransaction")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// decode request
	var req dto.UpdateTransactionRequest
	if !response.Decode(w, r, &req) {
		return
	}

	err := h.tranService.UpdateTransaction(
		r.Context(),
		*role,
		req,
		orgID,
		accID,
		userID,
		tranID,
	)
	if err != nil {
		switch err.Error() {
		case "insufficient permissions":
			slog.Warn("insufficient permissions in CreateTransaction")
			response.Error(w, http.StatusForbidden, "insufficient permissions")
			return
		case "account does not belong to the specified organization":
			slog.Warn("account does not belong to the specified organization")
			response.Error(w, http.StatusForbidden, "account does not belong to the specified organization")
			return
		case "transaction does not belong to the specified account":
			slog.Warn("transaction does not belong to the specified account")
			response.Error(w, http.StatusForbidden, "transaction does not belong to the specified account")
			return
		default:
			slog.Error("failed to update transaction", "err", err)
			response.Error(w, http.StatusInternalServerError, "failed to update transaction")
			return
		}
	}

	response.Success(w, http.StatusOK, "transaction updated successfully")

}

func (h *TransactionHandler) DeleteTransaction(w http.ResponseWriter, r *http.Request) {
	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Get accID from request parameters
	accID := chi.URLParam(r, "accID")
	if accID == "" {
		slog.Warn("missing account id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get tranID from request parameters
	tranID := chi.URLParam(r, "tranID")
	if tranID == "" {
		slog.Warn("missing transaction id in UpdateTransaction")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Call the service to delete the transaction
	err := h.tranService.DeleteTransaction(r.Context(), *role, tranID, userID, orgID, accID)
	if err != nil {
		switch err.Error() {
		case "user does not have permission to delete transaction":
			slog.Warn("insufficient permissions in DeleteTransaction")
			response.Error(w, http.StatusForbidden, "insufficient permissions")
			return
		case "transaction does not belong to the account":
			slog.Warn("transaction does not belong to the specified account")
			response.Error(w, http.StatusNotFound, "transaction does not belong to the specified account")
			return
		default:
			slog.Error("failed to delete transaction", "err", err)
			response.Error(w, http.StatusInternalServerError, "failed to delete transaction")
			return
		}
	}

	response.Success(w, http.StatusOK, "transaction deleted successfully")
}

func (h *TransactionHandler) GetTransactionByID(w http.ResponseWriter, r *http.Request) {
	// Get accID from request parameters
	accID := chi.URLParam(r, "accID")
	if accID == "" {
		slog.Warn("missing account id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get tranID from request parameters
	tranID := chi.URLParam(r, "tranID")
	if tranID == "" {
		slog.Warn("missing transaction id in UpdateTransaction")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// call service to fetch transaction by ID
	transaction, err := h.tranService.GetTransactionByID(r.Context(), orgID, accID, tranID)
	if err != nil {
		switch err.Error() {
		case "account does not belong to the specified organization":
			slog.Warn("account does not belong to this org for GetTransactionByID")
			response.Error(w, http.StatusForbidden, "account does not belong to this organization")
			return
		case "transaction does not belong to the specified account":
			slog.Warn("transaction does not belong to the specified account")
			response.Error(w, http.StatusNotFound, "transaction does not belong to the specified account")
			return
		default:
			slog.Error("failed to get transaction by id", "err", err)
			response.Error(w, http.StatusInternalServerError, "failed to get transaction")
			return
		}
	}

	response.JSON(w, http.StatusOK, &transaction)
}

func (h *TransactionHandler) GetTransactionsByAccID(w http.ResponseWriter, r *http.Request) {
	// Get accID from request parameters
	accID := chi.URLParam(r, "accID")
	if accID == "" {
		slog.Warn("missing account id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Parse query params for pagination (optional: cursor, limit)
	params := dto.PaginationParams{
		Cursor: r.URL.Query().Get("cursor"),
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if lim, err := strconv.Atoi(limitStr); err == nil {
			params.Limit = lim
		}
	}

	// Call service
	transactions, err := h.tranService.GetTransactionsByAccID(r.Context(), accID, orgID, params)
	if err != nil {
		switch err.Error() {
		case "account does not belong to the specified organization":
			slog.Warn("account does not belong to this org for GetTransactionsByAccID")
			response.Error(w, http.StatusForbidden, "account does not belong to this organization")
			return
		default:
			slog.Error("failed to get transactions by account id", "err", err)
			response.Error(w, http.StatusInternalServerError, "failed to get transactions")
			return
		}
	}

	response.JSON(w, http.StatusOK, &transactions)
}

func (h *TransactionHandler) GetTransactionsByOrgID(w http.ResponseWriter, r *http.Request) {
	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetTransactionsByOrgID")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Parse query params for pagination (optional: cursor, limit)
	params := dto.PaginationParams{
		Cursor: r.URL.Query().Get("cursor"),
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if lim, err := strconv.Atoi(limitStr); err == nil {
			params.Limit = lim
		}
	}

	// Call service
	transactions, err := h.tranService.GetTransactionsByOrgID(r.Context(), orgID, params)
	if err != nil {
		slog.Error("failed to get transactions by org id", "err", err)
		response.Error(w, http.StatusInternalServerError, "failed to get organization transactions")
		return
	}

	response.JSON(w, http.StatusOK, transactions)
}