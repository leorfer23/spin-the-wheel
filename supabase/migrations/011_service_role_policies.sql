-- Service Role RLS Policies for all tables
-- Service role bypasses RLS by default, but we can add explicit policies for clarity

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can do everything on email_captures" ON spinawheel.email_captures;
DROP POLICY IF EXISTS "Service role can do everything on widget_impressions" ON spinawheel.widget_impressions;
DROP POLICY IF EXISTS "Service role can do everything on widget_interactions" ON spinawheel.widget_interactions;
DROP POLICY IF EXISTS "Service role can do everything on widget_spins" ON spinawheel.widget_spins;

-- Email Captures - Allow all operations for service role
CREATE POLICY "Service role can do everything on email_captures" 
ON spinawheel.email_captures
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Widget Impressions - Allow all operations for service role
CREATE POLICY "Service role can do everything on widget_impressions" 
ON spinawheel.widget_impressions
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Widget Interactions - Allow all operations for service role
CREATE POLICY "Service role can do everything on widget_interactions" 
ON spinawheel.widget_interactions
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Widget Spins - Allow all operations for service role
CREATE POLICY "Service role can do everything on widget_spins" 
ON spinawheel.widget_spins
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Also ensure anon role can insert into these tables for widget tracking
DROP POLICY IF EXISTS "Anon can insert email_captures" ON spinawheel.email_captures;
DROP POLICY IF EXISTS "Anon can insert widget_impressions" ON spinawheel.widget_impressions;
DROP POLICY IF EXISTS "Anon can insert widget_interactions" ON spinawheel.widget_interactions;
DROP POLICY IF EXISTS "Anon can insert widget_spins" ON spinawheel.widget_spins;

CREATE POLICY "Anon can insert email_captures" 
ON spinawheel.email_captures
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can insert widget_impressions" 
ON spinawheel.widget_impressions
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can insert widget_interactions" 
ON spinawheel.widget_interactions
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can insert widget_spins" 
ON spinawheel.widget_spins
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow anon to update widget_impressions (for tracking time on widget)
CREATE POLICY "Anon can update own widget_impressions" 
ON spinawheel.widget_impressions
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);