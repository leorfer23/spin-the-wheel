import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step, Styles } from 'react-joyride';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Store, Palette, Clock, Trophy, Rocket } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface OnboardingContextType {
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  isOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

const customStyles: Partial<Styles> = {
  options: {
    primaryColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    width: 420,
    zIndex: 10000,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
  },
  spotlight: {
    borderRadius: '24px',
    backgroundColor: 'transparent',
  },
  tooltip: {
    borderRadius: '24px',
    fontSize: '16px',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  tooltipTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1F2937',
  },
  tooltipContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4B5563',
  },
  buttonNext: {
    backgroundColor: '#8B5CF6',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    padding: '10px 20px',
  },
  buttonBack: {
    color: '#6B7280',
    fontSize: '15px',
    fontWeight: '500',
    marginRight: '10px',
  },
  buttonSkip: {
    color: '#9CA3AF',
    fontSize: '14px',
  },
  buttonClose: {
    display: 'none',
  },
};

const steps: Step[] = [
  {
    target: '.onboarding-welcome',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">¡Comencemos con tu Dashboard! 🎉</h3>
        </div>
        <p className="text-gray-600">
          Este es tu centro de control para crear y gestionar ruletas de premios. 
          Te guiaremos paso a paso para que tengas tu primera ruleta funcionando rápidamente.
        </p>
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-2 bg-purple-200 rounded-full" />
          <div className="flex-1 h-2 bg-gray-200 rounded-full" />
          <div className="flex-1 h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.store-connection',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Store className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Paso 1: Conecta tu Tienda</h3>
        </div>
        <p className="text-gray-600">
          Haz clic aquí para conectar tu cuenta de TiendaNube. Es muy fácil:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-2">
          <li>Haz clic en "Conectar TiendaNube"</li>
          <li>Inicia sesión en tu cuenta de TiendaNube</li>
          <li>Autoriza la conexión (es seguro)</li>
          <li>¡Listo! Tu tienda estará conectada</li>
        </ol>
      </div>
    ),
    placement: 'bottom',
    spotlightClicks: true,
  },
  {
    target: '.wheel-creation',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <Palette className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Paso 2: Crea tu Primera Ruleta</h3>
        </div>
        <p className="text-gray-600">
          Aquí podrás crear tu primera ruleta de premios. Elige entre nuestras plantillas 
          prediseñadas o personaliza completamente tu ruleta.
        </p>
      </div>
    ),
    placement: 'right',
    spotlightClicks: true,
  },
  {
    target: '.wheel-preview',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Tu Ruleta en Acción</h3>
        </div>
        <p className="text-gray-600">
          Esta es la vista previa de tu ruleta. Los clientes la verán así en tu tienda:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🎯 <strong>Botón flotante:</strong> Aparece en tu tienda</li>
          <li>📧 <strong>Captura de email:</strong> Recolecta leads</li>
          <li>🎰 <strong>Gira la ruleta:</strong> Click o arrastra para girar</li>
          <li>🎉 <strong>Premio:</strong> Muestra el premio ganado</li>
        </ul>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.config-segments',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Palette className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Configura los Premios</h3>
        </div>
        <p className="text-gray-600">
          Personaliza cada segmento de tu ruleta:
        </p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• Texto del premio (ej: "20% de descuento")</li>
          <li>• Probabilidad de ganar</li>
          <li>• Colores y diseño</li>
          <li>• Mensaje al ganar</li>
        </ul>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.config-scheduling',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Programa tu Campaña</h3>
        </div>
        <p className="text-gray-600">
          Define cuándo estará activa tu ruleta:
        </p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• Fechas de inicio y fin</li>
          <li>• Horarios específicos</li>
          <li>• Días de la semana</li>
          <li>• Límite de giros por usuario</li>
        </ul>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.onboarding-complete',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Rocket className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">¡Todo Listo! 🚀</h3>
        </div>
        <p className="text-gray-600">
          Ya sabes todo lo necesario para comenzar. Tu ruleta está lista para 
          aumentar las ventas de tu tienda.
        </p>
        <div className="p-3 bg-purple-50 rounded-xl mt-4">
          <p className="text-sm text-purple-700 font-medium">
            💡 Consejo: Revisa las estadísticas regularmente para optimizar tus campañas.
          </p>
        </div>
      </div>
    ),
    placement: 'center',
  },
];

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Only run onboarding on dashboard routes for authenticated users
      if (!user || !location.pathname.startsWith('/dashboard')) {
        setShowWelcome(false);
        setRun(false);
        return;
      }

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('onboarding_completed, onboarding_current_step')
        .eq('user_id', user.id)
        .single();

      if (!preferences?.onboarding_completed) {
        setShowWelcome(true);
        if (preferences?.onboarding_current_step) {
          setStepIndex(preferences.onboarding_current_step);
        }
      }
    };

    checkOnboardingStatus();
  }, [user, location.pathname]);

  const updateOnboardingStep = async (step: number) => {
    if (!user) return;

    await supabase
      .from('user_preferences')
      .update({
        onboarding_current_step: step,
        onboarding_started_at: step === 0 ? new Date().toISOString() : undefined,
      })
      .eq('user_id', user.id);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    await supabase
      .from('user_preferences')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  };

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setShowWelcome(false);
      completeOnboarding();
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
      updateOnboardingStep(index + 1);
    }
  }, [user]);

  const startOnboarding = () => {
    // Only start if user is authenticated and on dashboard
    if (!user || !location.pathname.startsWith('/dashboard')) {
      return;
    }
    setStepIndex(0);
    setRun(true);
    updateOnboardingStep(0);
  };

  const skipOnboarding = () => {
    setRun(false);
    setShowWelcome(false);
    completeOnboarding();
  };

  const nextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <OnboardingContext.Provider
      value={{
        startOnboarding,
        skipOnboarding,
        nextStep,
        previousStep,
        isOnboarding: run,
        currentStep: stepIndex,
        totalSteps: steps.length,
      }}
    >
      {children}

      <AnimatePresence>
        {showWelcome && !run && location.pathname.startsWith('/dashboard') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ¡Bienvenido a tu Dashboard!
                  </h2>
                  <p className="text-gray-600">
                    Te mostraremos cómo configurar tu primera ruleta de premios y conectar tu tienda en solo 3 minutos
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={skipOnboarding}
                    className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Saltar tutorial
                  </button>
                  <button
                    onClick={startOnboarding}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Comenzar tour
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Joyride
        continuous
        run={run}
        steps={steps}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        styles={customStyles}
        showProgress
        showSkipButton
        locale={{
          back: 'Anterior',
          close: 'Cerrar',
          last: 'Finalizar',
          next: 'Siguiente',
          skip: 'Saltar',
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />
    </OnboardingContext.Provider>
  );
};