import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  originalPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
  badge?: string;
}

const pricingPlans: PricingPlan[] = [
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
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profesional' | 'empresa'>('profesional');

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white/80 backdrop-blur">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Planes simples y transparentes
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Sin sorpresas, sin costos ocultos. Cancela cuando quieras.
          </p>
          
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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 sm:px-0">
          {pricingPlans.map((plan, index) => (
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
  );
};