import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Check if wheel is active based on schedule configuration
async function checkWheelSchedule(wheel: any): Promise<boolean> {
  // If no schedule config or not enabled, wheel is always active
  if (!wheel.schedule_config?.enabled) {
    return true
  }

  const config = wheel.schedule_config
  const now = new Date()
  const timezone = config.timezone || 'UTC'
  
  // For simplicity, we'll check in UTC
  // In production, you'd want to use a proper timezone library
  
  // Check date range
  if (config.dateRange?.startDate && new Date(config.dateRange.startDate) > now) {
    return false
  }
  if (config.dateRange?.endDate && new Date(config.dateRange.endDate) < now) {
    return false
  }

  const dateStr = now.toISOString().split('T')[0]
  
  // Check blacklist dates
  if (config.specialDates?.blacklistDates?.includes(dateStr)) {
    return false
  }
  
  // Check whitelist dates (override other rules)
  if (config.specialDates?.whitelistDates?.includes(dateStr)) {
    return true
  }

  // Check weekdays
  const dayOfWeek = now.getDay()
  if (config.weekDays?.enabled && !config.weekDays.days.includes(dayOfWeek)) {
    return false
  }

  // Check time slots
  if (config.timeSlots?.enabled && config.timeSlots.slots.length > 0) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const inTimeSlot = config.timeSlots.slots.some((slot: any) => 
      currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes
    )
    if (!inTimeSlot) {
      return false
    }
  }

  return true
}

// Get next active time for wheel
async function getNextActiveTime(wheel: any): Promise<string | null> {
  if (!wheel.schedule_config?.enabled) {
    return new Date().toISOString()
  }

  // Simple implementation - in production you'd calculate the actual next time
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  return tomorrow.toISOString()
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Route: GET /api/widget/wheel/:wheelId
    if (req.method === 'GET' && url.pathname.match(/^\/api\/widget\/wheel\/(.+)$/)) {
      const wheelId = url.pathname.split('/').pop()
      
      // Fetch wheel with segments and campaigns
      const { data: wheel, error } = await supabase
        .from('spinawheel.wheels')
        .select(`
          *,
          segments (
            id,
            label,
            value,
            color,
            weight,
            prize_type,
            prize_data
          ),
          campaigns (
            id,
            name,
            start_date,
            end_date,
            spin_limit_per_user,
            total_spin_limit,
            is_active
          )
        `)
        .eq('id', wheelId)
        .eq('is_active', true)
        .single()

      if (error || !wheel) {
        return new Response(
          JSON.stringify({ error: 'Wheel not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if wheel is currently active based on schedule
      const isActive = await checkWheelSchedule(wheel)
      
      if (!isActive) {
        return new Response(
          JSON.stringify({ 
            error: 'Wheel is not active at this time',
            schedule: wheel.schedule_config,
            nextActiveTime: await getNextActiveTime(wheel)
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Add cache headers for performance
      return new Response(
        JSON.stringify(wheel),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60' // Cache for 1 minute due to scheduling
          }
        }
      )
    }

    // Route: POST /api/widget/spin
    if (req.method === 'POST' && url.pathname === '/api/widget/spin') {
      const body = await req.json()
      const { wheelId, email, marketingConsent, segmentId, userAgent, referrer, platform } = body

      // Get active campaign
      const { data: campaigns } = await supabase
        .from('spinawheel.campaigns')
        .select('*')
        .eq('wheel_id', wheelId)
        .eq('is_active', true)
      
      const activeCampaign = campaigns?.find(c => {
        const now = new Date()
        if (c.start_date && new Date(c.start_date) > now) return false
        if (c.end_date && new Date(c.end_date) < now) return false
        return true
      })

      if (!activeCampaign) {
        return new Response(
          JSON.stringify({ error: 'No active campaign' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check spin limits
      if (activeCampaign.spin_limit_per_user) {
        const { count } = await supabase
          .from('spinawheel.spins')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', activeCampaign.id)
          .eq('email', email)

        if (count && count >= activeCampaign.spin_limit_per_user) {
          return new Response(
            JSON.stringify({ error: 'Spin limit reached' }),
            { 
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Get IP address from request
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown'

      // Record spin
      const { data: spin, error: spinError } = await supabase
        .from('spinawheel.spins')
        .insert({
          campaign_id: activeCampaign.id,
          email,
          ip_address: ip,
          user_agent: userAgent,
          segment_won_id: segmentId,
          spin_result: {
            referrer,
            platform,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (spinError) {
        console.error('Spin error:', spinError)
        return new Response(
          JSON.stringify({ error: 'Failed to record spin' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Record email capture
      await supabase
        .from('spinawheel.email_captures')
        .insert({
          spin_id: spin.id,
          email,
          marketing_consent: marketingConsent
        })

      // Get segment details for prize
      const { data: segment } = await supabase
        .from('spinawheel.segments')
        .select('*')
        .eq('id', segmentId)
        .single()

      // Generate claim code if it's a winning segment
      let claimCode = null
      if (segment && segment.prize_type !== 'no_prize') {
        claimCode = `${segment.value}-${Date.now().toString(36).toUpperCase()}`
        
        await supabase
          .from('spinawheel.spins')
          .update({ claim_code: claimCode })
          .eq('id', spin.id)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          spinId: spin.id,
          claimCode,
          segment
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Widget API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})