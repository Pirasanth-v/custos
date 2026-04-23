package handler

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/service"
	response "github.com/pirasanth-v/custos/pkg"
)

type BillHandler struct {
	billService *service.BillService
}

func NewBillHandler(billService *service.BillService) *BillHandler {
	return &BillHandler{billService}
}

// POST /orgs/{orgId}/transactions/{txId}/bills/presign
func (h *BillHandler) PresignUploads(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in PresignUploads")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in PresignUploads")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in PresignUploads")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	txID := chi.URLParam(r, "txId")
	if txID == "" {
		slog.Warn("missing transaction id in PresignUploads")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	var req dto.PresignBillsRequest
	if !response.Decode(w, r, &req) {
		return
	}

	results, err := h.billService.PresignUploads(r.Context(), txID, orgID, userID, role, req.Files)
	if err != nil {
		mapBillError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, results)
}

// POST /orgs/{orgId}/transactions/{txId}/bills/confirm
func (h *BillHandler) ConfirmUploads(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in ConfirmUploads")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in ConfirmUploads")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in ConfirmUploads")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	txID := chi.URLParam(r, "txId")
	if txID == "" {
		slog.Warn("missing transaction id in ConfirmUploads")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	var req dto.ConfirmBillsRequest
	if !response.Decode(w, r, &req) {
		return
	}

	bills, err := h.billService.ConfirmUploads(r.Context(), txID, orgID, userID, role, req.Bills)
	if err != nil {
		mapBillError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, bills)
}

// GET /orgs/{orgId}/transactions/{txId}/bills
func (h *BillHandler) GetBillsByTransaction(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetBillsByTransaction")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	txID := chi.URLParam(r, "txId")
	if txID == "" {
		slog.Warn("missing transaction id in GetBillsByTransaction")
		response.Error(w, http.StatusBadRequest, "missing transaction id")
		return
	}

	bills, err := h.billService.GetBillsByTransaction(r.Context(), txID, orgID)
	if err != nil {
		mapBillError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, bills)
}

// GET /orgs/{orgId}/files
func (h *BillHandler) GetOrgFiles(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetOrgFiles")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	params := dto.PaginationParams{
		Cursor: r.URL.Query().Get("cursor"),
		Limit:  10, // default
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if lim, err := strconv.Atoi(limitStr); err == nil && lim > 0 && lim <= 100 {
			params.Limit = lim
		}
	}

	bills, err := h.billService.GetBillsByOrg(r.Context(), orgID, params.Cursor, params.Limit)
	if err != nil {
		mapBillError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, bills)
}

// DELETE /orgs/{orgId}/transactions/{txId}/bills/{billId}
func (h *BillHandler) DeleteBill(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in DeleteBill")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in DeleteBill")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in DeleteBill")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	billID := chi.URLParam(r, "billId")
	if billID == "" {
		slog.Warn("missing bill id in DeleteBill")
		response.Error(w, http.StatusBadRequest, "missing bill id")
		return
	}

	if err := h.billService.DeleteBill(r.Context(), billID, orgID, userID, role); err != nil {
		mapBillError(w, err)
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

func mapBillError(w http.ResponseWriter, err error) {
	switch err.Error() {
	case "forbidden":
		response.Error(w, http.StatusForbidden, "insufficient permissions")
	case "bill not found", "transaction not found":
		response.Error(w, http.StatusNotFound, err.Error())
	default:
		if strings.Contains(err.Error(), "cannot have more than") ||
			strings.Contains(err.Error(), "not allowed") ||
			strings.Contains(err.Error(), "exceeds") ||
			strings.Contains(err.Error(), "voided") ||
			strings.Contains(err.Error(), "not uploaded successfully") ||
			strings.Contains(err.Error(), "invalid object key") {
			response.Error(w, http.StatusUnprocessableEntity, err.Error())
		} else {
			slog.Error("bill handler error", "err", err)
			response.Error(w, http.StatusInternalServerError, "something went wrong")
		}
	}
}

func (h *BillHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetStats")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	stats, err := h.billService.GetStats(r.Context(), orgID)
	if err != nil {
		mapBillError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, stats)
}