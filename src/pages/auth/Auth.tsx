import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight, CheckCircle, Sparkles, Trophy, Gift, Target, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${mode === 'login' ? 'iniciar sesión' : 'crear cuenta'}`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating icons animation */}
        <motion.div
          className="absolute top-20 left-20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trophy className="w-16 h-16 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-32"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Gift className="w-12 h-12 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-32"
          animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Star className="w-14 h-14 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20"
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <Target className="w-10 h-10 text-white/20" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-12">
              <div className="inline-block bg-white rounded-2xl p-4 shadow-lg">
                <img 
                  src="/rooleta_wordmark_transparent.png" 
                  alt="Rooleta" 
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Main content */}
            <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Aumenta tus ventas<br />
              con premios<br />
              interactivos
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-lg">
              Crea ruletas atractivas que convierten visitantes en clientes. 
              Perfecto para Shopify, WooCommerce y cualquier plataforma de comercio electrónico.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md">
              <div>
                <div className="text-3xl font-bold text-white mb-1">92%</div>
                <div className="text-sm text-white/60">Tasa de Engagement</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">3.5x</div>
                <div className="text-sm text-white/60">Más Conversiones</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">45%</div>
                <div className="text-sm text-white/60">Captura de Email</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-16 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
              <p className="text-white/90 italic mb-4">
                "¡Rooleta aumentó nuestra lista de emails en un 300% e impulsó las ventas un 45% en solo 2 meses!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full" />
                <div>
                  <div className="text-white font-medium">María García</div>
                  <div className="text-white/60 text-sm">CEO, TiendaOnline</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Comienza ahora'}
            </h2>
            <p className="text-gray-600">
              {mode === 'login' 
                ? 'Ingresa tus credenciales para acceder a tu panel' 
                : 'Crea tu cuenta y comienza a construir ruletas increíbles'}
            </p>
          </div>

          {/* Error/Success messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                ¡Éxito! Redirigiendo al panel...
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 text-base bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 text-base bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Confirm Password input (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 text-base bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required={mode === 'signup'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me & Forgot password */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {/* Terms (signup only) */}
            {mode === 'signup' && (
              <div className="text-sm text-gray-600">
                Al registrarte, aceptas nuestros{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Términos de Servicio</a>{' '}
                y{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Política de Privacidad</a>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium text-base rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Cuenta creada
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">O continuar con</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:border-gray-400"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="h-12 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:border-gray-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Switch mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {mode === 'login' ? "¿No tienes una cuenta?" : '¿Ya tienes una cuenta?'}{' '}
              <button
                onClick={switchMode}
                className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer hover:underline transition-all"
              >
                {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};