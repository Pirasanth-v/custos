package handler

import (
	"net/http"

	"github.com/pirasanth-v/custos/internal/service"
	response "github.com/pirasanth-v/custos/pkg"
	"github.com/go-chi/chi/v5"
)

type CurrencyHandler struct {
	currencyService *service.CurrencyService
}

func NewCurrencyHandler(s *service.CurrencyService) *CurrencyHandler {
	return &CurrencyHandler{currencyService: s}
}

func (h *CurrencyHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	currencies, err := h.currencyService.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to get currencies")
		return
	}

	response.JSON(w, http.StatusOK, currencies, map[string]string{
		"Cache-control": "public, max-age=86400", // cache for 24 hrs
	})
}

func (h *CurrencyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		response.Error(w, http.StatusBadRequest, "missing currency id")
		return
	}

	currency, err := h.currencyService.GetByID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, "currency not found")
		return
	}

	response.JSON(w, http.StatusOK, currency, map[string]string{
		"Cache-control": "public, max-age=86400", // cache for 24 hrs
	})
}


