import { supabase } from '../lib/supabase';
import type { Integration, IntegrationInput, EmailCapture } from '../types/models';
import type { ApiResponse } from '../types/models';

export class IntegrationService {
  static async createIntegration(storeId: string, data: Omit<IntegrationInput, 'store_id'>): Promise<ApiResponse<Integration>> {
    try {
      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({ ...data, store_id: storeId })
        .select()
        .single();

      if (error) throw error;

      await this.testConnection(integration);

      return { data: integration, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to create integration', 
        success: false 
      };
    }
  }

  static async getIntegrations(storeId: string): Promise<ApiResponse<Integration[]>> {
    try {
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: integrations || [], success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch integrations', 
        success: false 
      };
    }
  }

  static async updateIntegration(integrationId: string, data: Partial<IntegrationInput>): Promise<ApiResponse<Integration>> {
    try {
      const { data: integration, error } = await supabase
        .from('integrations')
        .update(data)
        .eq('id', integrationId)
        .select()
        .single();

      if (error) throw error;

      if (data.api_credentials) {
        await this.testConnection(integration);
      }

      return { data: integration, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update integration', 
        success: false 
      };
    }
  }

  static async deleteIntegration(integrationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete integration', 
        success: false 
      };
    }
  }

  static async testConnection(integration: Integration): Promise<ApiResponse<boolean>> {
    try {
      const result = await supabase.functions.invoke('test-integration', {
        body: { integration }
      });

      if (result.error) throw result.error;

      return { data: result.data.success, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Connection test failed', 
        success: false 
      };
    }
  }

  static async syncEmails(storeId: string): Promise<ApiResponse<{ synced: number; failed: number }>> {
    try {
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (!integrations || integrations.length === 0) {
        return { data: { synced: 0, failed: 0 }, success: true };
      }

      const { data: wheels } = await supabase
        .from('wheels')
        .select('id')
        .eq('store_id', storeId);

      const wheelIds = wheels?.map(w => w.id) || [];

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .in('wheel_id', wheelIds);

      const campaignIds = campaigns?.map(c => c.id) || [];

      const { data: spins } = await supabase
        .from('spins')
        .select('id')
        .in('campaign_id', campaignIds);

      const spinIds = spins?.map(s => s.id) || [];

      const { data: emailCaptures } = await supabase
        .from('email_captures')
        .select('*')
        .in('spin_id', spinIds)
        .eq('synced_to_provider', false)
        .eq('marketing_consent', true);

      if (!emailCaptures || emailCaptures.length === 0) {
        return { data: { synced: 0, failed: 0 }, success: true };
      }

      const results = await Promise.all(
        integrations.map(integration => 
          this.syncEmailsToProvider(integration, emailCaptures)
        )
      );

      const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
      const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

      await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('store_id', storeId);

      return { 
        data: { synced: totalSynced, failed: totalFailed }, 
        success: true 
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to sync emails', 
        success: false 
      };
    }
  }

  private static async syncEmailsToProvider(
    integration: Integration, 
    emailCaptures: EmailCapture[]
  ): Promise<{ synced: number; failed: number }> {
    try {
      const result = await supabase.functions.invoke('sync-emails', {
        body: { 
          integration,
          emails: emailCaptures.map(e => ({
            email: e.email,
            captureId: e.id,
            timestamp: e.created_at
          }))
        }
      });

      if (result.error) throw result.error;

      const syncedIds = result.data.syncedIds || [];
      
      if (syncedIds.length > 0) {
        await supabase
          .from('email_captures')
          .update({ 
            synced_to_provider: true,
            sync_status: 'success'
          })
          .in('id', syncedIds);
      }

      return {
        synced: syncedIds.length,
        failed: emailCaptures.length - syncedIds.length
      };
    } catch (error) {
      return { synced: 0, failed: emailCaptures.length };
    }
  }

  static async getProviderTemplates(provider: string): Promise<ApiResponse<any[]>> {
    try {
      const templates: Record<string, any[]> = {
        mailchimp: [
          { id: 'welcome', name: 'Welcome Email', description: 'Send when user joins list' },
          { id: 'prize_won', name: 'Prize Won', description: 'Send when user wins a prize' },
        ],
        klaviyo: [
          { id: 'welcome_series', name: 'Welcome Series', description: '3-email welcome flow' },
          { id: 'win_notification', name: 'Win Notification', description: 'Prize winner notification' },
        ],
        sendgrid: [
          { id: 'transactional', name: 'Transactional', description: 'Basic transactional template' },
          { id: 'marketing', name: 'Marketing', description: 'Marketing campaign template' },
        ]
      };

      return { 
        data: templates[provider] || [], 
        success: true 
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch templates', 
        success: false 
      };
    }
  }
}