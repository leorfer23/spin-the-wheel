import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FortuneWheel } from '../components/wheel/FortuneWheel';
import { MinimalCelebration } from '../components/MinimalCelebration';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Zap, Gift, TrendingUp, Star, ChevronDown, Menu, X,
  Calendar, Target, Palette, Gamepad2 as GamepadIcon, Trophy, BarChart, Mail, Smartphone, Check
} from 'lucide-react';
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

// Commented out - features array not currently used
// const features = [
//   {
//     icon: Zap,
//     title: "Aumenta las Conversiones",
//     description: "Hasta un 35% más de ventas con gamificación interactiva"
//   },
//   {
//     icon: Gift,
//     title: "Captura Leads",
//     description: "Recolecta emails de manera divertida y efectiva"
//   },
//   {
//     icon: TrendingUp,
//     title: "Métricas en Tiempo Real",
//     description: "Analiza el comportamiento y optimiza tus campañas"
//   },
//   {
//     icon: Users,
//     title: "Integraciones Fáciles",
//     description: "Conecta con Shopify, Tiendanube y más plataformas"
//   }
// ];

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
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profesional' | 'empresa'>('profesional');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Mobile Navigation */}
      <nav className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
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
      
      {/* Hero Section - PERFECT AS IS */}
      <motion.section 
        className="relative flex items-start px-4 pt-8 pb-12 lg:pt-24 lg:pb-16"
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

      {/* NEW: Social Proof Section with Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-white/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lo que dicen nuestros clientes
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Miles de tiendas ya están aumentando sus ventas con Rooleta
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "María González",
                store: "Boutique María",
                avatar: "MG",
                rating: 5,
                testimonial: "Incrementé mis ventas un 42% en el primer mes. La rueda es adictiva y mis clientes la aman!",
                metrics: "+42% ventas"
              },
              {
                name: "Carlos Rodríguez",
                store: "TechStore AR",
                avatar: "CR",
                rating: 5,
                testimonial: "La mejor inversión para mi tienda. Super fácil de instalar y los resultados son inmediatos.",
                metrics: "3x conversión"
              },
              {
                name: "Ana Martínez",
                store: "Deco Home",
                avatar: "AM",
                rating: 5,
                testimonial: "Capturé 2000+ emails en 2 semanas. El sistema de programación es genial para eventos especiales.",
                metrics: "2000+ leads"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full backdrop-blur-xl bg-white/90 border-white/20 shadow-xl rounded-2xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.store}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.testimonial}"</p>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <TrendingUp size={14} />
                    {testimonial.metrics}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Easy Integration Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Instalación en 3 simples pasos
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Conecta con tu tienda en menos de 5 minutos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Conecta tu tienda",
                description: "Un click para conectar con Shopify, Tiendanube o WooCommerce",
                icon: "🔗"
              },
              {
                step: "2",
                title: "Personaliza tu rueda",
                description: "Elige premios, colores y diseño acorde a tu marca",
                icon: "🎨"
              },
              {
                step: "3",
                title: "¡Listo para vender!",
                description: "Tu rueda aparece automáticamente en tu tienda",
                icon: "🚀"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-gray-300" size={32} />
                  </div>
                )}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Platform logos */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-600 mb-6">Compatible con las principales plataformas</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {['Shopify', 'Tiendanube', 'WooCommerce', 'Mercado Shops', 'Wix'].map((platform) => (
                <div key={platform} className="px-6 py-3 bg-white rounded-xl shadow-md">
                  <span className="text-gray-700 font-medium">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ENHANCED: Features Section with More Features */}
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
                Funciones poderosas
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gamificar tu tienda y multiplicar tus ventas
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Rueda de la Fortuna",
                description: "Sistema completo de rueda interactiva con premios personalizables",
                badge: "Popular"
              },
              {
                icon: Calendar,
                title: "Programación Inteligente",
                description: "Programa campañas para fechas especiales, eventos y temporadas",
                badge: "Nuevo"
              },
              {
                icon: Target,
                title: "Segmentación Avanzada",
                description: "Muestra diferentes ruedas según el comportamiento del usuario"
              },
              {
                icon: Palette,
                title: "100% Personalizable",
                description: "Adapta colores, premios y diseño a tu identidad de marca"
              },
              {
                icon: GamepadIcon,
                title: "Próximamente: Rasca y Gana",
                description: "Nuevos juegos interactivos para mantener a tus clientes enganchados",
                badge: "Pronto"
              },
              {
                icon: Trophy,
                title: "Próximamente: Jackpot",
                description: "Premios acumulativos que generan expectativa y urgencia",
                badge: "Pronto"
              },
              {
                icon: BarChart,
                title: "Analytics en Tiempo Real",
                description: "Métricas detalladas de conversión, participación y ROI"
              },
              {
                icon: Mail,
                title: "Captura de Emails",
                description: "Construye tu lista de suscriptores de forma divertida"
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Optimizado para dispositivos móviles donde ocurre el 70% de las compras"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full backdrop-blur-xl bg-white/90 border-white/20 shadow-xl rounded-2xl relative overflow-hidden">
                  {feature.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        feature.badge === 'Popular' ? 'bg-green-100 text-green-700' :
                        feature.badge === 'Nuevo' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {feature.badge}
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Pricing Section in ARS */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Planes simples y transparentes
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Sin sorpresas, sin costos ocultos. Cancela cuando quieras.
            </p>
            
            {/* Plan toggle */}
            <div className="inline-flex items-center gap-4 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setSelectedPlan('basico')}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedPlan === 'basico' ? 'bg-white shadow-md' : ''
                }`}
              >
                Básico
              </button>
              <button
                onClick={() => setSelectedPlan('profesional')}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedPlan === 'profesional' ? 'bg-white shadow-md' : ''
                }`}
              >
                <span className="flex items-center gap-2">
                  Profesional
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                </span>
              </button>
              <button
                onClick={() => setSelectedPlan('empresa')}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedPlan === 'empresa' ? 'bg-white shadow-md' : ''
                }`}
              >
                Empresa
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Básico',
                price: '$12.900',
                originalPrice: '$19.900',
                period: '/mes',
                description: 'Perfecto para empezar',
                features: [
                  '1 Rueda activa',
                  'Hasta 1,000 giros/mes',
                  'Personalización básica',
                  'Captura de emails',
                  'Analytics básico',
                  'Soporte por email'
                ],
                cta: 'Empezar Gratis',
                highlight: false
              },
              {
                name: 'Profesional',
                price: '$24.900',
                originalPrice: '$39.900',
                period: '/mes',
                description: 'Para tiendas en crecimiento',
                features: [
                  '3 Ruedas activas',
                  'Giros ilimitados',
                  'Personalización completa',
                  'Programación de campañas',
                  'Segmentación avanzada',
                  'Analytics detallado',
                  'Integraciones premium',
                  'Soporte prioritario'
                ],
                cta: 'Prueba 14 días gratis',
                highlight: true,
                badge: 'Más Popular'
              },
              {
                name: 'Empresa',
                price: 'Personalizado',
                originalPrice: '',
                period: '',
                description: 'Soluciones a medida',
                features: [
                  'Ruedas ilimitadas',
                  'Todo de Profesional',
                  'API personalizada',
                  'Manager dedicado',
                  'Onboarding premium',
                  'SLA garantizado',
                  'Desarrollo personalizado',
                  'Facturación especial'
                ],
                cta: 'Contactar Ventas',
                highlight: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={plan.highlight ? 'relative' : ''}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}
                <Card className={`p-6 h-full backdrop-blur-xl border-2 shadow-xl rounded-2xl ${
                  plan.highlight 
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-purple-400' 
                    : 'bg-white/90 border-white/20'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      {plan.originalPrice && (
                        <span className="text-gray-400 line-through text-lg">{plan.originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.highlight 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                    onClick={() => navigate('/signup')}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600">
              💳 Aceptamos todas las tarjetas • 🔒 Pago 100% seguro • ↩️ Garantía de 30 días
            </p>
          </div>
        </div>
      </section>

      {/* NEW: Comparison/Why Choose Us Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ¿Por qué elegir Rooleta?
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Comparado con no tener gamificación o usar la competencia
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden backdrop-blur-xl bg-white/90 border-white/20 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Característica</th>
                      <th className="text-center p-4">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-500 text-sm">Sin gamificación</span>
                        </div>
                      </th>
                      <th className="text-center p-4">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-500 text-sm">Competencia</span>
                        </div>
                      </th>
                      <th className="text-center p-4">
                        <div className="flex flex-col items-center">
                          <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Rooleta
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['Aumento en conversión', '0%', '+10-15%', '+35-42%'],
                      ['Captura de emails', '❌', '✓', '✓✓'],
                      ['Instalación', '-', '30+ min', '5 min'],
                      ['Personalización marca', '-', 'Limitada', 'Total'],
                      ['Precio mensual', '$0', '$49 USD', '$24.900 ARS'],
                      ['Soporte en español', '-', '❌', '✓'],
                      ['Juegos adicionales', '-', '❌', '✓ Pronto'],
                      ['Analytics', '❌', 'Básico', 'Avanzado']
                    ].map(([feature, none, competitor, rooleta], index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium">{feature}</td>
                        <td className="text-center p-4 text-gray-500">{none}</td>
                        <td className="text-center p-4 text-gray-700">{competitor}</td>
                        <td className="text-center p-4">
                          <span className="font-semibold text-green-600">{rooleta}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ENHANCED CTA Section */}
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
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  Oferta por tiempo limitado
                </h2>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
                  Obtén 50% de descuento en todos los planes + 14 días de prueba gratis
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">14</div>
                    <div className="text-sm opacity-75">días gratis</div>
                  </div>
                  <div className="text-4xl">+</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">50%</div>
                    <div className="text-sm opacity-75">descuento</div>
                  </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl w-full sm:w-auto"
                    onClick={() => navigate('/signup')}
                  >
                    Activar Oferta Ahora
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>
                
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm opacity-75">
                  No se requiere tarjeta • Cancela cuando quieras • Setup en 5 minutos
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <div className="mb-4">
            <img 
              src="/rooleta_wordmark_transparent.png" 
              alt="Rooleta" 
              className="h-8 w-auto mx-auto mb-4"
            />
          </div>
          <p className="text-sm mb-2">&copy; 2024 Rooleta. Todos los derechos reservados.</p>
          <p className="text-xs">Made with ❤️ in Argentina 🇦🇷</p>
        </div>
      </footer>

    </div>
  );
};