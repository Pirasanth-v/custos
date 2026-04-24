package handler

import (
	"net/http"
	"strconv"

	"github.com/pirasanth-v/custos/internal/service"
	response "github.com/pirasanth-v/custos/pkg"
	"github.com/pirasanth-v/custos/internal/middleware"
	"log/slog"
)

type DashboardHandler struct {
	svc *service.DashboardService
}

func NewDashboardHandler(svc *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{svc: svc}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrgIDKey).(string)
	if !ok {
		slog.Warn("missing org id in GetOrgFiles")
		response.Error(w, http.StatusBadRequest, "missing org id")
		return
	}

	monthsStr := r.URL.Query().Get("months")
	if monthsStr == "" {
		monthsStr = "6"
	}

	months, err := strconv.Atoi(monthsStr)
	if err != nil || months < 1 {
		months = 6
	}

	dashboard, err := h.svc.GetDashboard(r.Context(), orgID, months)
	if err != nil {
		slog.Error("failed to get dashboard", "error", err)
		response.Error(w, http.StatusInternalServerError, "failed to get dashboard data")
		return
	}

	response.JSON(w, http.StatusOK, dashboard)
}