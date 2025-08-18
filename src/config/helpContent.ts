import type { HelpContent } from '@/components/help/HelpBubble';

export const helpContent: Record<string, HelpContent> = {
  // Dashboard Help
  dashboardOverview: {
    title: 'Panel de Control',
    description: 'Tu centro de comando para gestionar todas las ruletas y campañas de tu tienda.',
    tips: [
      'Revisa las estadísticas diariamente para optimizar tus campañas',
      'Usa los filtros para analizar períodos específicos',
      'Exporta los datos para análisis más profundos',
    ],
  },

  // Store Management
  storeConnection: {
    title: 'Conexión de Tienda',
    description: 'Conecta tu tienda de TiendaNube para sincronizar productos y gestionar campañas.',
    tips: [
      'La conexión es segura y encriptada',
      'Puedes conectar múltiples tiendas',
      'La sincronización es automática cada 24 horas',
    ],
    warning: 'Necesitarás permisos de administrador en tu tienda TiendaNube',
  },

  storeSelector: {
    title: 'Selector de Tienda',
    description: 'Cambia entre tus diferentes tiendas conectadas para gestionar sus ruletas.',
    tips: [
      'Cada tienda tiene sus propias ruletas y configuraciones',
      'Las estadísticas se muestran por tienda individual',
    ],
  },

  // Wheel Configuration
  wheelName: {
    title: 'Nombre de la Ruleta',
    description: 'Dale un nombre descriptivo a tu ruleta para identificarla fácilmente.',
    examples: ['Ruleta Black Friday', 'Descuentos de Verano', 'Bienvenida Nuevos Clientes'],
    tips: [
      'Usa nombres que reflejen la campaña o temporada',
      'Evita caracteres especiales',
    ],
  },

  wheelSegments: {
    title: 'Segmentos de la Ruleta',
    description: 'Configura los premios y probabilidades de cada segmento de tu ruleta.',
    tips: [
      'Balancea premios atractivos con tu margen de ganancia',
      'Incluye al menos un premio "grande" para generar emoción',
      'Los segmentos "Sin premio" ayudan a controlar costos',
    ],
    warning: 'La suma de todas las probabilidades debe ser 100%',
  },

  segmentProbability: {
    title: 'Probabilidad de Ganar',
    description: 'Define qué tan probable es que este premio salga cuando alguien gira la ruleta.',
    tips: [
      'Premios más valiosos deberían tener menor probabilidad',
      'Considera tu margen de ganancia al definir probabilidades',
    ],
    examples: ['5% - Premio mayor', '20% - Descuento medio', '30% - Descuento pequeño'],
  },

  wheelColors: {
    title: 'Colores de la Ruleta',
    description: 'Personaliza los colores para que coincidan con tu marca.',
    tips: [
      'Usa colores contrastantes para mejor visibilidad',
      'Mantén consistencia con tu identidad de marca',
      'Los colores brillantes generan más engagement',
    ],
  },

  // Scheduling
  scheduleConfig: {
    title: 'Programación de Campaña',
    description: 'Define cuándo estará activa tu ruleta y con qué frecuencia pueden participar los usuarios.',
    tips: [
      'Programa campañas durante horas de mayor tráfico',
      'Usa límites diarios para controlar costos',
      'Las campañas limitadas crean urgencia',
    ],
  },

  spinLimit: {
    title: 'Límite de Giros',
    description: 'Controla cuántas veces puede girar cada usuario para mantener la campaña rentable.',
    tips: [
      '1 giro por día mantiene el engagement constante',
      'Giros ilimitados pueden aumentar costos rápidamente',
      'Considera ofrecer giros extra por acciones específicas',
    ],
    examples: ['1 por día', '3 por semana', '1 por compra'],
  },

  scheduleTime: {
    title: 'Horario Activo',
    description: 'Define las horas del día en que la ruleta estará disponible.',
    tips: [
      'Activa durante horas de mayor tráfico',
      'Considera zonas horarias si vendes internacionalmente',
    ],
    examples: ['9:00 - 21:00', 'Todo el día', 'Solo fines de semana'],
  },

  // Email Capture
  emailCapture: {
    title: 'Captura de Email',
    description: 'Recolecta emails antes de permitir girar la ruleta para hacer crecer tu lista de suscriptores.',
    tips: [
      'Ofrece valor claro a cambio del email',
      'Cumple con regulaciones de privacidad (GDPR)',
      'Usa los emails para campañas de remarketing',
    ],
    warning: 'Asegúrate de tener una política de privacidad clara',
  },

  emailValidation: {
    title: 'Validación de Email',
    description: 'Verifica que los emails sean válidos antes de permitir el giro.',
    tips: [
      'Reduce emails falsos o temporales',
      'Mejora la calidad de tu lista de suscriptores',
    ],
  },

  // Analytics
  conversionRate: {
    title: 'Tasa de Conversión',
    description: 'Porcentaje de visitantes que giraron la ruleta y realizaron una compra.',
    tips: [
      'Una buena tasa está entre 2-5%',
      'Optimiza premios si la tasa es baja',
      'Analiza qué premios convierten mejor',
    ],
  },

  totalSpins: {
    title: 'Total de Giros',
    description: 'Número total de veces que se ha girado la ruleta en el período seleccionado.',
    tips: [
      'Compara con períodos anteriores',
      'Identifica días y horas pico',
      'Correlaciona con ventas totales',
    ],
  },

  emailsCaptured: {
    title: 'Emails Capturados',
    description: 'Cantidad de nuevos suscriptores obtenidos a través de la ruleta.',
    tips: [
      'Exporta para campañas de email marketing',
      'Segmenta por premio ganado',
      'Calcula el valor de cada lead',
    ],
  },

  revenueGenerated: {
    title: 'Ingresos Generados',
    description: 'Ventas totales atribuidas a usuarios que participaron en la ruleta.',
    tips: [
      'Incluye ventas hasta 30 días después del giro',
      'Compara con el costo de los descuentos otorgados',
      'Calcula el ROI de la campaña',
    ],
  },

  // Widget Configuration
  widgetPosition: {
    title: 'Posición del Widget',
    description: 'Donde aparecerá el botón flotante de la ruleta en tu tienda.',
    tips: [
      'Esquina inferior derecha tiene mejor visibilidad',
      'Evita tapar elementos importantes',
      'Prueba diferentes posiciones',
    ],
    examples: ['Inferior derecha', 'Inferior izquierda', 'Centro derecha'],
  },

  widgetAnimation: {
    title: 'Animación del Widget',
    description: 'Efectos visuales para llamar la atención hacia el botón de la ruleta.',
    tips: [
      'Las animaciones sutiles funcionan mejor',
      'Demasiada animación puede molestar',
      'Prueba A/B diferentes estilos',
    ],
  },

  // Prize Management
  prizeCode: {
    title: 'Código del Premio',
    description: 'Código único que los ganadores usarán para reclamar su premio.',
    tips: [
      'Usa códigos fáciles de recordar',
      'Configura expiración automática',
      'Trackea el uso de cada código',
    ],
    examples: ['SPIN20', 'RULETAWIN', 'DESCUENTO15'],
  },

  prizeExpiration: {
    title: 'Expiración del Premio',
    description: 'Tiempo límite para usar el premio ganado, creando urgencia de compra.',
    tips: [
      '24-48 horas crea máxima urgencia',
      '7 días es un buen balance',
      'Envía recordatorios antes de expirar',
    ],
    examples: ['24 horas', '3 días', '1 semana'],
  },

  // Templates
  wheelTemplate: {
    title: 'Plantillas de Ruleta',
    description: 'Diseños predefinidos optimizados para diferentes tipos de campañas.',
    tips: [
      'Empieza con una plantilla y personalízala',
      'Las plantillas están probadas para conversión',
      'Guarda tus diseños como plantillas custom',
    ],
  },

  // Integration
  webhooks: {
    title: 'Webhooks',
    description: 'Conecta eventos de la ruleta con otros sistemas para automatización.',
    tips: [
      'Sincroniza ganadores con tu CRM',
      'Dispara emails automáticos',
      'Actualiza inventario en tiempo real',
    ],
    learnMoreUrl: 'https://docs.spinwheel.com/webhooks',
  },

  // Performance
  loadingSpeed: {
    title: 'Velocidad de Carga',
    description: 'Optimización del widget para no afectar la velocidad de tu tienda.',
    tips: [
      'El widget se carga de forma asíncrona',
      'No afecta el SEO de tu tienda',
      'Caché inteligente para mejor rendimiento',
    ],
  },

  // Legal
  termsCompliance: {
    title: 'Cumplimiento Legal',
    description: 'Asegúrate de cumplir con las regulaciones de sorteos y promociones.',
    tips: [
      'Incluye términos y condiciones claros',
      'Verifica regulaciones locales',
      'Mantén registro de ganadores',
    ],
    warning: 'Las regulaciones varían por país y región',
    learnMoreUrl: 'https://docs.spinwheel.com/legal',
  },

  // Reports
  exportData: {
    title: 'Exportar Datos',
    description: 'Descarga información detallada para análisis externos.',
    tips: [
      'Disponible en CSV y Excel',
      'Incluye todos los campos de datos',
      'Útil para reportes mensuales',
    ],
  },

  // User Management
  teamMembers: {
    title: 'Gestión de Equipo',
    description: 'Invita colaboradores y define sus permisos de acceso.',
    tips: [
      'Asigna roles específicos',
      'Controla qué puede ver y editar cada miembro',
      'Rastrea cambios por usuario',
    ],
  },

  // Mobile
  mobilePreview: {
    title: 'Vista Móvil',
    description: 'Previsualiza cómo se verá la ruleta en dispositivos móviles.',
    tips: [
      '60% del tráfico es móvil',
      'La ruleta se adapta automáticamente',
      'Prueba en diferentes tamaños de pantalla',
    ],
  },

  // A/B Testing
  abTesting: {
    title: 'Pruebas A/B',
    description: 'Compara diferentes versiones de tu ruleta para optimizar conversión.',
    tips: [
      'Prueba un elemento a la vez',
      'Espera significancia estadística',
      'Implementa ganadores gradualmente',
    ],
    examples: ['Colores diferentes', 'Premios variados', 'Textos alternativos'],
  },
};

// Helper function to get help content with fallback
export const getHelpContent = (key: string): HelpContent => {
  return helpContent[key] || {
    title: 'Ayuda',
    description: 'Información de ayuda no disponible para este elemento.',
  };
};