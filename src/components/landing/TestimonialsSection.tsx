import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Star, TrendingUp } from 'lucide-react';

const testimonials = [
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
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-white/50 to-transparent">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lo que dicen nuestros clientes
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl mx-auto">
            Miles de tiendas ya están aumentando sus ventas con Rooleta
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
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
  );
};