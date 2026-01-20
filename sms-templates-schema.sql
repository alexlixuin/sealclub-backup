-- SMS Message Templates Table
-- Run this in your Supabase SQL Editor to add custom template functionality

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
ALTER TABLE sms_message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy (allow service role to access all data)
CREATE POLICY "Service role can manage sms_message_templates" ON sms_message_templates
    FOR ALL USING (auth.role() = 'service_role');
