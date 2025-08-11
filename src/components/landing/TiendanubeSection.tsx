import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Check, Zap, ShoppingCart, TrendingUp, Users, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tiendanubeFeatures = [
  {
    icon: Zap,
    title: "Integración Nativa Tiendanube",
    description: "Instalación directa desde el panel de apps de Tiendanube. Sin código, sin complicaciones."
  },
  {
    icon: ShoppingCart,
    title: "Optimizado para E-commerce",
    description: "Diseñado específicamente para tiendas online argentinas y latinoamericanas."
  },
  {
    icon: TrendingUp,
    title: "+35% Conversión Garantizada",
    description: "Resultados comprobados en más de 1000 tiendas Tiendanube activas."
  },
  {
    icon: Users,
    title: "Captura Leads Automática",
    description: "Sincroniza emails directamente con tu base de clientes de Tiendanube."
  },
  {
    icon: Award,
    title: "Premios Personalizados",
    description: "Configura descuentos, envío gratis y productos según tu inventario Tiendanube."
  },
  {
    icon: Shield,
    title: "100% Seguro y Confiable",
    description: "Partner oficial de Tiendanube. Cumple todos los estándares de seguridad."
  }
];

const tiendanubeStats = [
  { number: "1000+", label: "Tiendas Tiendanube activas" },
  { number: "2M+", label: "Giros mensuales" },
  { number: "35%", label: "Aumento promedio en ventas" },
  { number: "4.9★", label: "Calificación en Tiendanube" }
];

export const TiendanubeSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={16} />
            Partner Oficial de Tiendanube
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="text-gray-800">La Mejor Ruleta de Premios para</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Tiendanube
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto">
            Especialmente diseñada para tiendas Tiendanube. Incrementa tus ventas con 
            juegos interactivos que tus clientes amarán. Instalación en 1 click desde tu panel.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiendanubeStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center bg-white/90 backdrop-blur shadow-lg rounded-2xl border-green-100">
                <p className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                  {stat.number}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tiendanubeFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 h-full bg-white/95 backdrop-blur shadow-xl rounded-2xl hover:shadow-2xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Installation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 mb-12"
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            Instalación en Tiendanube en <span className="text-green-600">3 Pasos Simples</span>
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                1
              </div>
              <h4 className="font-semibold mb-2">Busca Rooleta en Apps</h4>
              <p className="text-sm text-gray-600">
                Ve a tu panel de Tiendanube → Apps → Busca "Rooleta"
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                2
              </div>
              <h4 className="font-semibold mb-2">Instala con 1 Click</h4>
              <p className="text-sm text-gray-600">
                Click en "Instalar" y autoriza la conexión. Automático y seguro.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                3
              </div>
              <h4 className="font-semibold mb-2">¡Listo para Vender!</h4>
              <p className="text-sm text-gray-600">
                Tu ruleta ya está activa. Personaliza premios y empieza a convertir.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 lg:p-12 text-white text-center"
        >
          <h3 className="text-2xl lg:text-3xl font-bold mb-6">
            Casos de Éxito en Tiendanube
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-4xl font-bold mb-2">+42%</p>
              <p className="text-sm opacity-90">Ventas - Boutique Online</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">3,500</p>
              <p className="text-sm opacity-90">Emails - Tienda Deportiva</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">2.5x</p>
              <p className="text-sm opacity-90">ROI - Electrónica Shop</p>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-xl"
              onClick={() => navigate('/signup')}
            >
              Instalar en mi Tiendanube Ahora
              <Check className="ml-2" size={20} />
            </Button>
          </motion.div>
          
          <p className="mt-4 text-sm opacity-75">
            Sin tarjeta de crédito • 14 días gratis • Instalación en 5 minutos
          </p>
        </motion.div>
      </div>
    </section>
  );
};