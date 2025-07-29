-- AI-Powered Features Database Schema for spinawheel schema
-- This migration adds tables for advanced AI personalization and analytics

-- Customer profiles for AI personalization
CREATE TABLE spinawheel.customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    shopify_customer_id VARCHAR(255),
    
    -- Behavioral metrics
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    days_since_last_purchase INTEGER,
    purchase_frequency_days DECIMAL(10,2),
    
    -- Engagement metrics
    site_visits INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    avg_session_duration INTEGER, -- in seconds
    cart_abandonment_rate DECIMAL(5,2),
    email_open_rate DECIMAL(5,2),
    email_click_rate DECIMAL(5,2),
    
    -- AI-computed scores
    churn_risk_score DECIMAL(3,2), -- 0-1 probability
    purchase_propensity_score DECIMAL(3,2), -- 0-1 probability
    price_sensitivity_score DECIMAL(3,2), -- 0-1 scale
    engagement_score DECIMAL(3,2), -- 0-1 scale
    loyalty_tier VARCHAR(50), -- calculated tier
    
    -- Preferences learned by AI
    preferred_categories JSONB DEFAULT '[]',
    preferred_price_range JSONB DEFAULT '{"min": 0, "max": 0}',
    preferred_discount_types JSONB DEFAULT '[]',
    best_contact_time JSONB DEFAULT '{"day": null, "hour": null}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_calculated_at TIMESTAMPTZ,
    
    UNIQUE(store_id, email)
);

-- AI model predictions log
CREATE TABLE spinawheel.ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_profile_id UUID REFERENCES spinawheel.customer_profiles(id) ON DELETE CASCADE,
    wheel_id UUID REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    
    prediction_type VARCHAR(50) NOT NULL, -- 'optimal_prize', 'best_time', 'conversion_probability'
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    model_version VARCHAR(50),
    
    -- Outcome tracking
    actual_outcome JSONB,
    outcome_recorded_at TIMESTAMPTZ,
    prediction_accuracy DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-stage wheel progress tracking
CREATE TABLE spinawheel.wheel_progression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_profile_id UUID REFERENCES spinawheel.customer_profiles(id) ON DELETE CASCADE,
    wheel_id UUID REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    
    current_stage INTEGER DEFAULT 1,
    total_stages INTEGER DEFAULT 3,
    points_earned INTEGER DEFAULT 0,
    achievements_unlocked JSONB DEFAULT '[]',
    
    -- Progression rules
    stage_requirements JSONB DEFAULT '[]', -- what's needed to advance
    stage_rewards JSONB DEFAULT '[]', -- what's unlocked at each stage
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(customer_profile_id, wheel_id)
);

