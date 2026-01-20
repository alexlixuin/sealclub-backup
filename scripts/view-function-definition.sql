-- View the definition of the update_sms_country function
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'update_sms_country';
