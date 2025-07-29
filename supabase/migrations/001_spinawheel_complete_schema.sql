-- Spin The Wheel Platform - Complete Schema Migration
-- This file consolidates all database migrations into the spinawheel schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types in spinawheel schema
CREATE TYPE spinawheel.platform_type AS ENUM ('shopify', 'tienda_nube', 'custom');
CREATE TYPE spinawheel.plan_tier AS ENUM ('free', 'starter', 'growth', 'enterprise');
CREATE TYPE spinawheel.prize_type AS ENUM ('discount', 'product', 'custom', 'no_prize');
CREATE TYPE spinawheel.email_provider AS ENUM ('mailchimp', 'klaviyo', 'sendgrid', 'activecampaign', 'custom');

-- Stores table
CREATE TABLE spinawheel.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    platform spinawheel.platform_type NOT NULL,
    store_url VARCHAR(255) NOT NULL,
    api_credentials JSONB,
    plan_tier spinawheel.plan_tier DEFAULT 'free',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, store_name)
);

-- Wheels table
CREATE TABLE spinawheel.wheels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    theme_preset VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    custom_css TEXT,
    custom_js TEXT,
    embed_code TEXT NOT NULL,
    schedule_config JSONB DEFAULT '{
      "enabled": false,
      "timezone": "UTC",
      "dateRange": {
        "startDate": null,
        "endDate": null
      },
      "timeSlots": {
        "enabled": false,
        "slots": []
      },
      "weekDays": {
        "enabled": false,
        "days": [0, 1, 2, 3, 4, 5, 6]
      },
      "specialDates": {
        "blacklistDates": [],
        "whitelistDates": []
      }
    }'
);

-- Campaigns table
CREATE TABLE spinawheel.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wheel_id UUID NOT NULL REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    spin_limit_per_user INTEGER,
    total_spin_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segments table
CREATE TABLE spinawheel.segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wheel_id UUID NOT NULL REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    weight INTEGER DEFAULT 1,
    prize_type spinawheel.prize_type NOT NULL,
    prize_data JSONB,
    inventory_limit INTEGER,
    inventory_used INTEGER DEFAULT 0,
    CONSTRAINT weight_positive CHECK (weight > 0),
    CONSTRAINT inventory_check CHECK (inventory_used <= inventory_limit OR inventory_limit IS NULL)
);

-- Spins table
CREATE TABLE spinawheel.spins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES spinawheel.campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    segment_won_id UUID NOT NULL REFERENCES spinawheel.segments(id),
    spin_result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    claim_code VARCHAR(50)
);

-- Email captures table
CREATE TABLE spinawheel.email_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spin_id UUID NOT NULL REFERENCES spinawheel.spins(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    marketing_consent BOOLEAN DEFAULT false,
    synced_to_provider BOOLEAN DEFAULT false,
    sync_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations table
CREATE TABLE spinawheel.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    provider spinawheel.email_provider NOT NULL,
    api_credentials JSONB NOT NULL,
    settings JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    UNIQUE(store_id, provider)
);