-- Social sharing and referral tracking
CREATE TABLE spinawheel.social_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spin_id UUID REFERENCES spinawheel.spins(id) ON DELETE CASCADE,
    customer_profile_id UUID REFERENCES spinawheel.customer_profiles(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(50) NOT NULL, -- 'share', 'referral', 'challenge_completed'
    platform VARCHAR(50), -- 'facebook', 'twitter', 'instagram', 'tiktok', 'email'
    
    -- Viral metrics
    referral_code VARCHAR(50) UNIQUE,
    referred_by_code VARCHAR(50),
    clicks_generated INTEGER DEFAULT 0,
    conversions_generated INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    
    -- Rewards earned
    reward_type VARCHAR(50),
    reward_value JSONB,
    reward_claimed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advanced behavioral triggers
CREATE TABLE spinawheel.behavioral_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    
    -- Trigger conditions
    trigger_type VARCHAR(50) NOT NULL, -- 'weather', 'location', 'time', 'behavior', 'cart_value'
    conditions JSONB NOT NULL, -- Complex condition rules
    
    -- Actions
    wheel_id UUID REFERENCES spinawheel.wheels(id) ON DELETE CASCADE,
    prize_modifier JSONB, -- How to modify prizes when triggered
    message_override TEXT,
    
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Performance tracking
    times_triggered INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B testing framework
CREATE TABLE spinawheel.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    
    experiment_type VARCHAR(50) NOT NULL, -- 'wheel_config', 'trigger', 'prize_structure'
    hypothesis TEXT,
    
    -- Variants
    control_config JSONB NOT NULL,
    variants JSONB NOT NULL, -- Array of variant configurations
    
    -- Targeting
    audience_rules JSONB, -- Who gets included in the experiment
    traffic_allocation JSONB, -- How to split traffic
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'running', 'completed', 'stopped'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Results
    results JSONB,
    winner_variant VARCHAR(50),
    confidence_level DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time analytics events
CREATE TABLE spinawheel.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    customer_profile_id UUID REFERENCES spinawheel.customer_profiles(id),
    
    event_type VARCHAR(50) NOT NULL, -- 'wheel_view', 'wheel_interact', 'spin_start', 'prize_won', 'prize_claimed'
    event_data JSONB NOT NULL,
    
    -- Context
    page_url TEXT,
    referrer_url TEXT,
    utm_params JSONB,
    device_info JSONB,
    geo_info JSONB,
    
    -- For funnel analysis
    funnel_step INTEGER,
    time_to_event INTEGER, -- seconds from session start
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitive intelligence data
CREATE TABLE spinawheel.market_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES spinawheel.stores(id) ON DELETE CASCADE,
    
    competitor_domain VARCHAR(255),
    intel_type VARCHAR(50), -- 'pricing', 'promotions', 'features'
    data_collected JSONB,
    
    -- AI insights
    insights JSONB,
    recommendations JSONB,
    
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customer_profiles_store_email ON spinawheel.customer_profiles(store_id, email);
CREATE INDEX idx_customer_profiles_scores ON spinawheel.customer_profiles(churn_risk_score, purchase_propensity_score);
CREATE INDEX idx_ai_predictions_customer ON spinawheel.ai_predictions(customer_profile_id);
CREATE INDEX idx_ai_predictions_created ON spinawheel.ai_predictions(created_at DESC);
CREATE INDEX idx_social_activities_referral ON spinawheel.social_activities(referral_code);
CREATE INDEX idx_behavioral_triggers_store ON spinawheel.behavioral_triggers(store_id, is_active);
CREATE INDEX idx_experiments_status ON spinawheel.experiments(store_id, status);
CREATE INDEX idx_analytics_events_session ON spinawheel.analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON spinawheel.analytics_events(created_at DESC);

-- RLS Policies
ALTER TABLE spinawheel.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.wheel_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.behavioral_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinawheel.market_intelligence ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for store owners
CREATE POLICY "Store owners can manage customer profiles" ON spinawheel.customer_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = customer_profiles.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view AI predictions" ON spinawheel.ai_predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.customer_profiles cp
            JOIN spinawheel.stores s ON s.id = cp.store_id
            WHERE cp.id = ai_predictions.customer_profile_id
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can manage behavioral triggers" ON spinawheel.behavioral_triggers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = behavioral_triggers.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can manage experiments" ON spinawheel.experiments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = experiments.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view analytics events" ON spinawheel.analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = analytics_events.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can manage market intelligence" ON spinawheel.market_intelligence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.id = market_intelligence.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Function to calculate customer scores using AI logic
CREATE OR REPLACE FUNCTION spinawheel.calculate_customer_scores(p_customer_profile_id UUID)
RETURNS void AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT * INTO v_profile FROM spinawheel.customer_profiles WHERE id = p_customer_profile_id;
    
    -- Simple scoring logic (would be replaced with actual ML model calls)
    UPDATE spinawheel.customer_profiles 
    SET 
        -- Churn risk based on days since last purchase
        churn_risk_score = CASE 
            WHEN days_since_last_purchase > 180 THEN 0.9
            WHEN days_since_last_purchase > 90 THEN 0.7
            WHEN days_since_last_purchase > 30 THEN 0.4
            ELSE 0.1
        END,
        
        -- Purchase propensity based on engagement
        purchase_propensity_score = LEAST(1.0, 
            (COALESCE(email_open_rate, 0) * 0.3 + 
             COALESCE(email_click_rate, 0) * 0.3 +
             CASE WHEN site_visits > 5 THEN 0.4 ELSE site_visits * 0.08 END)
        ),
        
        -- Engagement score
        engagement_score = LEAST(1.0,
            (COALESCE(email_open_rate, 0) * 0.25 +
             COALESCE(email_click_rate, 0) * 0.25 +
             CASE WHEN site_visits > 10 THEN 0.5 ELSE site_visits * 0.05 END)
        ),
        
        -- Loyalty tier
        loyalty_tier = CASE
            WHEN lifetime_value > 1000 AND total_orders > 10 THEN 'vip'
            WHEN lifetime_value > 500 AND total_orders > 5 THEN 'gold'
            WHEN lifetime_value > 100 AND total_orders > 2 THEN 'silver'
            ELSE 'bronze'
        END,
        
        last_calculated_at = NOW()
    WHERE id = p_customer_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate scores when profile is updated
CREATE OR REPLACE FUNCTION spinawheel.trigger_calculate_scores()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM spinawheel.calculate_customer_scores(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_customer_scores
    AFTER INSERT OR UPDATE OF lifetime_value, total_orders, days_since_last_purchase
    ON spinawheel.customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION spinawheel.trigger_calculate_scores();

-- Public access for widget (anonymous users can create events)
CREATE POLICY "Public can create analytics events" ON spinawheel.analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create social activities" ON spinawheel.social_activities
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions for public access (widget)
GRANT INSERT ON spinawheel.analytics_events TO anon, authenticated;
GRANT INSERT ON spinawheel.social_activities TO anon, authenticated;