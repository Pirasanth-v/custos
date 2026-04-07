CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    from_account_id UUID NOT NULL REFERENCES accounts(id),
    to_account_id UUID REFERENCES accounts(id),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_by UUID REFERENCES users(id),
    type transaction_type NOT NULL,
    amount NUMERIC(19,4) NOT NULL CHECK (amount > 0),
    description TEXT,
    category_id UUID REFERENCES categories(id),
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(10) NOT NULL CHECK (status in ('posted', 'deleted', 'pending', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_created_at ON transactions (org_id, from_account_id, created_at DESC);
