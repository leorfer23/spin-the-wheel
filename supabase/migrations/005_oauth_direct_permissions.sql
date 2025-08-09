-- Direct permissions approach for testing
-- This grants direct table permissions to anon role for OAuth operations
-- Note: This is less secure but simpler for development

-- Grant permissions on oauth_states table to anon role
GRANT ALL ON spinawheel.oauth_states TO anon;
GRANT USAGE ON SCHEMA spinawheel TO anon;

-- Also ensure the anon role can work with the sequence
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA spinawheel TO anon;

-- Create a simpler policy that allows anon to manage oauth_states
DROP POLICY IF EXISTS "Service can manage OAuth states" ON spinawheel.oauth_states;

CREATE POLICY "Allow anon to manage OAuth states" ON spinawheel.oauth_states
    FOR ALL 
    TO anon
    USING (true) 
    WITH CHECK (true);

-- Also make sure authenticated users can still access
CREATE POLICY "Allow authenticated to manage OAuth states" ON spinawheel.oauth_states
    FOR ALL 
    TO authenticated
    USING (true) 
    WITH CHECK (true);