CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID NOT NULL REFERENCES users(id),
    status approval_status NOT NULL DEFAULT 'pending',
    context JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_approvals ON approvals(org_id, status);
CREATE INDEX idx_approvals_entity ON approvals (entity_type, entity_id);
