import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Gift, ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
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
                  className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl w-full sm:w-auto cursor-pointer"
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
  );
};