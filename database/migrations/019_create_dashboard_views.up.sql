CREATE MATERIALIZED VIEW mv_monthly_org_summary AS
SELECT 
    org_id,
    DATE_TRUNC('month', created_at) AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
FROM transactions
WHERE deleted_at IS NULL    
    AND status = 'posted'
GROUP BY org_id, DATE_TRUNC('month', created_at)
WITH DATA;

CREATE UNIQUE INDEX idx_mv_monthly_org_summary
    ON mv_monthly_org_summary(org_id, month);

CREATE MATERIALIZED VIEW mv_category_breakdown AS
SELECT 
    t.org_id,
    DATE_TRUNC('month', t.created_at) AS month,
    c.name AS category_name,
    SUM(t.amount) AS total
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.deleted_at IS NULL
    AND t.type = 'expense'
    AND t.status = 'posted'
GROUP BY t.org_id, c.name, DATE_TRUNC('month', t.created_at)
WITH DATA;

CREATE UNIQUE INDEX idx_mv_category_breakdown
    ON mv_category_breakdown(org_id, month, category_name);