-- Schedule templates table
CREATE TABLE spinawheel.schedule_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_stores_user_id ON spinawheel.stores(user_id);
CREATE INDEX idx_wheels_store_id ON spinawheel.wheels(store_id);
CREATE INDEX idx_campaigns_wheel_id ON spinawheel.campaigns(wheel_id);
CREATE INDEX idx_segments_wheel_id ON spinawheel.segments(wheel_id);
CREATE INDEX idx_spins_campaign_id ON spinawheel.spins(campaign_id);
CREATE INDEX idx_spins_email ON spinawheel.spins(email);
CREATE INDEX idx_spins_created_at ON spinawheel.spins(created_at);
CREATE INDEX idx_email_captures_spin_id ON spinawheel.email_captures(spin_id);
CREATE INDEX idx_integrations_store_id ON spinawheel.integrations(store_id);
CREATE INDEX idx_schedule_templates_store_id ON spinawheel.schedule_templates(store_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION spinawheel.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON spinawheel.stores
    FOR EACH ROW EXECUTE FUNCTION spinawheel.update_updated_at_column();

CREATE TRIGGER update_wheels_updated_at BEFORE UPDATE ON spinawheel.wheels
    FOR EACH ROW EXECUTE FUNCTION spinawheel.update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE spinawheel.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.email_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.schedule_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view their own stores" ON spinawheel.stores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stores" ON spinawheel.stores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores" ON spinawheel.stores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores" ON spinawheel.stores
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wheels (via store ownership)
CREATE POLICY "Users can view wheels from their stores" ON spinawheel.wheels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = wheels.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create wheels for their stores" ON spinawheel.wheels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = wheels.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update wheels from their stores" ON spinawheel.wheels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = wheels.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete wheels from their stores" ON spinawheel.wheels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = wheels.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- RLS Policies for campaigns (via wheel ownership)
CREATE POLICY "Users can view campaigns from their wheels" ON spinawheel.campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = campaigns.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create campaigns for their wheels" ON spinawheel.campaigns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = campaigns.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update campaigns from their wheels" ON spinawheel.campaigns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = campaigns.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete campaigns from their wheels" ON spinawheel.campaigns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = campaigns.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

-- RLS Policies for segments (via wheel ownership)
CREATE POLICY "Users can view segments from their wheels" ON spinawheel.segments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = segments.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create segments for their wheels" ON spinawheel.segments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = segments.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update segments from their wheels" ON spinawheel.segments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = segments.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete segments from their wheels" ON spinawheel.segments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.wheels w
            JOIN spinawheel.stores s ON s.id = w.store_id
            WHERE w.id = segments.wheel_id 
            AND s.user_id = auth.uid()
        )
    );

-- RLS Policies for integrations (via store ownership)
CREATE POLICY "Users can view integrations from their stores" ON spinawheel.integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create integrations for their stores" ON spinawheel.integrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update integrations from their stores" ON spinawheel.integrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete integrations from their stores" ON spinawheel.integrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = integrations.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- RLS Policies for schedule templates (via store ownership)
CREATE POLICY "Users can view their store's schedule templates" ON spinawheel.schedule_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = schedule_templates.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create schedule templates for their stores" ON spinawheel.schedule_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = schedule_templates.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their store's schedule templates" ON spinawheel.schedule_templates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = schedule_templates.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their store's schedule templates" ON spinawheel.schedule_templates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = schedule_templates.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Public access for widget (anonymous users can create spins)
CREATE POLICY "Public can create spins" ON spinawheel.spins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create email captures" ON spinawheel.email_captures
    FOR INSERT WITH CHECK (true);

-- Function to generate embed code
CREATE OR REPLACE FUNCTION spinawheel.generate_embed_code(wheel_id UUID)
RETURNS TEXT AS $$
DECLARE
    embed_code TEXT;
BEGIN
    embed_code := '<script src="https://yourdomain.com/widget.js" data-wheel-id="' || wheel_id || '"></script>';
    RETURN embed_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate embed code
