import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
            Términos de Servicio
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Fortune Wheel Platform ("el Servicio"), aceptas cumplir y estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con estos términos, no debes utilizar nuestro Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
              <p>
                Fortune Wheel Platform proporciona herramientas interactivas de gamificación para tiendas en línea, incluyendo ruedas de la fortuna personalizables y otros widgets de engagement. Nuestro servicio se integra con plataformas de comercio electrónico como Shopify y Tiendanube.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Registro de Cuenta</h2>
              <p>
                Para utilizar nuestro Servicio, debes crear una cuenta proporcionando información precisa y completa. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, y de todas las actividades que ocurran bajo tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
              <p>Te comprometes a utilizar el Servicio únicamente para fines legales y de acuerdo con estos Términos. No debes:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Usar el Servicio de manera fraudulenta o para actividades ilegales</li>
                <li>Intentar acceder sin autorización a otros sistemas o redes</li>
                <li>Interferir con el funcionamiento normal del Servicio</li>
                <li>Transmitir virus, malware u otro código malicioso</li>
                <li>Violar los derechos de propiedad intelectual de terceros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propiedad Intelectual</h2>
              <p>
                Todo el contenido, características y funcionalidad del Servicio, incluyendo pero no limitado a texto, gráficos, logos, iconos y software, son propiedad exclusiva de Fortune Wheel Platform y están protegidos por las leyes de propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacidad y Datos</h2>
              <p>
                Tu uso del Servicio está sujeto a nuestra Política de Privacidad. Al usar el Servicio, consientes la recopilación y uso de información de acuerdo con nuestra Política de Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Planes y Pagos</h2>
              <p>
                Algunos aspectos del Servicio requieren suscripción de pago. Los precios están sujetos a cambios con previo aviso. Los pagos no son reembolsables, excepto cuando lo requiera la ley aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
              <p>
                En ningún caso Fortune Wheel Platform será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos, incluyendo pérdida de beneficios, datos o uso, resultantes del uso o la incapacidad de usar el Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnización</h2>
              <p>
                Aceptas indemnizar y mantener indemne a Fortune Wheel Platform de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gastos derivados de tu uso del Servicio o violación de estos Términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Terminación</h2>
              <p>
                Podemos terminar o suspender tu cuenta y el acceso al Servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo el incumplimiento de estos Términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. Tu uso continuado del Servicio constituye la aceptación de los términos modificados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Ley Aplicable</h2>
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes aplicables, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
              <p>
                Si tienes preguntas sobre estos Términos de Servicio, contáctanos en:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@fortunewheel.com<br />
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