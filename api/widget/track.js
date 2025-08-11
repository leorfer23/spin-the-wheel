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
    const { type, ...data } = req.body;

    console.log('[Widget API] Tracking event:', { type, ...data });

    let result;
    let error;

    switch (type) {
      case 'impression':
        ({ data: result, error } = await trackImpression(data));
        break;

      case 'prize-accepted':
        ({ data: result, error } = await trackPrizeAcceptance(data));
        break;

      case 'event':
        ({ data: result, error } = await trackEvent(data));
        break;

      default:
        res.status(400).json({ error: `Unknown tracking type: ${type}` });
        return;
    }

    if (error) {
      console.error(`[Widget API] Error tracking ${type}:`, error);
      res.status(500).json({ error: `Failed to track ${type}` });
      return;
    }

    console.log(`[Widget API] ${type} tracked:`, result.id);
    res.status(200).json({ 
      success: true,
      id: result.id,
      type
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function trackImpression(data) {
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
  } = data;

  return supabase
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
}

async function trackPrizeAcceptance(data) {
  const { 
    wheelId, 
    storeId, 
    sessionId, 
    impressionId,
    spinId,
    prize, 
    email,
    platform,
    timestamp,
    capturedAtStep 
  } = data;

  // Record the prize acceptance
  const { data: acceptance, error } = await supabase
    .from('widget_prize_acceptances')
    .insert([
      {
        wheel_id: wheelId,
        store_id: storeId,
        session_id: sessionId,
        impression_id: impressionId,
        spin_id: spinId,
        email: email,
        prize_type: prize?.prizeType,
        prize_value: prize?.value,
        discount_code: prize?.discountCode,
        platform: platform || 'web',
        captured_at_step: capturedAtStep || 'with_prize',
        timestamp: timestamp || new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  // If email is provided, add to email list
  if (email) {
    const { error: emailError } = await supabase
      .from('widget_emails')
      .upsert([
        {
          email: email,
          store_id: storeId,
          wheel_id: wheelId,
          marketing_consent: true,
          source: 'widget_spin',
          captured_at: new Date().toISOString()
        }
      ], {
        onConflict: 'email,store_id',
        ignoreDuplicates: false
      });

    if (emailError) {
      console.error('[Widget API] Error recording email:', emailError);
      // Don't fail the request if email recording fails
    }
  }

  return { data: acceptance, error: null };
}

async function trackEvent(data) {
  const { 
    wheelId, 
    storeId, 
    sessionId, 
    impressionId,
    eventType,
    eventData
  } = data;

  return supabase
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
}