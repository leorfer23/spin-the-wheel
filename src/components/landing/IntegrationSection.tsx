import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const integrationSteps = [
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
];

const platforms = ['Shopify', 'Tiendanube', 'WooCommerce', 'Mercado Shops', 'Wix'];

export const IntegrationSection: React.FC = () => {
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
              Instalación en 3 simples pasos
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl mx-auto">
            Conecta con tu tienda en menos de 5 minutos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {integrationSteps.map((item, index) => (
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

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 mb-6">Compatible con las principales plataformas</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {platforms.map((platform) => (
              <div key={platform} className="px-6 py-3 bg-white rounded-xl shadow-md">
                <span className="text-gray-700 font-medium">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};