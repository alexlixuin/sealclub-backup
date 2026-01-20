-- SMS Verification and Discount Code Tables
-- Run this in your Supabase SQL Editor

-- Table for SMS verification codes
CREATE TABLE IF NOT EXISTS sms_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for generated discount codes
CREATE TABLE IF NOT EXISTS sms_discount_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    discount_percentage INTEGER NOT NULL DEFAULT 10,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for rate limiting SMS requests
CREATE TABLE IF NOT EXISTS sms_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    request_count INTEGER DEFAULT 1,
    reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON sms_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_sms_discount_codes_code ON sms_discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_sms_discount_codes_phone ON sms_discount_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_discount_codes_expires ON sms_discount_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_sms_rate_limits_phone ON sms_rate_limits(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_rate_limits_reset ON sms_rate_limits(reset_time);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sms_verifications_updated_at 
    BEFORE UPDATE ON sms_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_discount_codes_updated_at 
    BEFORE UPDATE ON sms_discount_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_rate_limits_updated_at 
    BEFORE UPDATE ON sms_rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired records (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sms_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER := 0;
BEGIN
    -- Delete expired verification codes
    DELETE FROM sms_verifications 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Delete expired discount codes
    DELETE FROM sms_discount_codes 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Delete expired rate limits
    DELETE FROM sms_rate_limits 
    WHERE reset_time < NOW();
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Table for custom SMS message templates
CREATE TABLE IF NOT EXISTS sms_message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Custom',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for template queries
CREATE INDEX IF NOT EXISTS idx_sms_templates_category ON sms_message_templates(category);
CREATE INDEX IF NOT EXISTS idx_sms_templates_created ON sms_message_templates(created_at);

-- Trigger for updated_at on templates
CREATE TRIGGER update_sms_message_templates_updated_at 
    BEFORE UPDATE ON sms_message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow service role to access all data)
CREATE POLICY "Service role can manage sms_verifications" ON sms_verifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage sms_discount_codes" ON sms_discount_codes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage sms_rate_limits" ON sms_rate_limits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage sms_message_templates" ON sms_message_templates
    FOR ALL USING (auth.role() = 'service_role');
