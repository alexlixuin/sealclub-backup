-- This script fixes the database schema and updates existing records
-- to ensure phone numbers are properly stored in the billing_info

-- First, let's create a function to log our migration actions
CREATE OR REPLACE FUNCTION log_migration(action_name TEXT, action_details JSONB) RETURNS VOID AS $$
BEGIN
  -- Use the correct column names: event and data (not action and details)
  INSERT INTO checkout_logs (event, data, created_at)
  VALUES (action_name, action_details, NOW());
EXCEPTION
  WHEN OTHERS THEN
    -- Log errors to the server log if we can't insert into checkout_logs
    RAISE NOTICE 'Failed to log migration action: %, %', action_name, action_details;
END;
$$ LANGUAGE plpgsql;

-- Now let's update existing records to ensure they have a phone field in billing_info
DO $$
DECLARE
  order_record RECORD;
  updated_billing_info JSONB;
  phone_value TEXT;
  update_count INT := 0;
BEGIN
  -- Log the start of the migration
  PERFORM log_migration('database_migration_start', jsonb_build_object(
    'description', 'Adding phone field to billing_info for existing orders',
    'started_at', NOW()
  ));

  -- Loop through all order records
  FOR order_record IN SELECT id, order_number, billing_info, metadata FROM order_logs
  LOOP
    -- Skip if billing_info is null
    IF order_record.billing_info IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Check if billing_info already has a phone field
    IF order_record.billing_info->>'phone' IS NULL THEN
      -- Try to find phone in different locations
      phone_value := NULL;
      
      -- Check if phone exists in billing_info->address
      IF order_record.billing_info->'address'->>'phone' IS NOT NULL THEN
        phone_value := order_record.billing_info->'address'->>'phone';
      -- Check if phone exists in metadata
      ELSIF order_record.metadata->>'customer_phone' IS NOT NULL THEN
        phone_value := order_record.metadata->>'customer_phone';
      END IF;
      
      -- If we found a phone number, add it to billing_info
      IF phone_value IS NOT NULL THEN
        updated_billing_info := order_record.billing_info;
        updated_billing_info := jsonb_set(updated_billing_info, '{phone}', to_jsonb(phone_value));
        
        -- Update the record
        UPDATE order_logs
        SET billing_info = updated_billing_info
        WHERE id = order_record.id;
        
        update_count := update_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  -- Log the completion of the migration
  PERFORM log_migration('database_migration_complete', jsonb_build_object(
    'description', 'Added phone field to billing_info for existing orders',
    'records_updated', update_count,
    'completed_at', NOW()
  ));
  
  RAISE NOTICE 'Migration complete. Updated % records.', update_count;
END;
$$ LANGUAGE plpgsql;

-- Also check if metadata column exists, and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'order_logs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE order_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    
    -- Log that we added the metadata column
    INSERT INTO checkout_logs (event, data)
    VALUES ('schema_update', jsonb_build_object(
      'description', 'Added metadata column to order_logs table',
      'timestamp', NOW()
    ));
  END IF;
END $$;

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema fixed successfully!';
END $$;
