CREATE TABLE transaction_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    edited_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(transaction_id, version_number)
);

CREATE INDEX idx_tvh_transaction_id ON transaction_version_history (transaction_id);
