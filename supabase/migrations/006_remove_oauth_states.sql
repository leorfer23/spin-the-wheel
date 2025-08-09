-- Remove OAuth states table since we're not using it anymore
-- We're passing state directly in the OAuth URL as base64 encoded JSON

-- Drop functions if they exist
DROP FUNCTION IF EXISTS spinawheel.create_oauth_state CASCADE;
DROP FUNCTION IF EXISTS spinawheel.validate_oauth_state CASCADE;
DROP FUNCTION IF EXISTS spinawheel.delete_oauth_state CASCADE;
DROP FUNCTION IF EXISTS spinawheel.cleanup_expired_oauth_states CASCADE;

-- Drop the oauth_states table
DROP TABLE IF EXISTS spinawheel.oauth_states CASCADE;

-- Keep only the store_integrations table for storing OAuth data
-- The store_integrations table already exists and has all we need