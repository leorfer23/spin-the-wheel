-- Grant service role full access to spinawheel schema
-- This is needed for server-side operations like OAuth callbacks

-- Grant usage on the schema
GRANT USAGE ON SCHEMA spinawheel TO service_role;
GRANT ALL ON SCHEMA spinawheel TO service_role;

-- Grant all privileges on all tables in the schema
GRANT ALL ON ALL TABLES IN SCHEMA spinawheel TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA spinawheel TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA spinawheel TO service_role;

-- Grant privileges on future tables as well
ALTER DEFAULT PRIVILEGES IN SCHEMA spinawheel 
    GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA spinawheel 
    GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA spinawheel 
    GRANT ALL ON FUNCTIONS TO service_role;

-- Also ensure the service role can bypass RLS
ALTER TABLE spinawheel.stores OWNER TO service_role;
ALTER TABLE spinawheel.store_integrations OWNER TO service_role;
ALTER TABLE spinawheel.wheels OWNER TO service_role;
ALTER TABLE spinawheel.campaigns OWNER TO service_role;
ALTER TABLE spinawheel.segments OWNER TO service_role;
ALTER TABLE spinawheel.spins OWNER TO service_role;
ALTER TABLE spinawheel.email_captures OWNER TO service_role;
ALTER TABLE spinawheel.integrations OWNER TO service_role;
ALTER TABLE spinawheel.schedule_templates OWNER TO service_role;

-- Create policies that allow service role to bypass RLS
-- Service role automatically bypasses RLS, but let's be explicit
CREATE POLICY "Service role bypass" ON spinawheel.stores
    FOR ALL USING (auth.role() = 'service_role');
    
CREATE POLICY "Service role bypass" ON spinawheel.store_integrations
    FOR ALL USING (auth.role() = 'service_role');

-- Alternative: If you want to keep using spinawheel schema, ensure it exists
CREATE SCHEMA IF NOT EXISTS spinawheel;

-- Grant usage to authenticated and anon users too (for client-side access)
GRANT USAGE ON SCHEMA spinawheel TO authenticated;
GRANT USAGE ON SCHEMA spinawheel TO anon;

-- Grant appropriate permissions for authenticated users on specific tables
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.stores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.store_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.wheels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.spins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.email_captures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.schedule_templates TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA spinawheel TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA spinawheel TO anon;