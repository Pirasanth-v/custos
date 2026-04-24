CREATE TABLE entity_files (
    file_id UUID REFERENCES transaction_bills(id),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (file_id, entity_id, entity_type)
);

CREATE INDEX idx_entity_files_entity ON entity_files (entity_type, entity_id);
CREATE INDEX idx_entity_files_file_id ON entity_files (file_id);
