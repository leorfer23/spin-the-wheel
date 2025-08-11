import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { 
  Zap, Calendar, Target, Palette, 
  Gamepad2 as GamepadIcon, Trophy, BarChart, Mail, Smartphone 
} from 'lucide-react';

const features = [
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
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Funciones poderosas
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas para gamificar tu tienda y multiplicar tus ventas
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
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
  );
};