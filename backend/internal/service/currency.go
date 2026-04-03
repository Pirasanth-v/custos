package service

import (
	"context"
	"fmt"

	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/repository"
)

type CurrencyService struct {
	currencyRepo *repository.CurrencyRepository
}

func NewCurrencyService(currencyRepo *repository.CurrencyRepository) *CurrencyService {
	return &CurrencyService{
		currencyRepo: currencyRepo,
	}
}

// GetAll returns all currencies.
func (s *CurrencyService) GetAll(ctx context.Context) ([]model.Currency, error) {
	currencies, err := s.currencyRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get currencies: %w", err)
	}
	return currencies, nil
}

// GetByID returns a currency by ID.
func (s *CurrencyService) GetByID(ctx context.Context, id string) (model.Currency, error) {
	currency, err := s.currencyRepo.GetByID(ctx, id)
	if err != nil {
		return model.Currency{}, fmt.Errorf("failed to get currency by id: %w", err)
	}
	return currency, nil
}