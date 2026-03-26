package handler

import (
	"net/http"
	"log/slog"
	"encoding/json"

	"github.com/pirasanth-v/custos/internal/service"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	response "github.com/pirasanth-v/custos/pkg"
	"github.com/go-chi/chi/v5"
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
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	orgs, err := h.orgService.ViewOrgsByUserID(r.Context(), userID)
	if err != nil {
		slog.Error("get user orgs failed", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, toOrgResponses(orgs))
}

func (h *OrgHandler) GetOrgByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	org, err := h.orgService.GetOrgByID(r.Context(), orgID)
	if err != nil {
		slog.Error("get organization failed", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, toOrgResponse(*org))
}

func (h *OrgHandler) UpdateOrg(w http.ResponseWriter, r *http.Request) {
	// Decode request body
	var req dto.UpdateOrgReq
	if !response.Decode(w, r, &req) {
		return
	}

	// Retrieve role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok || role == nil {
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Retrieve org ID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok || orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Attempt to update the organization
	if err := h.orgService.UpdateOrg(r.Context(), *role, orgID, req); err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		default:
			slog.Error("update org failed", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "organization updated successfully"})
}

func (h *OrgHandler) DeleteOrg(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok || orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok || role == nil {
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	err := h.orgService.DeleteOrg(r.Context(), orgID, *role)
	if err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "cannot delete personal organization":
			response.Error(w, http.StatusForbidden, "cannot delete personal organization")
		default:
			slog.Error("failed to delete organization", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "organization deleted successfully"})
}

func (h *OrgHandler) GetMembers(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok || orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	members, err := h.orgService.GetMembers(r.Context(), orgID)
	if err != nil {
		slog.Error("failed to get organization members", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, members)
}

func (h *OrgHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok || orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok || role == nil {
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	err := h.orgService.RemoveMember(r.Context(), role, orgID, userID)
	if err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
			return
		case "organization cannot exist without any member":
			response.Error(w, http.StatusUnprocessableEntity, "cannot remove last member")
			return
		default:
			slog.Error("failed to remove member from organization", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "member removed from organization successfully"})
}

func (h *OrgHandler) InviteMember(w http.ResponseWriter, r *http.Request) {
	// Get inviter ID from context
	inviterID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || inviterID == "" {
		response.Error(w, http.StatusBadRequest, "missing inviter ID")
		return
	}

	// Get organization ID from context
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok || orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Get role from context
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok || role == nil {
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	// Decode request
	var req dto.InviteMemberRequest
	if !response.Decode(w, r, &req) {
		return
	}

	// Call service
	err := h.orgService.InviteMember(r.Context(), req, *role, orgID, inviterID)
	if err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
			return
		case "cannot invite user as owner":
			response.Error(w, http.StatusUnprocessableEntity, "cannot invite user as owner")
			return
		case "user not found":
			response.Error(w, http.StatusUnprocessableEntity, "user not found")
			return
		case "user already a member":
			response.Error(w, http.StatusUnprocessableEntity, "user already a member")
			return
		default:
			slog.Error("failed to invite member", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	// Success response
	response.JSON(w, http.StatusCreated, map[string]string{"message": "success"})
}

func (h *OrgHandler) GetInvitations(w http.ResponseWriter, r *http.Request) {
	// Get userID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Call service
	invitations, err := h.orgService.GetInvitations(r.Context(), userID)
	if err != nil {
		slog.Error("get invitations failed", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	// Success
	response.JSON(w, http.StatusOK, invitations)
}

func (h *OrgHandler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	// Get userID from the context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from URL params
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Call service
	err := h.orgService.AcceptInvitation(r.Context(), orgID, userID)
	if err != nil {
		switch err.Error() {
		case "invited member not found or already accepted":
			response.Error(w, http.StatusNotFound, "invited member not found or already accepted")
			return
		default:
			slog.Error("failed to accept invitation", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	// Success
	response.JSON(w, http.StatusOK, map[string]string{"message": "success"})
}

func (h *OrgHandler) DeclineInvitation(w http.ResponseWriter, r *http.Request) {
	// Get userID from the context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	// Get orgID from URL params
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	// Call service
	err := h.orgService.DeclineInvitation(r.Context(), orgID, userID)
	if err != nil {
		switch err.Error() {
		case "invited member not found or already declined/removed":
			response.Error(w, http.StatusNotFound, "invited member not found or already declined/removed")
			return
		default:
			slog.Error("failed to decline invitation", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	// Success
	response.JSON(w, http.StatusOK, map[string]string{"message": "success"})
}