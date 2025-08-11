import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "¿Cómo instalo Rooleta en mi Tiendanube?",
    answer: "Super fácil! Ve a tu panel de Tiendanube → Sección Apps → Busca 'Rooleta' → Click en Instalar. La integración es automática y no requiere código. Todo el proceso toma menos de 5 minutos.",
    category: "instalacion"
  },
  {
    question: "¿Cuánto aumentan las ventas con la ruleta de premios en Tiendanube?",
    answer: "Nuestros clientes de Tiendanube reportan un aumento promedio del 35% en conversiones. Algunos han llegado hasta 42% en el primer mes. Los resultados varían según el tipo de productos y la configuración de premios.",
    category: "resultados"
  },
  {
    question: "¿Es compatible con todos los temas de Tiendanube?",
    answer: "¡Sí! Rooleta es 100% compatible con TODOS los temas de Tiendanube, incluyendo temas personalizados. Se adapta automáticamente al diseño de tu tienda sin afectar la velocidad de carga.",
    category: "compatibilidad"
  },
  {
    question: "¿Puedo personalizar los premios según mi inventario de Tiendanube?",
    answer: "Por supuesto! Puedes configurar descuentos porcentuales, montos fijos en ARS, envío gratis, productos de regalo, y más. Todo se sincroniza con tu catálogo de Tiendanube automáticamente.",
    category: "personalizacion"
  },
  {
    question: "¿Funciona en móviles? La mayoría de mis ventas son mobile",
    answer: "Absolutamente! Rooleta está optimizada para móviles donde ocurre el 70% de las compras. La ruleta se adapta perfectamente a cualquier tamaño de pantalla con gestos táctiles intuitivos.",
    category: "mobile"
  },
  {
    question: "¿Los emails capturados se sincronizan con mi base de Tiendanube?",
    answer: "Sí, todos los emails capturados se sincronizan automáticamente con tu base de clientes en Tiendanube. También puedes exportarlos o conectarlos con herramientas de email marketing.",
    category: "integracion"
  },
  {
    question: "¿Puedo programar campañas para fechas especiales como Hot Sale o CyberMonday?",
    answer: "¡Claro! Puedes programar diferentes ruletas para Hot Sale, Cyber Monday, Black Friday, o cualquier fecha. Configura fechas de inicio/fin y la ruleta se activa automáticamente.",
    category: "campañas"
  },
  {
    question: "¿Qué pasa si ya tengo otra app de marketing en Tiendanube?",
    answer: "Rooleta es compatible con todas las apps del ecosistema Tiendanube. Funciona perfectamente junto a apps de email marketing, chat, reviews, etc. No hay conflictos.",
    category: "compatibilidad"
  },
  {
    question: "¿Hay soporte en español para tiendas argentinas?",
    answer: "¡Por supuesto! Somos una empresa argentina. Ofrecemos soporte 100% en español, entendemos el mercado local y aceptamos todos los medios de pago argentinos incluyendo MercadoPago.",
    category: "soporte"
  },
  {
    question: "¿Cuánto cuesta Rooleta para Tiendanube?",
    answer: "Tenemos planes desde $12.900 ARS/mes (50% OFF ahora). Incluye 14 días de prueba gratis sin tarjeta. Plan profesional recomendado: $24.900 ARS con ruletas ilimitadas y todas las funciones.",
    category: "precios"
  },
  {
    question: "¿Puedo ver estadísticas de conversión de mi ruleta?",
    answer: "Sí! Panel completo de analytics: giros totales, tasa de conversión, emails capturados, premios más populares, ROI de campañas, y más. Todo en tiempo real.",
    category: "analytics"
  },
  {
    question: "¿La ruleta afecta la velocidad de mi Tiendanube?",
    answer: "No! Rooleta está optimizada para performance. Carga de forma asíncrona sin afectar el tiempo de carga de tu tienda. Cumple con los Core Web Vitals de Google.",
    category: "performance"
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todas" },
    { id: "instalacion", label: "Instalación" },
    { id: "resultados", label: "Resultados" },
    { id: "compatibilidad", label: "Compatibilidad" },
    { id: "personalizacion", label: "Personalización" },
    { id: "precios", label: "Precios" }
  ];

  const filteredFaqs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white/80 backdrop-blur">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle size={16} />
            Preguntas Frecuentes sobre Tiendanube
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Todo sobre Rooleta y Tiendanube
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Resolvemos todas tus dudas sobre la integración con Tiendanube
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden backdrop-blur-xl bg-white/95 border-gray-200 shadow-lg rounded-2xl">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800 pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-gray-600 text-sm lg:text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Schema.org FAQ structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }} />
      </div>
    </section>
  );
};