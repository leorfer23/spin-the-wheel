import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: "2M+", label: "Giros Mensuales" },
  { value: "35%", label: "Aumento en Ventas" },
  { value: "10K+", label: "Tiendas Activas" },
  { value: "4.9★", label: "Calificación" }
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white/80 backdrop-blur">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto px-4">
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
              <p className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 mt-1 lg:mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};