CREATE OR REPLACE FUNCTION spinawheel.set_embed_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.embed_code := spinawheel.generate_embed_code(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_wheel_embed_code
    BEFORE INSERT ON spinawheel.wheels
    FOR EACH ROW
    EXECUTE FUNCTION spinawheel.set_embed_code();

-- Function to check if wheel is active based on schedule
CREATE OR REPLACE FUNCTION spinawheel.is_wheel_active_now(wheel_id UUID, check_timezone VARCHAR DEFAULT 'UTC')
RETURNS BOOLEAN AS $$
DECLARE
    wheel_record RECORD;
    current_time TIMESTAMPTZ;
    current_day INTEGER;
    current_hour INTEGER;
    current_minute INTEGER;
    time_slot JSONB;
    special_date DATE;
BEGIN
    -- Get wheel with schedule config
    SELECT * INTO wheel_record FROM spinawheel.wheels WHERE id = wheel_id;
    
    IF NOT FOUND OR NOT wheel_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- If scheduling is not enabled, wheel is always active
    IF NOT (wheel_record.schedule_config->>'enabled')::BOOLEAN THEN
        RETURN TRUE;
    END IF;
    
    -- Get current time in the specified timezone
    current_time := NOW() AT TIME ZONE check_timezone;
    current_day := EXTRACT(DOW FROM current_time)::INTEGER;
    current_hour := EXTRACT(HOUR FROM current_time)::INTEGER;
    current_minute := EXTRACT(MINUTE FROM current_time)::INTEGER;
    
    -- Check date range
    IF wheel_record.schedule_config->'dateRange'->>'startDate' IS NOT NULL THEN
        IF current_time < (wheel_record.schedule_config->'dateRange'->>'startDate')::TIMESTAMPTZ THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    IF wheel_record.schedule_config->'dateRange'->>'endDate' IS NOT NULL THEN
        IF current_time > (wheel_record.schedule_config->'dateRange'->>'endDate')::TIMESTAMPTZ THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check blacklist dates (dates when wheel should NOT run)
    FOR special_date IN 
        SELECT jsonb_array_elements_text(wheel_record.schedule_config->'specialDates'->'blacklistDates')::DATE
    LOOP
        IF current_time::DATE = special_date THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    -- Check whitelist dates (dates when wheel SHOULD run, overriding other rules)
    FOR special_date IN 
        SELECT jsonb_array_elements_text(wheel_record.schedule_config->'specialDates'->'whitelistDates')::DATE
    LOOP
        IF current_time::DATE = special_date THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    -- Check week days
    IF (wheel_record.schedule_config->'weekDays'->>'enabled')::BOOLEAN THEN
        IF NOT (wheel_record.schedule_config->'weekDays'->'days' ? current_day::TEXT) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check time slots
    IF (wheel_record.schedule_config->'timeSlots'->>'enabled')::BOOLEAN THEN
        FOR time_slot IN 
            SELECT jsonb_array_elements(wheel_record.schedule_config->'timeSlots'->'slots')
        LOOP
            IF (current_hour * 60 + current_minute) >= (time_slot->>'startMinutes')::INTEGER 
               AND (current_hour * 60 + current_minute) <= (time_slot->>'endMinutes')::INTEGER THEN
                RETURN TRUE;
            END IF;
        END LOOP;
        -- If time slots are enabled but current time doesn't match any slot
        RETURN FALSE;
    END IF;
    
    -- If we've passed all checks, wheel is active
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get next active time for a wheel
CREATE OR REPLACE FUNCTION spinawheel.get_wheel_next_active_time(wheel_id UUID, check_timezone VARCHAR DEFAULT 'UTC')
RETURNS TIMESTAMPTZ AS $$
DECLARE
    wheel_record RECORD;
    current_time TIMESTAMPTZ;
    check_time TIMESTAMPTZ;
    max_days INTEGER := 365; -- Maximum days to check ahead
    i INTEGER;
BEGIN
    -- Get wheel
    SELECT * INTO wheel_record FROM spinawheel.wheels WHERE id = wheel_id;
    
    IF NOT FOUND OR NOT wheel_record.is_active THEN
        RETURN NULL;
    END IF;
    
    -- If scheduling is not enabled, wheel is always active
    IF NOT (wheel_record.schedule_config->>'enabled')::BOOLEAN THEN
        RETURN NOW();
    END IF;
    
    current_time := NOW() AT TIME ZONE check_timezone;
    
    -- Check if currently active
    IF spinawheel.is_wheel_active_now(wheel_id, check_timezone) THEN
        RETURN current_time;
    END IF;
    
    -- Check future dates
    FOR i IN 1..max_days LOOP
        check_time := current_time + (i || ' days')::INTERVAL;
        
        -- Skip if before start date
        IF wheel_record.schedule_config->'dateRange'->>'startDate' IS NOT NULL THEN
            IF check_time < (wheel_record.schedule_config->'dateRange'->>'startDate')::TIMESTAMPTZ THEN
                CONTINUE;
            END IF;
        END IF;
        
        -- Skip if after end date
        IF wheel_record.schedule_config->'dateRange'->>'endDate' IS NOT NULL THEN
            IF check_time > (wheel_record.schedule_config->'dateRange'->>'endDate')::TIMESTAMPTZ THEN
                RETURN NULL; -- No future active time
            END IF;
        END IF;
        
        -- Check if this date would be active
        IF spinawheel.is_wheel_active_now(wheel_id, check_timezone) THEN
            RETURN check_time;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create view for wheel analytics
CREATE OR REPLACE VIEW spinawheel.wheel_analytics AS
SELECT 
  w.id as wheel_id,
  w.store_id,
  w.name as wheel_name,
  COUNT(DISTINCT s.id) as total_spins,
  COUNT(DISTINCT s.email) as unique_visitors,
  COUNT(DISTINCT CASE WHEN ec.marketing_consent = true THEN ec.email END) as marketing_consents,
  COUNT(DISTINCT ec.email) as emails_captured,
  DATE(s.created_at) as date
FROM spinawheel.wheels w
LEFT JOIN spinawheel.campaigns c ON c.wheel_id = w.id
LEFT JOIN spinawheel.spins s ON s.campaign_id = c.id
LEFT JOIN spinawheel.email_captures ec ON ec.spin_id = s.id
GROUP BY w.id, w.store_id, w.name, DATE(s.created_at);

-- Create view for segment performance
CREATE OR REPLACE VIEW spinawheel.segment_performance AS
SELECT 
  seg.id as segment_id,
  seg.wheel_id,
  seg.label,
  seg.value,
  seg.prize_type,
  COUNT(s.id) as times_won,
  seg.weight,
  ROUND(COUNT(s.id) * 100.0 / NULLIF(SUM(COUNT(s.id)) OVER (PARTITION BY seg.wheel_id), 0), 2) as win_percentage
FROM spinawheel.segments seg
LEFT JOIN spinawheel.spins s ON s.segment_won_id = seg.id
GROUP BY seg.id, seg.wheel_id, seg.label, seg.value, seg.prize_type, seg.weight;

-- Create function to get wheel analytics for a date range
CREATE OR REPLACE FUNCTION spinawheel.get_wheel_analytics(
  p_wheel_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_spins BIGINT,
  unique_visitors BIGINT,
  emails_captured BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(s.created_at) as date,
    COUNT(s.id) as total_spins,
    COUNT(DISTINCT s.email) as unique_visitors,
    COUNT(DISTINCT ec.email) as emails_captured,
    ROUND(COUNT(DISTINCT ec.email) * 100.0 / NULLIF(COUNT(DISTINCT s.email), 0), 2) as conversion_rate
  FROM spinawheel.campaigns c
  JOIN spinawheel.spins s ON s.campaign_id = c.id
  LEFT JOIN spinawheel.email_captures ec ON ec.spin_id = s.id
  WHERE c.wheel_id = p_wheel_id
    AND DATE(s.created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(s.created_at)
  ORDER BY DATE(s.created_at);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for public access (widget)
GRANT USAGE ON SCHEMA spinawheel TO anon, authenticated;
GRANT SELECT ON spinawheel.wheels TO anon, authenticated;
GRANT SELECT ON spinawheel.campaigns TO anon, authenticated;
GRANT SELECT ON spinawheel.segments TO anon, authenticated;
GRANT INSERT ON spinawheel.spins TO anon, authenticated;
GRANT INSERT ON spinawheel.email_captures TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA spinawheel TO anon, authenticated;