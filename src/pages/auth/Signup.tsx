import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      // Navigate to dashboard immediately after signup
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.2),transparent_50%)]" />
      </div>

      {/* Floating shapes animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '20%', right: '15%' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '15%', left: '10%' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4 sm:px-6"
      >
        {/* Main floating card */}
        <div className="relative">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-2xl bg-white/70 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 p-6 sm:p-8 lg:p-10">
            
            {/* Hero Image Placeholder */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 sm:mb-8 mx-auto w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden"
            >
              {/* Placeholder for illustration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="text-center z-10">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm font-medium text-orange-600">
                  {/* Image placeholder description */}
                  Coloca una ilustración atractiva aquí:
                  <br />
                  <span className="text-xs opacity-75 hidden sm:block">
                    Un personaje celebrando o explosión de confeti,
                    <br />
                    mostrando emoción por unirse
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Comienza a girar hoy
              </h1>
              <p className="text-gray-500 text-sm">
                Crea ruletas atractivas para tu tienda
              </p>
            </motion.div>

            {/* Error messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-5 text-base bg-gray-50/50 border-gray-200/50 rounded-2xl placeholder:text-gray-400 focus:bg-white focus:border-orange-400 transition-all"
                  required
                />
              </motion.div>

              {/* Password input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Input
                  type="password"
                  placeholder="Contraseña (mín 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-5 text-base bg-gray-50/50 border-gray-200/50 rounded-2xl placeholder:text-gray-400 focus:bg-white focus:border-orange-400 transition-all"
                  required
                />
              </motion.div>

              {/* Confirm Password input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-14 px-5 text-base bg-gray-50/50 border-gray-200/50 rounded-2xl placeholder:text-gray-400 focus:bg-white focus:border-orange-400 transition-all"
                  required
                />
              </motion.div>

              {/* Terms notice */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500">
                  Al registrarte, aceptas nuestros{' '}
                  <Link to="/terms" className="text-purple-600 hover:text-purple-700">Términos</Link> y{' '}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-700">Privacidad</Link>
                </p>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-200 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        Crear cuenta
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>
          </div>

          {/* Bottom card for login link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 sm:mt-6 backdrop-blur-xl bg-white/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center border border-white/50 shadow-lg"
          >
            <p className="text-sm sm:text-base text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};