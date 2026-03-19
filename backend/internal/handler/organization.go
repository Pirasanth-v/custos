package handler

import (
	"net/http"
	"log/slog"
	"encoding/json"
	//"time"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	response "github.com/pirasanth-v/custos/pkg"
)

type OrgHandler struct {
	orgService *service.OrgService
}

func NewOrgHandler(s *service.OrgService) *OrgHandler {
	return &OrgHandler{orgService: s}
}

func toOrgResponse(org model.Organization) dto.OrganizationResponse {
	return dto.OrganizationResponse{
		ID:         org.Id,
        Name:       org.Name,
        Email:      org.Email,
        Address:    org.Address,
        IsPersonal: org.IsPersonal,
        CreatedAt:  org.CreatedAt,
	}
}

func toOrgResponses(orgs []model.Organization) []dto.OrganizationResponse {
	var result = make([]dto.OrganizationResponse, len(orgs))
	for i, org := range orgs {
		result[i] = toOrgResponse(org)
	}
	return result
}

func (h *OrgHandler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrganizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		if err := json.NewEncoder(w).Encode(map[string]string{
			"error" : "invalid request body",
		}); err != nil {
			slog.Error("failed to write error response", "error", err)
		}

		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Error("failed to read a value from cookie")
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		if err := json.NewEncoder(w).Encode(map[string]string{"error" : "unauthorized"}); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	if err := h.orgService.CreateOrganization(r.Context(), userID, &req); err != nil {
		slog.Error("create organization failed", "error", err)
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		if err := json.NewEncoder(w).Encode(
			map[string]string{
				"error" : "internal server error",
			},
		); err != nil {
			slog.Error("failed to write response", "error", err)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err:= json.NewEncoder(w).Encode(map[string]string{
		"message": "organization created successfully",
	}); err !=nil {
		slog.Error("Failed to write error response", "error", err)
	}
}

func (h *OrgHandler) GetUserOrgs(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
	}

	orgs, err := h.orgService.ViewOrgsByUserID(r.Context(), userID)
	if err != nil {
		slog.Error("get user orgs failed", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, toOrgResponses(orgs))
}