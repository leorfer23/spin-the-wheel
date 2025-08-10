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
      impressionId,
      sessionId, 
      timeOnWidget 
    } = req.body;

    console.log('[Widget API] Updating impression time:', {
      impressionId,
      sessionId,
      timeOnWidget
    });

    // Update the impression with time spent
    const { error } = await supabase
      .from('widget_impressions')
      .update({
        time_on_widget: timeOnWidget,
        updated_at: new Date().toISOString()
      })
      .eq('id', impressionId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('[Widget API] Error updating impression time:', error);
      res.status(500).json({ error: 'Failed to update impression time' });
      return;
    }

    console.log('[Widget API] Impression time updated');
    res.status(200).json({ 
      success: true
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}