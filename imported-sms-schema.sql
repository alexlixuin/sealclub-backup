-- Add country columns to existing imported_sms table
ALTER TABLE imported_sms 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5),
ADD COLUMN IF NOT EXISTS country_name VARCHAR(100);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_imported_sms_phone ON imported_sms(phone_number);
CREATE INDEX IF NOT EXISTS idx_imported_sms_active ON imported_sms(is_active);
CREATE INDEX IF NOT EXISTS idx_imported_sms_imported_at ON imported_sms(imported_at);
CREATE INDEX IF NOT EXISTS idx_imported_sms_country ON imported_sms(country_code);
CREATE INDEX IF NOT EXISTS idx_imported_sms_country_name ON imported_sms(country_name);

-- Add comment
COMMENT ON TABLE imported_sms IS 'Phone numbers imported from order logs for SMS marketing campaigns';
