import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight, Sparkles, Trophy, Gift, Target, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth: React.FC = () => {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'signup'>(
    location.state?.mode === 'signup' ? 'signup' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        // Navigate to dashboard immediately after signup
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${mode === 'login' ? 'iniciar sesión' : 'crear cuenta'}`);
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="h-screen flex overflow-hidden">
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
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-8 h-full overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-8 xl:mb-12">
              <div className="inline-block bg-white rounded-2xl p-4 shadow-lg">
                <img 
                  src="/rooleta_wordmark_transparent.png" 
                  alt="Rooleta" 
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Main content */}
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-4 xl:mb-6 leading-tight">
              Aumenta tus ventas<br />
              con premios<br />
              interactivos
            </h1>
            <p className="text-lg xl:text-xl text-white/80 mb-8 xl:mb-12 max-w-lg">
              Crea ruletas atractivas que convierten visitantes en clientes. 
              Perfecto para Shopify, WooCommerce y cualquier plataforma de comercio electrónico.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 xl:gap-8 max-w-md">
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
            <div className="mt-8 xl:mt-12 2xl:mt-16 p-4 xl:p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
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
      <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-gray-50 overflow-y-auto">
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
                <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">Términos de Servicio</Link>{' '}
                y{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">Política de Privacidad</Link>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium text-base rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
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
            <div className="flex justify-center">
              <button
                type="button"
                disabled
                className="h-12 px-6 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-gray-400 font-medium opacity-60"
                title="Próximamente"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.5"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.5"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.5"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.5"/>
                </svg>
                Google (Próximamente)
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