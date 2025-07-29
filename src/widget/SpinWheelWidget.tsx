import React, { useState, useEffect } from 'react';
import { FortuneWheel } from '../components/wheel/FortuneWheel';
import type { WheelConfig, SpinResult } from '../types/wheel.types';
import type { WheelWidgetConfig, WheelSegment } from '../types/widget';
import confetti from 'canvas-confetti';

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
  const [showEmailCapture, setShowEmailCapture] = useState(
    wheelConfig.emailCaptureConfig.enabled && 
    wheelConfig.emailCaptureConfig.timing === 'before_spin'
  );
  const [email, setEmail] = useState('');
  const [additionalFields, setAdditionalFields] = useState<Record<string, any>>({});
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  // Convert widget config to wheel component format
  const getWheelComponentConfig = (): WheelConfig => {
    const { wheelData } = wheelConfig;
    const handleType = wheelConfig.handleConfig.type;
    
    return {
      segments: wheelData.segments.map(s => ({
        id: s.id,
        label: s.label,
        value: s.value,
        color: s.color,
        weight: s.probability
      })),
      dimensions: {
        diameter: wheelData.style.size,
        innerRadius: wheelData.style.centerCircleSize / 2,
        pegRingWidth: 20,
        pegSize: 8,
        pegCount: 12
      },
      style: {
        shadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        borderColor: wheelData.style.borderColor,
        borderWidth: wheelData.style.borderWidth
      },
      centerCircle: {
        text: handleType === 'button' ? (wheelConfig.handleConfig.text || 'SPIN') : '',
        backgroundColor: wheelData.style.centerCircleColor,
        textColor: wheelConfig.handleConfig.style.textColor,
        fontSize: wheelConfig.handleConfig.style.fontSize,
        showButton: handleType === 'button'
      },
      pointer: {
        color: wheelData.style.pointerColor,
        size: 40,
        style: (() => {
          switch (wheelData.style.pointerStyle) {
            case 'arrow':
            case 'triangle':
              return wheelData.style.pointerStyle;
            case 'custom':
            default:
              return 'arrow';
          }
        })()
      },
      spinConfig: {
        duration: wheelData.physics.spinDuration / 1000, // Convert ms to seconds
        easing: wheelData.physics.spinEasing === 'cubic-bezier' ? 'ease-in-out' : 
                wheelData.physics.spinEasing as 'ease-out' | 'ease-in-out' | 'linear',
        minRotations: wheelData.physics.minSpins,
        maxRotations: wheelData.physics.maxSpins,
        allowDrag: handleType === 'swipe'
      }
    };
  };

  // Handle different trigger types
  useEffect(() => {
    if (!showEmailCapture && !hasSpun) {
      if (wheelConfig.handleConfig.type === 'auto_spin') {
        // Auto spin after a delay
        setTimeout(() => {
          setShowWheel(true);
        }, 1000);
      } else {
        setShowWheel(true);
      }
    }
  }, [showEmailCapture, hasSpun, wheelConfig.handleConfig.type]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setShowEmailCapture(false);
    
    // Store email for later use
    if (wheelConfig.emailCaptureConfig.timing === 'after_spin') {
      // Will capture email after spin
    }
  };

  const handleSpinComplete = async (result: SpinResult) => {
    setSpinResult(result);
    setHasSpun(true);

    // Find the full segment data
    const segment = wheelConfig.wheelData.segments.find(s => s.id === result.segment.id);
    if (!segment) return;

    // Trigger celebration
    if (wheelConfig.celebrationConfig.type !== 'none') {
      triggerCelebration(segment);
    }

    // Play sound if enabled
    if (wheelConfig.celebrationConfig.sound?.enabled) {
      playSound(segment.prizeType === 'no_prize' ? 'lose' : 'win');
    }

    // Record the spin
    await callbacks.onSpin({
      wheelId: wheelConfig.id,
      storeId: storeData.id,
      segmentId: result.segment.id,
      prize: segment,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      platform
    });

    // If email capture is after spin, show it now
    if (wheelConfig.emailCaptureConfig.enabled && 
        wheelConfig.emailCaptureConfig.timing === 'after_spin' && 
        !email) {
      setShowEmailCapture(true);
    }
  };

  const triggerCelebration = (segment: WheelSegment) => {
    if (segment.prizeType === 'no_prize') return;

    switch (wheelConfig.celebrationConfig.type) {
      case 'confetti':
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        break;
      case 'fireworks':
        const duration = wheelConfig.celebrationConfig.duration;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(() => {
          if (Date.now() > animationEnd) {
            clearInterval(interval);
            return;
          }
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount: 50,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.2
            }
          });
        }, 250);
        break;
      case 'balloons':
        // Custom balloon animation would go here
        break;
    }
  };

  const playSound = (type: 'win' | 'lose') => {
    const soundConfig = wheelConfig.celebrationConfig.sound;
    if (!soundConfig) return;

    const soundUrl = type === 'win' ? soundConfig.winSound : soundConfig.loseSound;
    if (!soundUrl) return;

    const audio = new Audio(soundUrl);
    audio.volume = soundConfig.volume;
    audio.play().catch(console.error);
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('coolpops_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('coolpops_session_id', sessionId);
    }
    return sessionId;
  };

  const handlePrizeAccept = async () => {
    if (!spinResult || !email) return;

    const segment = wheelConfig.wheelData.segments.find(s => s.id === spinResult.segment.id);
    if (!segment) return;

    await callbacks.onPrizeAccepted(segment, email);
    callbacks.onClose();
  };

  const renderEmailForm = () => {
    const { emailCaptureConfig } = wheelConfig;
    const formStyle = emailCaptureConfig.formStyle;

    return (
      <div 
        className="coolpops-modal"
        style={{
          backgroundColor: formStyle.backgroundColor,
          color: formStyle.textColor,
          fontFamily: formStyle.fontFamily,
          borderRadius: `${formStyle.borderRadius}px`
        }}
      >
        <h2 className="coolpops-title">
          {hasSpun && spinResult ? 
            '¡Un paso más!' : 
            '¡Gira y Gana!'}
        </h2>
        
        {emailCaptureConfig.successMessage && !hasSpun && (
          <p className="coolpops-subtitle">{emailCaptureConfig.successMessage}</p>
        )}
        
        <form onSubmit={hasSpun ? handlePrizeAccept : handleEmailSubmit} className="coolpops-form">
          {emailCaptureConfig.fields.map(field => (
            <div key={field.name} className="coolpops-field">
              {field.type === 'checkbox' ? (
                <label className="coolpops-checkbox">
                  <input
                    type="checkbox"
                    name={field.name}
                    required={field.required}
                    checked={additionalFields[field.name] || false}
                    onChange={(e) => setAdditionalFields({
                      ...additionalFields,
                      [field.name]: e.target.checked
                    })}
                  />
                  <span>{field.label}</span>
                </label>
              ) : (
                <>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    type={field.type}
                    name={field.name}
                    value={field.name === 'email' ? email : (additionalFields[field.name] || '')}
                    onChange={(e) => {
                      if (field.name === 'email') {
                        setEmail(e.target.value);
                      } else {
                        setAdditionalFields({
                          ...additionalFields,
                          [field.name]: e.target.value
                        });
                      }
                    }}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="coolpops-input"
                    style={{
                      backgroundColor: formStyle.inputBackgroundColor,
                      borderColor: formStyle.inputBorderColor,
                      borderRadius: `${formStyle.borderRadius}px`
                    }}
                  />
                </>
              )}
            </div>
          ))}
          
          {emailCaptureConfig.consentText && (
            <p className="coolpops-consent">
              {emailCaptureConfig.consentText}
              {emailCaptureConfig.privacyPolicyUrl && (
                <> <a href={emailCaptureConfig.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a></>
              )}
            </p>
          )}
          
          <button 
            type="submit" 
            className="coolpops-button"
            style={{
              backgroundColor: formStyle.buttonBackgroundColor,
              color: formStyle.buttonTextColor,
              borderRadius: `${formStyle.borderRadius}px`
            }}
          >
            {hasSpun ? 'Claim Prize' : 'Spin Now!'}
          </button>
        </form>
      </div>
    );
  };

  const renderResult = () => {
    if (!spinResult) return null;

    const segment = wheelConfig.wheelData.segments.find(s => s.id === spinResult.segment.id);
    if (!segment) return null;

    const message = wheelConfig.celebrationConfig.message;
    const isWin = segment.prizeType !== 'no_prize';

    return (
      <div className="coolpops-result">
        <h2 className="coolpops-win-title">
          {isWin ? message.winTitle : message.loseTitle}
        </h2>
        
        <p className="coolpops-win-message">
          {isWin ? 
            message.winDescription.replace('{prize}', segment.label) : 
            message.loseDescription}
        </p>
        
        {isWin && segment.discountCode && (
          <div className="coolpops-promo-code">
            <span className="coolpops-code-label">Your Discount Code:</span>
            <div className="coolpops-code-box">
              <code>{segment.discountCode}</code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(segment.discountCode!);
                  // Show feedback
                }} 
                className="coolpops-copy-button"
              >
                Copy
              </button>
            </div>
          </div>
        )}
        
        {segment.description && (
          <p className="coolpops-description">{segment.description}</p>
        )}
        
        <div className="coolpops-actions">
          {wheelConfig.emailCaptureConfig.timing === 'with_prize' && !email ? (
            renderEmailForm()
          ) : (
            <>
              {isWin && (
                <button 
                  onClick={handlePrizeAccept} 
                  className="coolpops-button coolpops-primary"
                >
                  {message.claimButtonText}
                </button>
              )}
              <button 
                onClick={callbacks.onClose} 
                className="coolpops-button coolpops-secondary"
              >
                {message.dismissButtonText}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="coolpops-widget">
      {/* Close button */}
      <button
        onClick={callbacks.onClose}
        className="coolpops-close"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="coolpops-container">
        {/* Email Capture Modal */}
        {showEmailCapture && !spinResult && renderEmailForm()}

        {/* Wheel Display */}
        {showWheel && !showEmailCapture && !spinResult && (
          <div className="coolpops-wheel-container">
            <FortuneWheel
              config={getWheelComponentConfig()}
              onSpinComplete={handleSpinComplete}
            />
          </div>
        )}

        {/* Result Display */}
        {spinResult && renderResult()}
      </div>
    </div>
  );
};