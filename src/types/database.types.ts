export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          user_id: string
          store_name: string
          platform: 'shopify' | 'tienda_nube' | 'custom'
          store_url: string
          api_credentials: Json | null
          plan_tier: 'free' | 'starter' | 'growth' | 'enterprise'
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          store_name: string
          platform: 'shopify' | 'tienda_nube' | 'custom'
          store_url: string
          api_credentials?: Json | null
          plan_tier?: 'free' | 'starter' | 'growth' | 'enterprise'
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string
          platform?: 'shopify' | 'tienda_nube' | 'custom'
          store_url?: string
          api_credentials?: Json | null
          plan_tier?: 'free' | 'starter' | 'growth' | 'enterprise'
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      wheels: {
        Row: {
          id: string
          store_id: string
          name: string
          config: Json
          theme_preset: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          custom_css: string | null
          custom_js: string | null
          embed_code: string
          schedule_config: Json | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          config: Json
          theme_preset?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          custom_css?: string | null
          custom_js?: string | null
          embed_code?: string
          schedule_config?: Json | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          config?: Json
          theme_preset?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          custom_css?: string | null
          custom_js?: string | null
          embed_code?: string
          schedule_config?: Json | null
        }
      }
      campaigns: {
        Row: {
          id: string
          wheel_id: string
          name: string
          start_date: string | null
          end_date: string | null
          spin_limit_per_user: number | null
          total_spin_limit: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          wheel_id: string
          name: string
          start_date?: string | null
          end_date?: string | null
          spin_limit_per_user?: number | null
          total_spin_limit?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          wheel_id?: string
          name?: string
          start_date?: string | null
          end_date?: string | null
          spin_limit_per_user?: number | null
          total_spin_limit?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      segments: {
        Row: {
          id: string
          wheel_id: string
          label: string
          value: string
          color: string
          weight: number
          prize_type: 'discount' | 'product' | 'custom' | 'no_prize'
          prize_data: Json | null
          inventory_limit: number | null
          inventory_used: number
        }
        Insert: {
          id?: string
          wheel_id: string
          label: string
          value: string
          color: string
          weight?: number
          prize_type: 'discount' | 'product' | 'custom' | 'no_prize'
          prize_data?: Json | null
          inventory_limit?: number | null
          inventory_used?: number
        }
        Update: {
          id?: string
          wheel_id?: string
          label?: string
          value?: string
          color?: string
          weight?: number
          prize_type?: 'discount' | 'product' | 'custom' | 'no_prize'
          prize_data?: Json | null
          inventory_limit?: number | null
          inventory_used?: number
        }
      }
      spins: {
        Row: {
          id: string
          campaign_id: string
          email: string
          ip_address: string | null
          user_agent: string | null
          segment_won_id: string
          spin_result: Json
          created_at: string
          claimed_at: string | null
          claim_code: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          email: string
          ip_address?: string | null
          user_agent?: string | null
          segment_won_id: string
          spin_result: Json
          created_at?: string
          claimed_at?: string | null
          claim_code?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          email?: string
          ip_address?: string | null
          user_agent?: string | null
          segment_won_id?: string
          spin_result?: Json
          created_at?: string
          claimed_at?: string | null
          claim_code?: string | null
        }
      }
      email_captures: {
        Row: {
          id: string
          spin_id: string
          email: string
          marketing_consent: boolean
          synced_to_provider: boolean
          sync_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          spin_id: string
          email: string
          marketing_consent?: boolean
          synced_to_provider?: boolean
          sync_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          spin_id?: string
          email?: string
          marketing_consent?: boolean
          synced_to_provider?: boolean
          sync_status?: string | null
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          store_id: string
          provider: 'mailchimp' | 'klaviyo' | 'sendgrid' | 'activecampaign' | 'custom'
          api_credentials: Json
          settings: Json | null
          is_active: boolean
          last_sync_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          provider: 'mailchimp' | 'klaviyo' | 'sendgrid' | 'activecampaign' | 'custom'
          api_credentials: Json
          settings?: Json | null
          is_active?: boolean
          last_sync_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          provider?: 'mailchimp' | 'klaviyo' | 'sendgrid' | 'activecampaign' | 'custom'
          api_credentials?: Json
          settings?: Json | null
          is_active?: boolean
          last_sync_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}