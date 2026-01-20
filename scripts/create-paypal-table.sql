-- Create table for storing PayPal order data temporarily
CREATE TABLE IF NOT EXISTS paypal_order_data (
  id SERIAL PRIMARY KEY,
  paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
  order_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paypal_order_data_paypal_order_id ON paypal_order_data(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_paypal_order_data_expires_at ON paypal_order_data(expires_at);

-- Create function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_paypal_orders()
RETURNS void AS $$
BEGIN
  DELETE FROM paypal_order_data WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
