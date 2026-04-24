package handler

import (
	"net/http"
	"log/slog"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	response "github.com/pirasanth-v/custos/pkg"
	"github.com/go-chi/chi/v5"
)

type AccountHandler struct {
	accService *service.AccountService
}

func NewAccountHandler(s *service.AccountService) *AccountHandler {
	return &AccountHandler{ accService: s}
}

func (h *AccountHandler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in CreateAccount")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in CreateAccount")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateAccount")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Decode request
	var req dto.CreateAccountRequest
	if !response.Decode(w, r, &req) {
		slog.Warn("invalid request payload for CreateAccount")
		return
	}

	// Call service
	err := h.accService.CreateAccount(r.Context(), *role, orgID, userID, &req)
	if err != nil {
		slog.Error("failed to create account", "error", err)
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "currency not found":
			response.Error(w, http.StatusNotFound, "currency not found")
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// Success
	response.JSON(w, http.StatusCreated, map[string]string{"message": "account created successfully"})
}

func (h *AccountHandler) GetAccountsByOrgID(w http.ResponseWriter, r *http.Request) {
	// get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetAccountsByOrgID")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// call service 
	accounts, err := h.accService.GetAccountsByOrgID(r.Context(), orgID)
	if err != nil {
		slog.Error("failed to get accounts", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	// encodde into body 
	response.JSON(w, http.StatusOK, &accounts)
}

func (h *AccountHandler) GetAccountByID(w http.ResponseWriter, r *http.Request) {
	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetAccountByID")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Get accID from URL params
	accID := chi.URLParam(r, "accId")
	if accID == "" {
		slog.Warn("missing account id in GetAccountByID")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Call service to get account
	account, err := h.accService.GetAccountByID(r.Context(), orgID, accID)
	if err != nil {
		slog.Error("failed to get account", "error", err)
		switch err.Error() {
		case "account does not belong to this organization":
			response.Error(w, http.StatusForbidden, "account not found")
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// Encode result
	response.JSON(w, http.StatusOK, &account)
}

func (h *AccountHandler) UpdateAccount(w http.ResponseWriter, r *http.Request) {
	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in UpdateAccount")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Get accID from URL params
	accID := chi.URLParam(r, "accId")
	if accID == "" {
		slog.Warn("missing account id in UpdateAccount")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in UpdateAccount")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Decode request body
	var req dto.UpdateAccountRequest
	if !response.Decode(w, r, &req) {
		slog.Warn("invalid request payload for UpdateAccount")
		return
	}

	// Call service to update account
	err := h.accService.UpdateAccount(r.Context(), orgID, accID, *role, &req)
	if err != nil {
		slog.Error("failed to update account", "error", err)
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "account does not belong to this organization":
			response.Error(w, http.StatusForbidden, "account not found")
		case "no fields provided to update":
			response.Error(w, http.StatusConflict, "nothing to update")
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "account updated successfully"})
}

func (h *AccountHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	// Get orgID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in DeleteAccount")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in DeleteAccount")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get accID from URL params
	accID := chi.URLParam(r, "accId")
	if accID == "" {
		slog.Warn("missing account id in DeleteAccount")
		response.Error(w, http.StatusBadRequest, "missing account id")
		return
	}

	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in DeleteAccount")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Call service
	err := h.accService.DeleteAccount(r.Context(), orgID, *role, userID, accID)
	if err != nil {
		slog.Error("failed to delete account", "error", err)
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "account does not belong to this organization":
			response.Error(w, http.StatusForbidden, "account not found")
		case "can't delete account with remaining balance":
			response.Error(w, http.StatusConflict, "account has remaining balance")
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// Success
	response.JSON(w, http.StatusOK, map[string]string{"message": "account deleted successfully"})
}