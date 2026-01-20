-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    steroids_interest VARCHAR(10) CHECK (steroids_interest IN ('yes', 'no', '')),
    steroids_purchase_intent TEXT,
    customer_barrier TEXT NOT NULL,
    confidence_factors TEXT NOT NULL,
    primary_interest TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    country_method VARCHAR(50),
    discount_applied BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER,
    discount_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add country_method column if it doesn't exist (for existing databases)
ALTER TABLE survey_responses 
ADD COLUMN IF NOT EXISTS country_method VARCHAR(50);

-- Create index on reference_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_survey_responses_reference_code ON survey_responses(reference_code);

-- Create index on email for admin queries
CREATE INDEX IF NOT EXISTS idx_survey_responses_email ON survey_responses(email);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);

-- Create index on country for geographic analysis
CREATE INDEX IF NOT EXISTS idx_survey_responses_country ON survey_responses(country);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
