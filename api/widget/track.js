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
    
    // Return appropriate response based on type
    const response = {
      success: true,
      id: result.id,
      type
    };
    
    // Add type-specific fields
    if (type === 'impression') {
      response.impressionId = result.id;
    } else if (type === 'spin') {
      response.spinId = result.id;
    }
    
    res.status(200).json(response);

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

  const impressionData = {
    wheel_id: wheelId,
    tiendanube_store_id: storeId,  // Changed from store_id to tiendanube_store_id
    session_id: sessionId,
    trigger_type: triggerType,
    page_url: pageUrl,
    referrer_url: referrerUrl,
    platform: platform || 'web',
    device_type: deviceType || 'desktop',
    browser: browser,
    user_agent: userAgent,
    timestamp: new Date().toISOString()
  };

  // Log the data being inserted for debugging
  console.log('[Widget API] Inserting impression data:', impressionData);

  // Use insert with select chained properly
  const { data: result, error } = await supabase
    .from('widget_impressions')
    .insert([impressionData])
    .select()
    .single();

  if (error) {
    console.error('[Widget API] Error inserting impression:', error);
    return { data: null, error };
  }

  // Return the actual inserted data with its ID
  return { 
    data: result, 
    error: null 
  };
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

  const acceptanceData = {
    wheel_id: wheelId,
    tiendanube_store_id: storeId,  // Changed from store_id to tiendanube_store_id
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
  };

  // Record the prize acceptance
  const { data: acceptance, error } = await supabase
    .from('widget_prize_acceptances')
    .insert([acceptanceData])
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
          tiendanube_store_id: storeId,  // Changed from store_id to tiendanube_store_id
          wheel_id: wheelId,
          marketing_consent: true,
          source: 'widget_spin',
          captured_at: new Date().toISOString()
        }
      ], {
        onConflict: 'email,tiendanube_store_id',  // Updated to match new column name
        ignoreDuplicates: false
      });

    if (emailError) {
      console.error('[Widget API] Error recording email:', emailError);
      // Don't fail the request if email recording fails
    }
  }

  // Return the acceptance data
  return { 
    data: acceptance, 
    error: null 
  };
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

  const eventRecord = {
    wheel_id: wheelId,
    tiendanube_store_id: storeId,  // Changed from store_id to tiendanube_store_id
    session_id: sessionId,
    impression_id: impressionId,
    event_type: eventType,
    event_data: eventData,
    timestamp: new Date().toISOString()
  };

  const { data: result, error } = await supabase
    .from('widget_events')
    .insert([eventRecord])
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }
  
  return { 
    data: result, 
    error: null 
  };
}