import { supabase } from '@/lib/supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_current_step: number;
  onboarding_started_at?: string;
  onboarding_completed_at?: string;
  preferred_language: string;
  theme_preference: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    help_bubbles?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export class UserPreferencesService {
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data;
  }

  static async updateOnboardingStep(userId: string, step: number): Promise<void> {
    const updates: any = {
      onboarding_current_step: step,
    };

    if (step === 0) {
      updates.onboarding_started_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating onboarding step:', error);
    }
  }

  static async completeOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  static async resetOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        onboarding_completed: false,
        onboarding_current_step: 0,
        onboarding_started_at: null,
        onboarding_completed_at: null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting onboarding:', error);
    }
  }

  static async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating preferences:', error);
    }
  }

  static async createDefaultPreferences(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        onboarding_completed: false,
        onboarding_current_step: 0,
        preferred_language: 'es',
        theme_preference: 'light',
        notification_preferences: {
          email: true,
          push: false,
          help_bubbles: true,
        },
      });

    if (error && error.code !== '23505') {
      console.error('Error creating default preferences:', error);
    }
  }
}