CREATE TYPE action_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVED', 'REJECTED');

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    action_done_by UUID NOT NULL REFERENCES users(id),
    action action_type NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs ON audit_logs(org_id, entity_id, entity_type);
CREATE INDEX idx_audit_logs_org_created_at ON audit_logs (org_id, created_at DESC);
