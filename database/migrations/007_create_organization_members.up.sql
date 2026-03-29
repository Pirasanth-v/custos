CREATE TYPE member_status AS ENUM ('active', 'invited', 'removed');

CREATE TABLE organization_members (
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    added_by UUID REFERENCES users(id),
    status member_status NOT NULL DEFAULT 'active',
    joined_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(org_id, user_id)
);

CREATE INDEX idx_org_members_user_id ON organization_members (user_id);
CREATE INDEX idx_org_members_role_id ON organization_members (role_id);
CREATE INDEX idx_org_members_status ON organization_members (org_id, status);
