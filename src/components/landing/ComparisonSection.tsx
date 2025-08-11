import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

const comparisonData = [
  ['Aumento en conversión', '0%', '+35-42%', '+10-15%'],
  ['Captura de emails', '❌', '✓✓', '✓'],
  ['Instalación', '-', '5 min', '30+ min'],
  ['Personalización marca', '-', 'Total', 'Limitada'],
  ['Precio mensual', '$0', '$24.900 ARS', '$49 USD'],
  ['Soporte en español', '-', '✓', '❌'],
  ['Juegos adicionales', '-', '✓ Pronto', '❌'],
  ['Analytics', '❌', 'Avanzado', 'Básico']
];

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ¿Por qué elegir Rooleta?
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl mx-auto">
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
                        <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Rooleta
                        </span>
                      </div>
                    </th>
                    <th className="text-center p-4">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-sm">Competencia</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonData.map(([feature, none, rooleta, competitor], index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium">{feature}</td>
                      <td className="text-center p-4 text-gray-500">{none}</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-green-600">{rooleta}</span>
                      </td>
                      <td className="text-center p-4 text-gray-700">{competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};