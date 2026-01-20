-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_sms_country(text, text, text);

-- Create or replace the function with the corrected implementation
CREATE OR REPLACE FUNCTION public.update_sms_country(
  p_phone_number TEXT,
  p_country_name TEXT,
  p_country_code TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
  v_updated_at TIMESTAMP WITH TIME ZONE := NOW();
  v_country_name TEXT;
  v_country_code TEXT;
BEGIN
  -- Set default values if null
  v_country_name := COALESCE(p_country_name, '');
  v_country_code := COALESCE(p_country_code, '');
  
  -- Update the record if it exists
  UPDATE imported_sms
  SET 
    country_name = v_country_name,
    country_code = v_country_code,
    updated_at = v_updated_at
  WHERE phone_number = p_phone_number
  RETURNING 
    jsonb_build_object(
      'id', id,
      'phone_number', phone_number,
      'country_name', country_name,
      'country_code', country_code,
      'updated_at', updated_at
    ) INTO v_result;
  
  -- If no rows were updated, insert a new record
  IF v_result IS NULL THEN
    INSERT INTO imported_sms (
      phone_number,
      country_name,
      country_code,
      created_at,
      updated_at
    )
    VALUES (
      p_phone_number,
      v_country_name,
      v_country_code,
      v_updated_at,
      v_updated_at
    )
    RETURNING 
      jsonb_build_object(
        'id', id,
        'phone_number', phone_number,
        'country_name', country_name,
        'country_code', country_code,
        'updated_at', updated_at
      ) INTO v_result;
  END IF;
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error updating SMS country: %', SQLERRM;
END;
$$;

-- Grant execute permission to the appropriate role
GRANT EXECUTE ON FUNCTION public.update_sms_country(TEXT, TEXT, TEXT) TO postgres;

-- Add a comment to the function
COMMENT ON FUNCTION public.update_sms_country IS 'Update or insert country information for a phone number in imported_sms table';
