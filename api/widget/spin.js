import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with SERVICE ROLE to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'spinawheel'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      wheelId, 
      storeId, 
      sessionId, 
      impressionId,
      result, 
      platform,
      timestamp,
      deviceType 
    } = req.body;

    console.log('[Widget API] Recording spin:', {
      wheelId,
      storeId,
      sessionId,
      impressionId,
      platform,
      deviceType
    });

    // Record the spin in the database
    const { data: spin, error } = await supabase
      .from('widget_spins')
      .insert([
        {
          wheel_id: wheelId,
          store_id: storeId,
          session_id: sessionId,
          impression_id: impressionId,
          segment_id: result?.segment?.id,
          prize_value: result?.segment?.value,
          prize_type: result?.segment?.prizeType,
          platform: platform || 'web',
          device_type: deviceType || 'desktop',
          timestamp: timestamp || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[Widget API] Error recording spin:', error);
      res.status(500).json({ error: 'Failed to record spin' });
      return;
    }

    console.log('[Widget API] Spin recorded:', spin.id);
    res.status(200).json({ 
      success: true, 
      spinId: spin.id 
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}