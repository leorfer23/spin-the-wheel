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
      spinId,
      prize, 
      email,
      platform,
      timestamp,
      capturedAtStep 
    } = req.body;

    console.log('[Widget API] Recording prize acceptance:', {
      wheelId,
      storeId,
      sessionId,
      spinId,
      email,
      platform
    });

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
      console.error('[Widget API] Error recording prize acceptance:', error);
      res.status(500).json({ error: 'Failed to record prize acceptance' });
      return;
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

    console.log('[Widget API] Prize acceptance recorded:', acceptance.id);
    res.status(200).json({ 
      success: true,
      acceptanceId: acceptance.id
    });

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}