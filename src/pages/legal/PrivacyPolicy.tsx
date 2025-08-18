import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 md:p-12"
        >
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Link>
            <img 
              src="/rooleta_wordmark_transparent.png" 
              alt="Rooleta" 
              className="h-8 w-auto"
            />
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Política de Privacidad
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
              <p>
                En Fortune Wheel Platform, nos comprometemos a proteger tu privacidad y tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información cuando utilizas nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>
              <p>Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Información Personal</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nombre y apellidos</li>
                <li>Dirección de correo electrónico</li>
                <li>Información de la tienda (nombre, URL, plataforma)</li>
                <li>Información de facturación y pago</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Información de Uso</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Datos de interacción con el servicio</li>
                <li>Configuraciones de widgets y campañas</li>
                <li>Métricas de rendimiento y analíticas</li>
                <li>Registros de actividad y preferencias</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Información Técnica</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dirección IP</li>
                <li>Tipo de navegador y versión</li>
                <li>Sistema operativo</li>
                <li>Cookies y tecnologías similares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas</li>
                <li>Responder a tus consultas y proporcionar soporte</li>
                <li>Personalizar tu experiencia en la plataforma</li>
                <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
                <li>Detectar y prevenir fraudes o actividades maliciosas</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
              <p>
                No vendemos ni alquilamos tu información personal. Podemos compartir tu información en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Proveedores de servicios:</strong> Con terceros que nos ayudan a operar nuestro negocio</li>
                <li><strong>Integraciones:</strong> Con plataformas que autorizas (Shopify, Tiendanube)</li>
                <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley o proceso legal</li>
                <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad</li>
                <li><strong>Consentimiento:</strong> Con tu consentimiento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo regular de nuestros sistemas</li>
                <li>Actualizaciones de seguridad periódicas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Retención de Datos</h2>
              <p>
                Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Tus Derechos</h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Acceder</strong> a tu información personal</li>
                <li><strong>Rectificar</strong> datos incorrectos o incompletos</li>
                <li><strong>Eliminar</strong> tu información personal</li>
                <li><strong>Oponerte</strong> al procesamiento de tus datos</li>
                <li><strong>Portabilidad</strong> de tus datos</li>
                <li><strong>Retirar</strong> tu consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso del servicio y personalizar contenido. Puedes controlar el uso de cookies a través de la configuración de tu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Datos de Menores</h2>
              <p>
                Nuestro servicio no está dirigido a personas menores de 18 años. No recopilamos conscientemente información personal de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
              <p>
                Tu información puede ser transferida y mantenida en servidores ubicados fuera de tu país. Al usar nuestro servicio, consientes estas transferencias, que realizamos con las salvaguardas apropiadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página y, cuando sea apropiado, mediante correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contacto</h2>
              <p>
                Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@fortunewheel.com<br />
                <strong>Responsable de Protección de Datos:</strong> dpo@fortunewheel.com<br />
                <strong>Dirección:</strong> Fortune Wheel Platform, 123 Innovation Street
              </p>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}