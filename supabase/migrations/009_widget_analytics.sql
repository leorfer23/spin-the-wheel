-- Widget Analytics Schema
-- Comprehensive tracking for widget impressions, interactions, and conversions

-- Widget impressions table (when widget loads/shows)
CREATE TABLE IF NOT EXISTS spinawheel.widget_impressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wheel_id UUID REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    store_id UUID REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    
    -- Trigger information
    trigger_type VARCHAR(50) NOT NULL, -- 'exit_intent', 'immediate', 'delay', 'scroll', 'click'
    trigger_timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    referrer_url TEXT,
    
    -- Device and context
    platform VARCHAR(50), -- 'tiendanube', 'shopify', 'woocommerce', 'generic'
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    geo_data JSONB, -- country, region, city
    
    -- User engagement
    widget_shown BOOLEAN DEFAULT true,
    widget_closed_at TIMESTAMPTZ,
    time_on_widget INTEGER, -- seconds
    interaction_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget interactions table (detailed user actions)
CREATE TABLE IF NOT EXISTS spinawheel.widget_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    impression_id UUID REFERENCES spinawheel.widget_impressions(id) ON DELETE CASCADE,
    wheel_id UUID REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    
    -- Interaction details
    event_type VARCHAR(100) NOT NULL, -- 'widget_view', 'wheel_hover', 'spin_start', 'spin_complete', 'email_form_view', 'email_submit', 'prize_view', 'prize_claim', 'widget_close'
    event_data JSONB, -- Additional context for the event
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Conversion funnel
    funnel_step INTEGER, -- 1: view, 2: interact, 3: spin, 4: email, 5: claim
    time_since_impression INTEGER, -- seconds from first impression
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced email captures table
ALTER TABLE spinawheel.email_captures 
ADD COLUMN IF NOT EXISTS impression_id UUID REFERENCES spinawheel.widget_impressions(id),
ADD COLUMN IF NOT EXISTS captured_at_step VARCHAR(50), -- 'before_spin', 'after_spin', 'with_prize'
ADD COLUMN IF NOT EXISTS additional_fields JSONB, -- phone, name, etc.
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);

-- Enhanced spins table
ALTER TABLE spinawheel.spins
ADD COLUMN IF NOT EXISTS impression_id UUID REFERENCES spinawheel.widget_impressions(id),
ADD COLUMN IF NOT EXISTS spin_duration INTEGER, -- milliseconds
ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50);

