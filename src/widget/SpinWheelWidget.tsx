import React, { useState, useCallback } from 'react';
import { FullWidget } from '../components/widget/FullWidget';
import type { WheelWidgetConfig } from '../types/widget';
import { widgetAnalytics } from '../services/widgetAnalyticsService';

interface WidgetProps {
  wheelConfig: WheelWidgetConfig;
  platform: string;
  storeData: {
    id: string;
    name?: string;
    currency?: string;
    language?: string;
  };
  callbacks: {
    onOpen?: () => void;
    onClose: () => void;
    onSpin: (result: any) => Promise<void>;
    onPrizeAccepted: (prize: any, email: string) => Promise<void>;
  };
}

export const SpinWheelWidget: React.FC<WidgetProps> = ({ 
  wheelConfig, 
  platform, 
  storeData, 
  callbacks 
}) => {
  const [capturedEmail, setCapturedEmail] = useState<string>('');

  // Convert widget config to FullWidget format
  const convertToFullWidgetConfig = useCallback(() => {
    const { wheelData, handleConfig, emailCaptureConfig } = wheelConfig;
    
    // Extract all configurations from the widget config
    // const widgetHandle = handleConfig || {};
    // const emailCapture = emailCaptureConfig || {};
    const style = wheelData?.style || {};
    
  return {
      // Handle configuration
      handleType: handleConfig.type === 'button' ? 'floating' : handleConfig.type as any,
      handlePosition: (handleConfig.style?.position === 'center' || handleConfig.style?.position === 'bottom' || handleConfig.style?.position === 'custom' ? 'right' : handleConfig.style?.position as 'left' | 'right') || 'right',
      handleText: handleConfig.text || '¡Gana Premios!',
      handleBackgroundColor: handleConfig.style?.backgroundColor || '#8B5CF6',
      handleTextColor: handleConfig.style?.textColor || '#FFFFFF',
      handleIcon: handleConfig.icon || '🎁',
      handleSize: (handleConfig.size || 'medium') as 'small' | 'medium' | 'large',
      handleAnimation: (() => {
        const anim = typeof handleConfig.animation === 'string' ? handleConfig.animation : handleConfig.animation?.type;
        if (anim === 'glow' || !anim) return 'pulse';
        return anim as 'none' | 'pulse' | 'bounce' | 'rotate';
      })(),
      handleBorderRadius: String(handleConfig.style?.borderRadius || '9999px'),
      
      // Email capture configuration
      captureImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
      captureTitle: '',  // Keep empty to use UnifiedWheelDialog's design
      captureSubtitle: '', // Keep empty to use UnifiedWheelDialog's design
      captureButtonText: '→',
      capturePrivacyText: emailCaptureConfig.consentText || '',
      captureFormat: 'instant' as const,
      
      // Wheel segments with complete configuration
      segments: wheelData.segments.map((seg: any) => ({
        id: seg.id,
        label: seg.label,
        value: seg.value,
        color: seg.color,
        weight: seg.weight || seg.probability || 10,
        textColor: seg.textColor,
        fontSize: seg.fontSize,
        fontWeight: seg.fontWeight,
        icon: seg.icon,
        image: seg.image
      })),
      
      // Wheel style configuration from database
      wheelDesign: style || {},
      
      // Additional configurations
      spinDuration: wheelData.physics?.spinDuration || 5000,
      confettiEnabled: true,
      soundEnabled: false,
      
      // General styling
      primaryColor: handleConfig.style?.backgroundColor || '#8B5CF6',
      backgroundColor: style.backgroundColor || wheelData.style?.backgroundColor || '#FFFFFF'
    };
  }, [wheelConfig]);

  const handleEmailSubmit = useCallback(async (email: string, marketingConsent?: boolean) => {
    setCapturedEmail(email);
    
    // Get impression ID from global variable
    const impressionId = (window as any).__coolPopsImpressionId;
    
    console.log('[CoolPops] Email submit initiated:', {
      email,
      marketingConsent,
      impressionId,
      wheelId: wheelConfig.id,
      storeId: storeData.id,
      globalVar: (window as any).__coolPopsImpressionId
    });
    
    // Track email capture to Supabase
    try {
      await widgetAnalytics.trackEmailCapture({
        email,
        marketingConsent: marketingConsent || false,
        impressionId,
        capturedAtStep: 'before_spin',
        additionalFields: {
          wheelId: wheelConfig.id,
          storeId: storeData.id,
          timestamp: new Date().toISOString()
        }
      });
      console.log('[CoolPops] Email captured successfully:', {
        email,
        impressionId,
        response: 'success'
      });
    } catch (error) {
      console.error('[CoolPops] Failed to track email capture:', error);
      console.error('[CoolPops] Error details:', {
        impressionId,
        error: JSON.stringify(error, null, 2)
      });
    }
  }, [wheelConfig.id, storeData.id]);

  const handleSpinComplete = useCallback(async (result: any) => {
    // Find the full segment data
    const segment = wheelConfig.wheelData.segments.find(s => s.id === result.segment.id);
    if (!segment) return;

    // Record the spin with enhanced analytics
    const spinData = {
      wheelId: wheelConfig.id,
      storeId: storeData.id,
      segmentId: result.segment.id,
      prize: segment,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      platform,
      spinDuration: result.duration,
      impressionId: (window as any).__coolPopsImpressionId
    };
    
    await callbacks.onSpin(spinData);

    // If we have an email and a prize, accept it automatically
    if (capturedEmail && segment.prizeType !== 'no_prize') {
      await callbacks.onPrizeAccepted(segment, capturedEmail);
    }
  }, [wheelConfig, storeData, platform, callbacks, capturedEmail]);

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('coolpops_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('coolpops_session_id', sessionId);
    }
    return sessionId;
  };

  // Use the unified FullWidget component
  return (
    <FullWidget
      config={convertToFullWidgetConfig()}
      onOpen={callbacks.onOpen}
      onClose={callbacks.onClose}
      onEmailSubmit={handleEmailSubmit}
      onSpinComplete={handleSpinComplete}
    />
  );
};