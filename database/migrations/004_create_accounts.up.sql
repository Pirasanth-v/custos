CREATE TYPE account_type AS ENUM ('bank', 'cash', 'credit', 'wallet','other');

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type account_type NOT NULL,
    currency_id UUID NOT NULL REFERENCES currencies(id),
    initial_balance NUMERIC(19, 4) NOT NULL DEFAULT 0,
    net_balance NUMERIC(19,4) NOT NULL DEFAULT 0,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    deleted_by UUID NULL REFERENCES user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ 
);

CREATE INDEX idx_accounts_currency_id ON accounts (currency_id);
CREATE INDEX idx_accounts_created_by ON accounts (created_by);