-- Widget performance summary (materialized view for fast analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS spinawheel.widget_performance_summary AS
SELECT 
    wi.wheel_id,
    wi.store_id,
    DATE(wi.created_at) as date,
    wi.trigger_type,
    wi.platform,
    wi.device_type,
    
    -- Impressions metrics
    COUNT(DISTINCT wi.id) as total_impressions,
    COUNT(DISTINCT wi.session_id) as unique_sessions,
    COUNT(DISTINCT CASE WHEN wi.widget_shown THEN wi.id END) as widgets_shown,
    
    -- Engagement metrics
    AVG(wi.time_on_widget) as avg_time_on_widget,
    AVG(wi.interaction_count) as avg_interactions,
    COUNT(DISTINCT CASE WHEN wi.interaction_count > 0 THEN wi.id END) as engaged_impressions,
    
    -- Spin metrics
    COUNT(DISTINCT s.id) as total_spins,
    COUNT(DISTINCT s.email) as unique_spinners,
    
    -- Email metrics
    COUNT(DISTINCT ec.id) as emails_captured,
    COUNT(DISTINCT CASE WHEN ec.marketing_consent THEN ec.id END) as marketing_consents,
    
    -- Conversion rates
    ROUND(COUNT(DISTINCT s.id)::NUMERIC * 100 / NULLIF(COUNT(DISTINCT wi.id), 0), 2) as impression_to_spin_rate,
    ROUND(COUNT(DISTINCT ec.id)::NUMERIC * 100 / NULLIF(COUNT(DISTINCT wi.id), 0), 2) as impression_to_email_rate,
    ROUND(COUNT(DISTINCT ec.id)::NUMERIC * 100 / NULLIF(COUNT(DISTINCT s.id), 0), 2) as spin_to_email_rate
    
FROM spinawheel.widget_impressions wi
LEFT JOIN spinawheel.spins s ON s.impression_id = wi.id
LEFT JOIN spinawheel.email_captures ec ON ec.impression_id = wi.id
GROUP BY wi.wheel_id, wi.store_id, DATE(wi.created_at), wi.trigger_type, wi.platform, wi.device_type;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_widget_impressions_wheel ON spinawheel.widget_impressions(wheel_id);
CREATE INDEX IF NOT EXISTS idx_widget_impressions_store ON spinawheel.widget_impressions(store_id);
CREATE INDEX IF NOT EXISTS idx_widget_impressions_session ON spinawheel.widget_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_widget_impressions_created ON spinawheel.widget_impressions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_impression ON spinawheel.widget_interactions(impression_id);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_event ON spinawheel.widget_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_created ON spinawheel.widget_interactions(created_at DESC);

-- Function to track widget event
CREATE OR REPLACE FUNCTION spinawheel.track_widget_event(
    p_wheel_id UUID,
    p_store_id UUID,
    p_session_id VARCHAR,
    p_event_type VARCHAR,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_impression_id UUID;
    v_interaction_id UUID;
BEGIN
    -- Get or create impression for this session
    SELECT id INTO v_impression_id 
    FROM spinawheel.widget_impressions 
    WHERE session_id = p_session_id 
    AND wheel_id = p_wheel_id
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If no impression exists and it's a view event, create one
    IF v_impression_id IS NULL AND p_event_type = 'widget_view' THEN
        INSERT INTO spinawheel.widget_impressions (
            wheel_id, store_id, session_id, 
            trigger_type, page_url, platform
        ) VALUES (
            p_wheel_id, p_store_id, p_session_id,
            COALESCE(p_event_data->>'trigger_type', 'unknown'),
            p_event_data->>'page_url',
            p_event_data->>'platform'
        ) RETURNING id INTO v_impression_id;
    END IF;
    
    -- Record the interaction
    IF v_impression_id IS NOT NULL THEN
        INSERT INTO spinawheel.widget_interactions (
            impression_id, wheel_id, session_id,
            event_type, event_data
        ) VALUES (
            v_impression_id, p_wheel_id, p_session_id,
            p_event_type, p_event_data
        ) RETURNING id INTO v_interaction_id;
        
        -- Update impression metrics
        UPDATE spinawheel.widget_impressions
        SET 
            interaction_count = interaction_count + 1,
            widget_closed_at = CASE 
                WHEN p_event_type = 'widget_close' THEN NOW() 
                ELSE widget_closed_at 
            END
        WHERE id = v_impression_id;
    END IF;
    
    RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get widget analytics
CREATE OR REPLACE FUNCTION spinawheel.get_widget_analytics(
    p_wheel_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    impressions BIGINT,
    unique_visitors BIGINT,
    spins BIGINT,
    emails_captured BIGINT,
    avg_time_on_widget NUMERIC,
    impression_to_spin_rate NUMERIC,
    impression_to_email_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(wi.created_at) as date,
        COUNT(DISTINCT wi.id) as impressions,
        COUNT(DISTINCT wi.session_id) as unique_visitors,
        COUNT(DISTINCT s.id) as spins,
        COUNT(DISTINCT ec.id) as emails_captured,
        ROUND(AVG(wi.time_on_widget)::NUMERIC, 2) as avg_time_on_widget,
        ROUND(COUNT(DISTINCT s.id)::NUMERIC * 100 / NULLIF(COUNT(DISTINCT wi.id), 0), 2) as impression_to_spin_rate,
        ROUND(COUNT(DISTINCT ec.id)::NUMERIC * 100 / NULLIF(COUNT(DISTINCT wi.id), 0), 2) as impression_to_email_rate
    FROM spinawheel.widget_impressions wi
    LEFT JOIN spinawheel.spins s ON s.impression_id = wi.id
    LEFT JOIN spinawheel.email_captures ec ON ec.impression_id = wi.id
    WHERE wi.wheel_id = p_wheel_id
    AND DATE(wi.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(wi.created_at)
    ORDER BY DATE(wi.created_at);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE spinawheel.widget_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.widget_interactions ENABLE ROW LEVEL SECURITY;

-- Store owners can view their widget analytics
CREATE POLICY "Store owners can view widget impressions" ON spinawheel.widget_impressions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = widget_impressions.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view widget interactions" ON spinawheel.widget_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.widget_impressions wi
            JOIN spinawheel.stores s ON s.id = wi.store_id
            WHERE wi.id = widget_interactions.impression_id
            AND s.user_id = auth.uid()
        )
    );

-- Public can create impressions and interactions (for widget)
CREATE POLICY "Public can create widget impressions" ON spinawheel.widget_impressions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create widget interactions" ON spinawheel.widget_interactions
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT INSERT, SELECT ON spinawheel.widget_impressions TO anon, authenticated;
GRANT INSERT, SELECT ON spinawheel.widget_interactions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION spinawheel.track_widget_event TO anon, authenticated;
GRANT EXECUTE ON FUNCTION spinawheel.get_widget_analytics TO authenticated;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION spinawheel.refresh_widget_performance()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW spinawheel.widget_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule periodic refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-widget-performance', '*/15 * * * *', 'SELECT spinawheel.refresh_widget_performance();');