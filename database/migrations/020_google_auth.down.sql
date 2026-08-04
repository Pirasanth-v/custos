DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM users
        WHERE password_hash IS NULL
    ) THEN
        RAISE EXCEPTION
            'Cannot rollback: users exist with NULL password_hash';
    END IF;
END $$;

ALTER TABLE users
    DROP COLUMN IF EXISTS google_id,
    ALTER COLUMN password_hash SET NOT NULL;