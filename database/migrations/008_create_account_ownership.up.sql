CREATE TABLE account_ownership (
    org_id UUID REFERENCES organizations(id),
    account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(org_id, account_id)
);

CREATE INDEX idx_account_ownership_account_id ON account_ownership (account_id);
