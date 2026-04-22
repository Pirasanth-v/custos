package service

import (
	"context"
	"sync"

	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/repository"
)

type DashboardService struct {
	repo *repository.DashboardRepository
}

func NewDashboardService(repo *repository.DashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}


func (s *DashboardService) GetDashboard(ctx context.Context, orgID string, months int) (*dto.DashboardResponse, error) {
	var (
		netBalance  string
		pending     int
		monthly     []dto.MonthlySummary
		categories  []dto.CategoryBreakdown
		recent      []dto.TransactionSummary
		errs        = make([]error, 5)
	)

	var wg sync.WaitGroup			// group multiple goroutines 
	wg.Add(5)

	go func() {
		defer wg.Done()
		netBalance, errs[0] = s.repo.GetNetBalance(ctx, orgID)
	}()
	go func() {
		defer wg.Done()
		pending, errs[1] = s.repo.GetPendingCount(ctx, orgID)
	}()
	go func() {
		defer wg.Done()
		monthly, errs[2] = s.repo.GetMonthlySummary(ctx, orgID, months)
	}()
	go func() {
		defer wg.Done()
		categories, errs[3] = s.repo.GetCategoryBreakdown(ctx, orgID)
	}()
	go func() {
		defer wg.Done()
		recent, errs[4] = s.repo.GetRecentTransactions(ctx, orgID, 10)
	}()

	wg.Wait()

	for _, err := range errs {
		if err != nil {
			return nil, err
		}
	}

	return &dto.DashboardResponse{
		NetBalance:    netBalance,
		PendingCount:  pending,
		Monthly:       monthly,
		Categories:    categories,
		Recent:        recent,
	}, nil
}