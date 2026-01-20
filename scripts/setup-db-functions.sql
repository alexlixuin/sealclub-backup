-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_type TEXT,
    default_expr TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = add_column_if_not_exists.table_name 
        AND column_name = add_column_if_not_exists.column_name
    ) THEN
        EXECUTE format(
            'ALTER TABLE %I ADD COLUMN %I %s %s',
            add_column_if_not_exists.table_name,
            add_column_if_not_exists.column_name,
            add_column_if_not_exists.column_type,
            CASE WHEN add_column_if_not_exists.default_expr IS NOT NULL 
                 THEN 'DEFAULT ' || add_column_if_not_exists.default_expr 
                 ELSE '' 
            END
        );
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to update SMS country information
CREATE OR REPLACE FUNCTION update_sms_country(
    p_phone_number TEXT,
    p_country_name TEXT,
    p_country_code TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- First ensure the columns exist
    PERFORM add_column_if_not_exists('imported_sms', 'country_name', 'TEXT');
    PERFORM add_column_if_not_exists('imported_sms', 'country_code', 'TEXT');
    PERFORM add_column_if_not_exists('imported_sms', 'updated_at', 'TIMESTAMP WITH TIME ZONE', 'NOW()');
    
    -- Update the record
    UPDATE imported_sms 
    SET 
        country_name = COALESCE(p_country_name, country_name),
        country_code = COALESCE(p_country_code, country_code),
        updated_at = NOW()
    WHERE phone_number = p_phone_number
    RETURNING 
        jsonb_build_object(
            'phone_number', phone_number,
            'country_name', country_name,
            'country_code', country_code,
            'updated_at', updated_at
        ) INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating SMS country: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to get columns info
CREATE OR REPLACE FUNCTION get_columns_info(
    table_name TEXT,
    columns TEXT[]
) RETURNS TABLE(column_name TEXT, data_type TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT
    FROM information_schema.columns c
    WHERE c.table_name = get_columns_info.table_name
    AND c.column_name = ANY(columns);
END;
$$ LANGUAGE plpgsql;
