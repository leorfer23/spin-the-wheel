-- Create store_integrations table for platform-specific OAuth data
CREATE TABLE IF NOT EXISTS spinawheel.store_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL,
  platform spinawheel.platform_type NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NULL,
  token_expires_at TIMESTAMPTZ NULL,
  platform_store_id VARCHAR(255) NULL,
  platform_store_name VARCHAR(255) NULL,
  platform_store_domain VARCHAR(255) NULL,
  platform_store_email VARCHAR(255) NULL,
  platform_metadata JSONB NULL,
  status VARCHAR(50) NULL DEFAULT 'active',
  connected_at TIMESTAMPTZ NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT store_integrations_store_id_platform_key UNIQUE (store_id, platform),
  CONSTRAINT store_integrations_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES spinawheel.stores (id) ON DELETE CASCADE
);

-- Add integration_id column to stores table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'spinawheel' 
    AND table_name = 'stores' 
    AND column_name = 'integration_id'
  ) THEN
    ALTER TABLE spinawheel.stores 
    ADD COLUMN integration_id UUID REFERENCES spinawheel.store_integrations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_integrations_store_id ON spinawheel.store_integrations(store_id);
CREATE INDEX IF NOT EXISTS idx_store_integrations_platform ON spinawheel.store_integrations(platform);
CREATE INDEX IF NOT EXISTS idx_store_integrations_status ON spinawheel.store_integrations(status);
CREATE INDEX IF NOT EXISTS idx_stores_integration_id ON spinawheel.stores(integration_id);

-- Enable Row Level Security
ALTER TABLE spinawheel.store_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_integrations (users can only access their own store integrations)
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

-- Grant permissions for service role (server-side operations)
GRANT ALL ON spinawheel.store_integrations TO service_role;

-- Grant permissions for authenticated users (client-side operations)
GRANT SELECT, INSERT, UPDATE, DELETE ON spinawheel.store_integrations TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA spinawheel TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA spinawheel TO service_role;

-- Update trigger for updated_at column
CREATE TRIGGER update_store_integrations_updated_at 
    BEFORE UPDATE ON spinawheel.store_integrations
    FOR EACH ROW EXECUTE FUNCTION spinawheel.update_updated_at_column();

-- Add platform type 'tiendanube' if it doesn't exist
DO $$ 
BEGIN
  -- Check if 'tiendanube' exists in the platform_type enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'tiendanube' 
    AND enumtypid = (
      SELECT oid FROM pg_type 
      WHERE typname = 'platform_type' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'spinawheel')
    )
  ) THEN
    -- Add the new value to the enum
    ALTER TYPE spinawheel.platform_type ADD VALUE IF NOT EXISTS 'tiendanube';
  END IF;
END $$;