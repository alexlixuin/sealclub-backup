-- Create the order_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB NOT NULL,
    shipping_info JSONB NOT NULL,
    billing_info JSONB NOT NULL, -- This will now include phone
    payment_status TEXT NOT NULL,
    is_test_order BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS order_logs_order_number_idx ON public.order_logs (order_number);
CREATE INDEX IF NOT EXISTS order_logs_session_id_idx ON public.order_logs (session_id);
CREATE INDEX IF NOT EXISTS order_logs_customer_email_idx ON public.order_logs (customer_email);
CREATE INDEX IF NOT EXISTS order_logs_is_test_order_idx ON public.order_logs (is_test_order);

-- Create the checkout_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.checkout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on event for faster lookups
CREATE INDEX IF NOT EXISTS checkout_logs_event_idx ON public.checkout_logs (event);

-- Create a function to update the updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the trigger exists before creating it
DO $$
BEGIN
    -- Check if the trigger already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_order_logs_updated_at'
    ) THEN
        -- Create the trigger if it doesn't exist
        CREATE TRIGGER update_order_logs_updated_at
        BEFORE UPDATE ON public.order_logs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for order_logs (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow service role full access to order_logs'
    ) THEN
        CREATE POLICY "Allow service role full access to order_logs"
        ON public.order_logs
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END $$;

-- Create policies for checkout_logs (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow service role full access to checkout_logs'
    ) THEN
        CREATE POLICY "Allow service role full access to checkout_logs"
        ON public.checkout_logs
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END $$;
