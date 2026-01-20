-- Store Credit System Database Schema Updates (Updated)

-- Add store_credit column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS store_credit DECIMAL(10, 2) DEFAULT 0.00;

-- Add store_credit_used column to order_logs table
ALTER TABLE public.order_logs 
ADD COLUMN IF NOT EXISTS store_credit_used DECIMAL(10, 2) DEFAULT 0.00;

-- Create store_credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.store_credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_added', 'credit_used', 'credit_refunded')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    order_number INTEGER NULL, -- Reference to order if transaction is order-related
    admin_user_id UUID NULL REFERENCES auth.users(id), -- Admin who made the change
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS store_credit_transactions_user_id_idx ON public.store_credit_transactions (user_id);
CREATE INDEX IF NOT EXISTS store_credit_transactions_type_idx ON public.store_credit_transactions (transaction_type);
CREATE INDEX IF NOT EXISTS store_credit_transactions_order_number_idx ON public.store_credit_transactions (order_number);
CREATE INDEX IF NOT EXISTS store_credit_transactions_created_at_idx ON public.store_credit_transactions (created_at);

-- Enable Row Level Security
ALTER TABLE public.store_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for store_credit_transactions
DO $$
BEGIN
    -- Allow service role full access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow service role full access to store_credit_transactions'
    ) THEN
        CREATE POLICY "Allow service role full access to store_credit_transactions"
        ON public.store_credit_transactions
        FOR ALL
        TO service_role
        USING (true);
    END IF;

    -- Allow users to view their own transactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can view own store credit transactions'
    ) THEN
        CREATE POLICY "Users can view own store credit transactions"
        ON public.store_credit_transactions
        FOR SELECT
        TO authenticated
        USING (user_id IN (SELECT id FROM public.user_profiles WHERE id = auth.uid()));
    END IF;
END $$;

-- Create function to update store credit balance with validation
CREATE OR REPLACE FUNCTION update_store_credit_balance(
    target_user_id UUID,
    credit_amount DECIMAL(10, 2),
    transaction_type TEXT,
    order_num INTEGER DEFAULT NULL,
    admin_id UUID DEFAULT NULL,
    transaction_notes TEXT DEFAULT NULL
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    current_balance DECIMAL(10, 2);
    new_balance DECIMAL(10, 2);
BEGIN
    -- Get current balance
    SELECT COALESCE(store_credit, 0.00) INTO current_balance
    FROM public.user_profiles
    WHERE id = target_user_id;

    -- Calculate new balance
    IF transaction_type = 'credit_added' OR transaction_type = 'credit_refunded' THEN
        new_balance := current_balance + credit_amount;
    ELSIF transaction_type = 'credit_used' THEN
        new_balance := current_balance - credit_amount;
        -- Ensure balance doesn't go negative
        IF new_balance < 0 THEN
            RAISE EXCEPTION 'Insufficient store credit balance. Current: %, Requested: %', current_balance, credit_amount;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type: %', transaction_type;
    END IF;

    -- Update user profile
    UPDATE public.user_profiles
    SET store_credit = new_balance
    WHERE id = target_user_id;

    -- Log transaction
    INSERT INTO public.store_credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        order_number,
        admin_user_id,
        notes
    ) VALUES (
        target_user_id,
        transaction_type,
        credit_amount,
        current_balance,
        new_balance,
        order_num,
        admin_id,
        transaction_notes
    );

    RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION update_store_credit_balance TO service_role;

-- Create view for admin to see user store credit summary
CREATE OR REPLACE VIEW public.user_store_credit_summary AS
SELECT 
    up.id,
    up.full_name,
    u.email,
    up.store_credit,
    up.created_at as account_created,
    (
        SELECT COUNT(*)
        FROM public.store_credit_transactions sct
        WHERE sct.user_id = up.id
    ) as total_transactions,
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.store_credit_transactions sct
        WHERE sct.user_id = up.id AND transaction_type = 'credit_added'
    ) as total_credits_added,
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.store_credit_transactions sct
        WHERE sct.user_id = up.id AND transaction_type = 'credit_used'
    ) as total_credits_used
FROM public.user_profiles up
JOIN auth.users u ON up.id = u.id
WHERE up.store_credit > 0 OR EXISTS (
    SELECT 1 FROM public.store_credit_transactions sct WHERE sct.user_id = up.id
);

-- Grant access to the view
GRANT SELECT ON public.user_store_credit_summary TO service_role;
