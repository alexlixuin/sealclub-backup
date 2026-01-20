-- Add country columns to imported_sms table if they don't exist
DO $$
BEGIN
    -- Add country_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' AND column_name = 'country_name'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN country_name TEXT;
    END IF;

    -- Add country_code column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN country_code TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imported_sms' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE imported_sms ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Create index on country_code for better query performance
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'imported_sms' AND indexname = 'idx_imported_sms_country_code'
    ) THEN
        CREATE INDEX idx_imported_sms_country_code ON imported_sms(country_code);
    END IF;
END $$;
