-- Alternative approach: Use a single JSONB parameter to avoid parameter ordering issues
-- Drop the previous function if it exists
DROP FUNCTION IF EXISTS spinawheel.create_oauth_state(TIMESTAMPTZ, JSONB, VARCHAR(255), UUID, UUID);

-- Create function with single JSONB parameter
CREATE OR REPLACE FUNCTION spinawheel.create_oauth_state(params JSONB)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO spinawheel.oauth_states (
        state, 
        user_id, 
        store_id, 
        metadata, 
        expires_at
    )
    VALUES (
        params->>'p_state',
        (params->>'p_user_id')::UUID,
        (params->>'p_store_id')::UUID,
        params->'p_metadata',
        (params->>'p_expires_at')::TIMESTAMPTZ
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION spinawheel.create_oauth_state(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION spinawheel.create_oauth_state(JSONB) TO authenticated;