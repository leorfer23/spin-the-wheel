import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FortuneWheel } from '../components/wheel/FortuneWheel';
import { MinimalCelebration } from '../components/MinimalCelebration';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Gift, TrendingUp, Users, Star, ChevronDown, Menu, X } from 'lucide-react';
import type { WheelConfig, SpinResult } from '../types/wheel.types';

// Create responsive wheel configs
const createWheelConfig = (isMobile: boolean): WheelConfig => ({
  segments: [
    { id: '1', label: '50% OFF', value: '50OFF', color: '#FF6B6B', weight: 1 },
    { id: '2', label: 'FREE GIFT', value: 'GIFT', color: '#4ECDC4', weight: 1 },
    { id: '3', label: '30% OFF', value: '30OFF', color: '#FF8C42', weight: 2 },
    { id: '4', label: '20% OFF', value: '20OFF', color: '#95A99C', weight: 3 },
    { id: '5', label: 'SPIN AGAIN', value: 'AGAIN', color: '#FFD93D', textColor: '#333', weight: 2 },
    { id: '6', label: 'FREE SHIP', value: 'SHIP', color: '#E84855', weight: 2 }
  ],
  dimensions: {
    diameter: isMobile ? 350 : 550,
    innerRadius: isMobile ? 40 : 60,
    pegRingWidth: isMobile ? 30 : 40,
    pegSize: isMobile ? 10 : 14,
    pegCount: isMobile ? 8 : 12
  },
  style: {
    shadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    borderColor: '#ffffff',
    borderWidth: 12
  },
  centerCircle: {
    text: 'SPIN',
    backgroundColor: '#ffffff',
    textColor: '#666666',
    fontSize: 18,
    showButton: true
  },
  pointer: {
    color: '#FF1744',
    size: 50,
    style: 'arrow'
  },
  spinConfig: {
    duration: 5,
    easing: 'ease-out',
    minRotations: 4,
    maxRotations: 6,
    allowDrag: true
  }
});

const features = [
  {
    icon: Zap,
    title: "Aumenta las Conversiones",
    description: "Hasta un 35% más de ventas con gamificación interactiva"
  },
  {
    icon: Gift,
    title: "Captura Leads",
    description: "Recolecta emails de manera divertida y efectiva"
  },
  {
    icon: TrendingUp,
    title: "Métricas en Tiempo Real",
    description: "Analiza el comportamiento y optimiza tus campañas"
  },
  {
    icon: Users,
    title: "Integraciones Fáciles",
    description: "Conecta con Shopify, Tiendanube y más plataformas"
  }
];

const stats = [
  { value: "2M+", label: "Giros Mensuales" },
  { value: "35%", label: "Aumento en Ventas" },
  { value: "10K+", label: "Tiendas Activas" },
  { value: "4.9★", label: "Calificación" }
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const wheelY = useTransform(scrollY, [0, 300], [0, isMobile ? -20 : -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const wheelConfig = createWheelConfig(isMobile);

  const handleSpinComplete = (result: SpinResult) => {
    setSpinResult(result);
    setHasSpun(true);
  };

  // Removed the redirect to signup - users stay on landing page

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 overflow-x-hidden">
      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <img 
              src="/rooleta_wordmark_transparent.png" 
              alt="Rooleta" 
              className="h-8 object-contain"
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white border-t"
            >
              <div className="px-4 py-4 space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                >
                  Empieza Gratis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Hero Section */}
      <motion.section 
        className="relative flex items-start px-4 pt-20 pb-12 lg:pt-24 lg:pb-16"
        style={{ opacity: heroOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Logo for Desktop */}
            <div className="mb-8 hidden lg:block">
              <img 
                src="/rooleta_wordmark_transparent.png" 
                alt="Rooleta" 
                className="h-12 w-auto"
              />
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles size={16} />
              La Plataforma #1 de Gamificación
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transforma Visitantes
              </span>
              <br />
              <span className="text-gray-800">en Clientes</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Aumenta tus conversiones con ruedas de la fortuna interactivas. 
              Gamifica la experiencia de compra y mira crecer tus ventas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-500/25 w-full sm:w-auto"
                  onClick={() => navigate('/signup')}
                >
                  Empieza Gratis
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl border-2 w-full sm:w-auto"
                  onClick={() => navigate('/signup')}
                >
                  Prueba Gratis
                </Button>
              </motion.div>
            </div>
            
            {/* Login link for existing users */}
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center"
                  >
                    <Star size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">10,000+</span> tiendas confían en nosotros
              </p>
            </div>
          </motion.div>
          
          {/* Right Column - Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ y: wheelY }}
            className="relative order-1 lg:order-2 mb-8 lg:mb-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl lg:blur-3xl" />
            <div className="relative flex justify-center">
              <div className="relative">
                <FortuneWheel
                  config={wheelConfig}
                  onSpinComplete={handleSpinComplete}
                  hidePointer={!!spinResult}
                  autoSpin={true}
                  autoSpinDelay={800}
                />
                
                {/* Minimal celebration overlay */}
                <MinimalCelebration
                  result={spinResult}
                  onClose={() => setSpinResult(null)}
                />
              </div>
              
              {/* Animated pointing hand with GIRA!! text */}
              {!hasSpun && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                  className="absolute -right-8 sm:-right-16 lg:-right-24 top-1/2 -translate-y-1/2 z-20"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -10, 0, 10, 0],
                      x: [0, -10, 0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    {/* Pointing hand emoji */}
                    <div className="text-4xl sm:text-6xl lg:text-8xl transform rotate-180">
                      👉
                    </div>
                    
                    {/* GIRA!! text */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-8 sm:-top-12 lg:-top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-yellow-500 text-white font-black text-lg sm:text-2xl lg:text-3xl px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform -rotate-12">
                        ¡GIRA!
                      </div>
                    </motion.div>
                    
                    {/* Sparkles around the hand */}
                    <motion.div
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                      className="absolute -top-4 -right-4"
                    >
                      <Sparkles className="text-yellow-400 w-6 h-6" />
                    </motion.div>
                    
                    <motion.div
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1,
                      }}
                      className="absolute -bottom-4 -left-4"
                    >
                      <Sparkles className="text-purple-400 w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Floating badges around wheel - hidden on small mobile */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
              >
                <p className="text-xs sm:text-sm font-semibold text-purple-600">+35% Ventas</p>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
              >
                <p className="text-xs sm:text-sm font-semibold text-purple-600">2M+ Giros</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={32} className="text-gray-400" />
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Todo lo que necesitas
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas para transformar tu tienda en una experiencia interactiva
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-4 sm:p-6 h-full backdrop-blur-xl bg-white/90 border-white/20 shadow-xl rounded-2xl sm:rounded-3xl">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="p-8 sm:p-10 lg:p-12 backdrop-blur-xl bg-gradient-to-br from-blue-600 to-purple-600 border-0 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-white/10" />
              <div className="relative z-10 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  ¿Listo para aumentar tus ventas?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
                  Únete a miles de tiendas que ya están convirtiendo más con gamificación
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl w-full sm:w-auto"
                    onClick={() => navigate('/signup')}
                  >
                    Comenzar Ahora - Es Gratis
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>
                
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm opacity-75">
                  No se requiere tarjeta de crédito • Configuración en 5 minutos
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="text-sm">&copy; 2024 Rooleta. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
};