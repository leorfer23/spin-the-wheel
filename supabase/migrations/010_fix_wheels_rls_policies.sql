-- Fix RLS policies for wheels table to use correct column name (tiendanube_store_id)
-- The existing policies incorrectly reference 'store_id' instead of 'tiendanube_store_id'

-- First, drop the existing incorrect policies
DROP POLICY IF EXISTS "Users can view wheels from their stores" ON spinawheel.wheels;
DROP POLICY IF EXISTS "Users can create wheels for their stores" ON spinawheel.wheels;
DROP POLICY IF EXISTS "Users can update wheels from their stores" ON spinawheel.wheels;
DROP POLICY IF EXISTS "Users can delete wheels from their stores" ON spinawheel.wheels;

-- Create correct RLS policies for wheels using tiendanube_store_id
CREATE POLICY "Users can view wheels from their stores" ON spinawheel.wheels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.tiendanube_store_id = wheels.tiendanube_store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create wheels for their stores" ON spinawheel.wheels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.tiendanube_store_id = wheels.tiendanube_store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update wheels from their stores" ON spinawheel.wheels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.tiendanube_store_id = wheels.tiendanube_store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete wheels from their stores" ON spinawheel.wheels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM spinawheel.stores 
            WHERE stores.tiendanube_store_id = wheels.tiendanube_store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Also add a service role bypass policy for administrative operations
CREATE POLICY "Service role bypass" ON spinawheel.wheels
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Ensure RLS is enabled (should already be enabled but including for completeness)
ALTER TABLE spinawheel.wheels ENABLE ROW LEVEL SECURITY;