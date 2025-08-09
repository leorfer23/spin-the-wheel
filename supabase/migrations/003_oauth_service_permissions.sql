-- Add service-level access for OAuth operations
-- This allows the backend service to manage OAuth states on behalf of authenticated users

-- Create a policy that allows the service to manage OAuth states
-- Note: In production, you should use a service role key instead
CREATE POLICY "Service can manage OAuth states" ON spinawheel.oauth_states
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Create a function that runs with SECURITY DEFINER to bypass RLS
-- Parameters are in alphabetical order for Supabase RPC compatibility
CREATE OR REPLACE FUNCTION spinawheel.create_oauth_state(
    p_expires_at TIMESTAMPTZ,
    p_metadata JSONB,
    p_state VARCHAR(255),
    p_store_id UUID,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO spinawheel.oauth_states (state, user_id, store_id, metadata, expires_at)
    VALUES (p_state, p_user_id, p_store_id, p_metadata, p_expires_at)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION spinawheel.create_oauth_state TO anon;
GRANT EXECUTE ON FUNCTION spinawheel.create_oauth_state TO authenticated;

-- Function to validate and retrieve OAuth state
CREATE OR REPLACE FUNCTION spinawheel.validate_oauth_state(
    p_state VARCHAR(255)
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    store_id UUID,
    metadata JSONB,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Delete expired states first
    DELETE FROM spinawheel.oauth_states
    WHERE expires_at < NOW();
    
    -- Return the valid state if it exists
    RETURN QUERY
    SELECT os.id, os.user_id, os.store_id, os.metadata, os.expires_at
    FROM spinawheel.oauth_states os
    WHERE os.state = p_state
    AND os.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION spinawheel.validate_oauth_state TO anon;
GRANT EXECUTE ON FUNCTION spinawheel.validate_oauth_state TO authenticated;

-- Function to delete OAuth state after successful use
CREATE OR REPLACE FUNCTION spinawheel.delete_oauth_state(
    p_state VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM spinawheel.oauth_states
    WHERE state = p_state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION spinawheel.delete_oauth_state TO anon;
GRANT EXECUTE ON FUNCTION spinawheel.delete_oauth_state TO authenticated;