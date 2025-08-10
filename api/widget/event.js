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
      impressionId,
      eventType,
      eventData
    } = req.body;

    console.log('[Widget API] Recording event:', {
      wheelId,
      storeId,
      sessionId,
      eventType,
      eventData
    });

    // Record the event
    const { data: event, error } = await supabase
      .from('widget_events')
      .insert([
        {
          wheel_id: wheelId,
          store_id: storeId,
          session_id: sessionId,
          impression_id: impressionId,
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[Widget API] Error recording event:', error);
      res.status(500).json({ error: 'Failed to record event' });
      return;
    }

    console.log('[Widget API] Event recorded:', event.id);
    res.status(200).json({ 
      success: true,
      eventId: event.id
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}