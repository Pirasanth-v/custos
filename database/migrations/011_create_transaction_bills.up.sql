CREATE TABLE transaction_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    org_id UUID NOT NULL REFERENCES organizations(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    object_key TEXT NOT NULL UNIQUE,                   -- MinIO path: bills/{orgId}/{txId}/{uuid}-{filename}
    file_name VARCHAR(255) NOT NULL,                    -- original filename shown to user
    mime_type VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size > 0),
    --checksum_sha256 CHAR(64) NOT NULL,
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,        -- false until browser confirms upload
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- index for fetching bills per transaction
CREATE INDEX idx_transaction_bills_transaction_id
    ON transaction_bills(transaction_id)
    WHERE deleted_at IS NULL;

-- index for the files section: all bills per org
CREATE INDEX idx_transaction_bills_org_id
    ON transaction_bills(org_id)
    WHERE deleted_at IS NULL;

-- prevent duplicate object keys (MinIO path must be unique)
CREATE UNIQUE INDEX idx_transaction_bills_object_key
    ON transaction_bills(object_key)
    WHERE deleted_at IS NULL;
