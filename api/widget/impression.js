import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'spinawheel'
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
      triggerType,
      pageUrl,
      referrerUrl,
      platform,
      deviceType,
      browser,
      userAgent
    } = req.body;

    console.log('[Widget API] Recording impression:', {
      wheelId,
      storeId,
      sessionId,
      triggerType,
      platform,
      deviceType
    });

    // Record the impression
    const { data: impression, error } = await supabase
      .from('widget_impressions')
      .insert([
        {
          wheel_id: wheelId,
          store_id: storeId,
          session_id: sessionId,
          trigger_type: triggerType,
          page_url: pageUrl,
          referrer_url: referrerUrl,
          platform: platform || 'web',
          device_type: deviceType || 'desktop',
          browser: browser,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[Widget API] Error recording impression:', error);
      res.status(500).json({ error: 'Failed to record impression' });
      return;
    }

    console.log('[Widget API] Impression recorded:', impression.id);
    res.status(200).json({ 
      success: true,
      impressionId: impression.id
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}