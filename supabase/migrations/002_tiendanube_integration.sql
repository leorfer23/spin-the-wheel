-- Add platform-specific integration support to existing schema

-- OAuth states table for managing OAuth flow
CREATE TABLE spinawheel.oauth_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    metadata JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store integrations table for platform-specific data
CREATE TABLE spinawheel.store_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    platform spinawheel.platform_type NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    platform_store_id VARCHAR(255),
    platform_store_name VARCHAR(255),
    platform_store_domain VARCHAR(255),
    platform_store_email VARCHAR(255),
    platform_metadata JSONB,
    status VARCHAR(50) DEFAULT 'active',
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, platform)
);

-- Add integration_id to stores table to link with store_integrations
ALTER TABLE spinawheel.stores 
ADD COLUMN integration_id UUID REFERENCES spinawheel.store_integrations(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_oauth_states_state ON spinawheel.oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON spinawheel.oauth_states(expires_at);
CREATE INDEX idx_store_integrations_store_id ON spinawheel.store_integrations(store_id);
CREATE INDEX idx_store_integrations_platform ON spinawheel.store_integrations(platform);
CREATE INDEX idx_stores_integration_id ON spinawheel.stores(integration_id);

-- Enable RLS
ALTER TABLE spinawheel.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.store_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oauth_states
CREATE POLICY "Users can view their own OAuth states" ON spinawheel.oauth_states
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own OAuth states" ON spinawheel.oauth_states
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own OAuth states" ON spinawheel.oauth_states
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for store_integrations (via store ownership)
CREATE POLICY "Users can view integrations from their stores" ON spinawheel.store_integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = store_integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create integrations for their stores" ON spinawheel.store_integrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = store_integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update integrations from their stores" ON spinawheel.store_integrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = store_integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete integrations from their stores" ON spinawheel.store_integrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = store_integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION spinawheel.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
    DELETE FROM spinawheel.oauth_states
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (requires pg_cron extension or manual periodic calls)
-- This is a placeholder comment for setting up automated cleanup