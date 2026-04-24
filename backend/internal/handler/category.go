package handler

import (
	"net/http"
	"log/slog"

	"github.com/go-chi/chi/v5"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/middleware"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/service"
	response "github.com/pirasanth-v/custos/pkg"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in CreateCategory")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in CreateCategory")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		slog.Warn("missing user id in CreateCategory")
		response.Error(w, http.StatusBadRequest, "missing user id")
		return
	}

	var req dto.CreateCategoryRequest
	if !response.Decode(w, r, &req) {
		return
	}

	if err := h.categoryService.CreateCategory(r.Context(), *role, orgID, userID, &req); err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "category name already exists in this organization":
			response.Error(w, http.StatusConflict, "category name already exists in this organization")
		default:
			slog.Error("failed to create category", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{"message": "category created successfully"})
}

func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in GetCategories")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetCategories")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	categories, err := h.categoryService.GetCategoriesByOrgID(r.Context(), *role, orgID)
	if err != nil {
		slog.Error("failed to get categories", "error", err)
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, categories)
}

func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in UpdateCategory")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in UpdateCategory")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	id := chi.URLParam(r, "categoryID")
	if id == "" {
		slog.Warn("missing category id in UpdateCategory")
		response.Error(w, http.StatusBadRequest, "missing category id")
		return
	}

	var req dto.UpdateCategoryRequest
	if !response.Decode(w, r, &req) {
		return
	}
	req.ID = id

	if err := h.categoryService.UpdateCategory(r.Context(), *role, orgID, &req); err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "category not found in this organization":
			response.Error(w, http.StatusNotFound, "category not found in this organization")
		case "category name already exists in this organization":
			response.Error(w, http.StatusConflict, "category name already exists in this organization")
		default:
			slog.Error("failed to update category", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "category updated successfully"})
}

func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(*model.Role)
	if !ok {
		slog.Warn("missing role in DeleteCategory")
		response.Error(w, http.StatusBadRequest, "missing role")
		return
	}

	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in DeleteCategory")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	id := chi.URLParam(r, "categoryID")
	if id == "" {
		slog.Warn("missing category id in DeleteCategory")
		response.Error(w, http.StatusBadRequest, "missing category id")
		return
	}

	if err := h.categoryService.DeleteCategory(r.Context(), *role, orgID, id); err != nil {
		switch err.Error() {
		case "insufficient permissions":
			response.Error(w, http.StatusForbidden, "insufficient permissions")
		case "category not found in this organization":
			response.Error(w, http.StatusNotFound, "category not found in this organization")
		case "category is used by one or more transactions":
			response.Error(w, http.StatusConflict, "category is used by one or more transactions")
		default:
			slog.Error("failed to delete category", "error", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "deleted successfully"})
}