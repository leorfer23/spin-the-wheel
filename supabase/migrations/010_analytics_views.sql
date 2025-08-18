-- Create views for analytics and reporting

-- Daily analytics aggregation view for wheel reporting
CREATE OR REPLACE VIEW spinawheel.wheel_daily_analytics AS
SELECT 
    w.id as wheel_id,
    w.name as wheel_name,
    w.tiendanube_store_id as store_id,
    DATE(wi.created_at) as date,
    
    -- Impression metrics
    COUNT(DISTINCT wi.id) as total_impressions,
    COUNT(DISTINCT wi.session_id) as unique_sessions,
    COUNT(DISTINCT wi.ip_address) as unique_visitors,
    
    -- Interaction metrics
    COUNT(DISTINCT CASE WHEN wint.event_type = 'widget_loaded' THEN wi.id END) as widget_loads,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_viewed' THEN wi.id END) as wheel_views,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_opened' THEN wi.id END) as wheel_opens,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_spin_started' THEN wi.id END) as spin_starts,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_spin_completed' THEN wi.id END) as spin_completes,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'prize_claimed' THEN wi.id END) as prizes_claimed,
    COUNT(DISTINCT CASE WHEN wint.event_type = 'widget_closed' THEN wi.id END) as widget_closes,
    
    -- Email metrics
    COUNT(DISTINCT ec.id) as emails_captured,
    COUNT(DISTINCT ec.email) as unique_emails,
    
    -- Spin metrics from spins table
    COUNT(DISTINCT s.id) as total_spins,
    COUNT(DISTINCT CASE WHEN s.is_winner = true THEN s.id END) as winning_spins,
    COUNT(DISTINCT CASE WHEN s.is_winner = false THEN s.id END) as losing_spins,
    
    -- Conversion rates (calculated fields)
    CASE 
        WHEN COUNT(DISTINCT wi.id) > 0 
        THEN ROUND(100.0 * COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_opened' THEN wi.id END) / COUNT(DISTINCT wi.id), 2)
        ELSE 0 
    END as open_rate,
    
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_opened' THEN wi.id END) > 0 
        THEN ROUND(100.0 * COUNT(DISTINCT ec.id) / COUNT(DISTINCT CASE WHEN wint.event_type = 'wheel_opened' THEN wi.id END), 2)
        ELSE 0 
    END as email_capture_rate,
    
    CASE 
        WHEN COUNT(DISTINCT ec.id) > 0 
        THEN ROUND(100.0 * COUNT(DISTINCT s.id) / COUNT(DISTINCT ec.id), 2)
        ELSE 0 
    END as spin_rate,
    
    -- Device breakdown
    COUNT(DISTINCT CASE WHEN wi.device_type = 'mobile' THEN wi.id END) as mobile_impressions,
    COUNT(DISTINCT CASE WHEN wi.device_type = 'desktop' THEN wi.id END) as desktop_impressions,
    COUNT(DISTINCT CASE WHEN wi.device_type = 'tablet' THEN wi.id END) as tablet_impressions,
    
    -- Timestamps
    MIN(wi.created_at) as first_impression_at,
    MAX(wi.created_at) as last_impression_at
    
FROM spinawheel.wheels w
LEFT JOIN spinawheel.widget_impressions wi ON wi.wheel_id = w.id
LEFT JOIN spinawheel.widget_interactions wint ON wint.impression_id = wi.id
LEFT JOIN spinawheel.email_captures ec ON ec.impression_id = wi.id
LEFT JOIN spinawheel.spins s ON s.id = ec.spin_id
WHERE w.deleted_at IS NULL
GROUP BY 
    w.id,
    w.name,
    w.tiendanube_store_id,
    DATE(wi.created_at);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wheel_daily_analytics_wheel_date 
ON spinawheel.widget_impressions(wheel_id, created_at);

-- Email-level analytics view for detailed tracking
CREATE OR REPLACE VIEW spinawheel.email_analytics AS
SELECT 
    ec.id as capture_id,
    ec.email,
    ec.created_at as captured_at,
    w.id as wheel_id,
    w.name as wheel_name,
    w.tiendanube_store_id as store_id,
    s.name as store_name,
    
    -- Impression details
    wi.id as impression_id,
    wi.session_id,
    wi.ip_address,
    wi.user_agent,
    wi.device_type,
    wi.referrer_url,
    wi.page_url,
    
    -- Spin details if available
    sp.id as spin_id,
    sp.is_winner,
    sp.segment_id,
    seg.name as segment_name,
    seg.value as prize_value,
    seg.type as prize_type,
    sp.created_at as spin_at,
    
    -- Interaction events for this email
    ARRAY_AGG(
        DISTINCT jsonb_build_object(
            'event_type', wint.event_type,
            'created_at', wint.created_at
        ) ORDER BY wint.created_at
    ) FILTER (WHERE wint.id IS NOT NULL) as interaction_events,
    
    -- Calculate engagement score (0-100)
    CASE 
        WHEN sp.id IS NOT NULL AND sp.is_winner = true THEN 100  -- Won and spun
        WHEN sp.id IS NOT NULL THEN 75  -- Spun but didn't win
        WHEN EXISTS (SELECT 1 FROM spinawheel.widget_interactions wi2 WHERE wi2.impression_id = wi.id AND wi2.event_type = 'wheel_spin_started') THEN 50  -- Started spin
        ELSE 25  -- Only captured email
    END as engagement_score
    
FROM spinawheel.email_captures ec
JOIN spinawheel.widget_impressions wi ON wi.id = ec.impression_id
JOIN spinawheel.wheels w ON w.id = wi.wheel_id
LEFT JOIN spinawheel.stores s ON s.tiendanube_store_id = w.tiendanube_store_id
LEFT JOIN spinawheel.spins sp ON sp.id = ec.spin_id
LEFT JOIN spinawheel.segments seg ON seg.id = sp.segment_id
LEFT JOIN spinawheel.widget_interactions wint ON wint.impression_id = wi.id
WHERE w.deleted_at IS NULL
GROUP BY 
    ec.id,
    ec.email,
    ec.created_at,
    w.id,
    w.name,
    w.tiendanube_store_id,
    s.name,
    wi.id,
    wi.session_id,
    wi.ip_address,
    wi.user_agent,
    wi.device_type,
    wi.referrer_url,
    wi.page_url,
    sp.id,
    sp.is_winner,
    sp.segment_id,
    seg.name,
    seg.value,
    seg.type,
    sp.created_at;

-- Hourly analytics view for real-time monitoring
CREATE OR REPLACE VIEW spinawheel.wheel_hourly_analytics AS
SELECT 
    w.id as wheel_id,
    w.name as wheel_name,
    DATE_TRUNC('hour', wi.created_at) as hour,
    COUNT(DISTINCT wi.id) as impressions,
    COUNT(DISTINCT wi.session_id) as sessions,
    COUNT(DISTINCT ec.id) as emails_captured,
    COUNT(DISTINCT s.id) as spins,
    COUNT(DISTINCT CASE WHEN s.is_winner = true THEN s.id END) as wins
FROM spinawheel.wheels w
LEFT JOIN spinawheel.widget_impressions wi ON wi.wheel_id = w.id
LEFT JOIN spinawheel.email_captures ec ON ec.impression_id = wi.id
LEFT JOIN spinawheel.spins s ON s.id = ec.spin_id
WHERE w.deleted_at IS NULL
  AND wi.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    w.id,
    w.name,
    DATE_TRUNC('hour', wi.created_at);

-- Segment performance view
CREATE OR REPLACE VIEW spinawheel.segment_performance AS
SELECT 
    w.id as wheel_id,
    w.name as wheel_name,
    seg.id as segment_id,
    seg.name as segment_name,
    seg.value as segment_value,
    seg.probability,
    seg.type as segment_type,
    COUNT(DISTINCT s.id) as total_spins,
    COUNT(DISTINCT CASE WHEN s.is_winner = true THEN s.id END) as times_won,
    ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN s.is_winner = true THEN s.id END) / 
        NULLIF(COUNT(DISTINCT s.id), 0), 
        2
    ) as win_rate,
    MAX(s.created_at) as last_won_at
FROM spinawheel.wheels w
JOIN spinawheel.segments seg ON seg.wheel_id = w.id
LEFT JOIN spinawheel.spins s ON s.segment_id = seg.id
WHERE w.deleted_at IS NULL
  AND seg.deleted_at IS NULL
GROUP BY 
    w.id,
    w.name,
    seg.id,
    seg.name,
    seg.value,
    seg.probability,
    seg.type;

-- Grant permissions for the views
GRANT SELECT ON spinawheel.wheel_daily_analytics TO authenticated, anon;
GRANT SELECT ON spinawheel.email_analytics TO authenticated, anon;
GRANT SELECT ON spinawheel.wheel_hourly_analytics TO authenticated, anon;
GRANT SELECT ON spinawheel.segment_performance TO authenticated, anon;

-- Add RLS policies for the views (inherit from base tables)
-- The views will automatically respect the RLS policies of the underlying tables