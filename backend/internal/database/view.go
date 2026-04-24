package database

import (
	"context"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)


func StartViewRefresher(ctx context.Context, db *pgxpool.Pool) {
    ticker := time.NewTicker(10 * time.Minute)
    go func() {
        for {
            select {
            case <-ticker.C:
                _, err := db.Exec(ctx, `
                    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_org_summary;
                    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_breakdown;
                `)
                if err != nil {
                    slog.Error("failed to refresh materialized views", "err", err)
                }
            case <-ctx.Done():
                ticker.Stop()
                return
            }
        }
    }()
}