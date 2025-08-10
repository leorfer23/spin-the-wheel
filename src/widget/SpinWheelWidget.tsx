import React, { useState, useCallback } from 'react';
import { FullWidget } from '../components/widget/FullWidget';
import type { WheelWidgetConfig, WheelSegment } from '../types/widget';

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
  
  console.log('[SpinWheelWidget] Using unified FullWidget with config:', {
    wheelId: wheelConfig.id,
    storeId: wheelConfig.storeId,
    segmentsCount: wheelConfig.wheelData?.segments?.length,
    handleType: wheelConfig.handleConfig?.type,
    handlePosition: wheelConfig.handleConfig?.style?.position
  });
  
  console.log('[SpinWheelWidget] Full handle config:', wheelConfig.handleConfig);

  // Convert widget config to FullWidget format
  const convertToFullWidgetConfig = useCallback(() => {
    const { wheelData, handleConfig, emailCaptureConfig, config } = wheelConfig;
    
    // Extract all configurations from the database
    const widgetHandle = config?.wheelHandle || {};
    const emailCapture = config?.emailCapture || {};
    const style = config?.style || {};
    
    console.log('[SpinWheelWidget] Using complete config from database:', {
      style,
      widgetHandle,
      emailCapture
    });
    
    return {
      // Handle configuration from database
      handleType: widgetHandle.handleType || handleConfig.type === 'button' ? 'floating' : handleConfig.type as any,
      handlePosition: widgetHandle.handlePosition || ((handleConfig.style?.position === 'center' || handleConfig.style?.position === 'bottom' || handleConfig.style?.position === 'custom' ? 'right' : handleConfig.style?.position as 'left' | 'right') || 'right'),
      handleText: widgetHandle.handleText || handleConfig.text || '¡Gana Premios!',
      handleBackgroundColor: widgetHandle.handleBackgroundColor || handleConfig.style?.backgroundColor || '#8B5CF6',
      handleTextColor: widgetHandle.handleTextColor || handleConfig.style?.textColor || '#FFFFFF',
      handleIcon: widgetHandle.handleIcon || handleConfig.icon || '🎁',
      handleSize: widgetHandle.handleSize || (handleConfig.size || 'medium') as 'small' | 'medium' | 'large',
      handleAnimation: widgetHandle.handleAnimation || (() => {
        const anim = typeof handleConfig.animation === 'string' ? handleConfig.animation : handleConfig.animation?.type;
        if (anim === 'glow' || !anim) return 'pulse';
        return anim as 'none' | 'pulse' | 'bounce' | 'rotate';
      })(),
      handleBorderRadius: String(widgetHandle.handleBorderRadius || handleConfig.style?.borderRadius || '9999px'),
      
      // Email capture configuration from database
      captureImageUrl: emailCapture.captureImageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
      captureTitle: emailCapture.captureTitle || '¡Gira y Gana Premios Increíbles!',
      captureSubtitle: emailCapture.captureSubtitle || 'Ingresa tu email para participar y ganar descuentos exclusivos',
      captureButtonText: emailCapture.captureButtonText || '¡Quiero Participar!',
      capturePrivacyText: emailCapture.capturePrivacyText || emailCaptureConfig.consentText || 'Al participar, aceptas recibir emails promocionales.',
      captureFormat: emailCapture.captureFormat || 'instant' as const,
      
      // Wheel segments with complete configuration
      segments: (config?.segments || wheelData.segments).map((seg: any) => ({
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
      spinDuration: style.spinDuration || wheelData.physics?.spinDuration || 5000,
      confettiEnabled: style.confettiEnabled !== false,
      soundEnabled: style.soundEnabled || false,
      
      // General styling
      primaryColor: widgetHandle.handleBackgroundColor || handleConfig.style?.backgroundColor || '#8B5CF6',
      backgroundColor: style.backgroundColor || wheelData.style?.backgroundColor || '#FFFFFF'
    };
  }, [wheelConfig]);

  const handleEmailSubmit = useCallback((email: string, marketingConsent: boolean) => {
    setCapturedEmail(email);
    // Email is stored for later use in prize acceptance
    console.log('[SpinWheelWidget] Email captured:', email, 'Marketing consent:', marketingConsent);
  }, []);

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
      onClose={callbacks.onClose}
      onEmailSubmit={handleEmailSubmit}
      onSpinComplete={handleSpinComplete}
    />
  );
};