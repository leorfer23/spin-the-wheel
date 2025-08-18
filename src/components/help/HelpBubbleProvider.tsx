import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPreferencesService } from '@/services/userPreferencesService';

interface HelpBubbleContextType {
  helpEnabled: boolean;
  toggleHelp: () => void;
  resetHelpBubbles: () => void;
  markAsSeen: (bubbleId: string) => void;
  hasSeenBubble: (bubbleId: string) => boolean;
  seenBubbles: Set<string>;
}

const HelpBubbleContext = createContext<HelpBubbleContextType | undefined>(undefined);

export const useHelpBubbles = () => {
  const context = useContext(HelpBubbleContext);
  if (!context) {
    throw new Error('useHelpBubbles must be used within HelpBubbleProvider');
  }
  return context;
};

interface HelpBubbleProviderProps {
  children: React.ReactNode;
}

export const HelpBubbleProvider: React.FC<HelpBubbleProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [helpEnabled, setHelpEnabled] = useState(true);
  const [seenBubbles, setSeenBubbles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserPreferences();
    loadSeenBubbles();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    const preferences = await UserPreferencesService.getUserPreferences(user.id);
    if (preferences?.notification_preferences) {
      const helpSetting = (preferences.notification_preferences as any).help_bubbles;
      if (helpSetting !== undefined) {
        setHelpEnabled(helpSetting);
      }
    }
  };

  const loadSeenBubbles = () => {
    const seen = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('help_bubble_seen_')) {
        const bubbleId = key.replace('help_bubble_seen_', '');
        seen.add(bubbleId);
      }
    }
    setSeenBubbles(seen);
  };

  const toggleHelp = async () => {
    const newValue = !helpEnabled;
    setHelpEnabled(newValue);

    if (user) {
      const preferences = await UserPreferencesService.getUserPreferences(user.id);
      if (preferences) {
        await UserPreferencesService.updatePreferences(user.id, {
          notification_preferences: {
            ...preferences.notification_preferences,
            help_bubbles: newValue,
          },
        });
      }
    }
  };

  const resetHelpBubbles = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('help_bubble_seen_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setSeenBubbles(new Set());
  };

  const markAsSeen = (bubbleId: string) => {
    localStorage.setItem(`help_bubble_seen_${bubbleId}`, 'true');
    setSeenBubbles(prev => new Set(prev).add(bubbleId));
  };

  const hasSeenBubble = (bubbleId: string) => {
    return seenBubbles.has(bubbleId);
  };

  return (
    <HelpBubbleContext.Provider
      value={{
        helpEnabled,
        toggleHelp,
        resetHelpBubbles,
        markAsSeen,
        hasSeenBubble,
        seenBubbles,
      }}
    >
      {children}
    </HelpBubbleContext.Provider>
  );
};