-- Check if columns exist and create them if they don't
DO $$
BEGIN
    -- Check if country_name column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' 
        AND column_name = 'country_name'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN country_name TEXT;
        RAISE NOTICE 'Added country_name column to imported_sms';
    END IF;

    -- Check if country_code column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' 
        AND column_name = 'country_code'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN country_code TEXT;
        RAISE NOTICE 'Added country_code column to imported_sms';
    END IF;

    -- Check if updated_at column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to imported_sms';
    END IF;

    -- Create index on country_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'imported_sms' 
        AND indexname = 'idx_imported_sms_country_code'
    ) THEN
        CREATE INDEX idx_imported_sms_country_code ON imported_sms(country_code);
        RAISE NOTICE 'Created index on country_code';
    END IF;

    -- Create index on country_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'imported_sms' 
        AND indexname = 'idx_imported_sms_country_name'
    ) THEN
        CREATE INDEX idx_imported_sms_country_name ON imported_sms(country_name);
        RAISE NOTICE 'Created index on country_name';
    END IF;

    RAISE NOTICE 'Database schema verification complete';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error verifying database schema: %', SQLERRM;
END $$;
