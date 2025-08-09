import React from "react";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";
import type { WidgetConfig } from "../wheelConfigTypes";

interface EmbedSectionProps {
  wheelId: string;
  widgetConfig: WidgetConfig;
  selectedStyle: string;
}

export const EmbedSection: React.FC<EmbedSectionProps> = ({
  wheelId,
  widgetConfig,
  selectedStyle
}) => {
  const embedCode = `<!-- SpinWheel Widget -->
<div id="spinwheel-widget" data-wheel-id="${wheelId}"></div>
<script src="\${window.location.origin}/widget.js"></script>
<script>
  SpinWheel.init({
    wheelId: '${wheelId}',
    config: {
      handle: {
        position: '${widgetConfig.handlePosition}',
        text: '${widgetConfig.handleText}',
        backgroundColor: '${widgetConfig.handleBackgroundColor}',
        textColor: '${widgetConfig.handleTextColor}'
      },
      capture: {
        imageUrl: '${widgetConfig.captureImageUrl}',
        title: '${widgetConfig.captureTitle}',
        subtitle: '${widgetConfig.captureSubtitle}',
        buttonText: '${widgetConfig.captureButtonText}',
        privacyText: '${widgetConfig.capturePrivacyText}'
      },
      style: '${selectedStyle}'
    }
  });
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <motion.div
      key="embed"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-4 flex-1 overflow-hidden"
    >
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Instala tu Rueda
      </h3>
      
      <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 60px)' }}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
          <p className="text-gray-700 mb-4">Copia este código y pégalo en tu sitio web donde quieras que aparezca la rueda:</p>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl relative group">
            <pre className="text-sm text-gray-700 font-mono break-all leading-relaxed overflow-x-auto max-h-64">
              {embedCode}
            </pre>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyCode}
              className="absolute top-4 right-4 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              title="Copiar código"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PlatformCard
            title="Shopify"
            description="Añade a los archivos liquid de tu tema o usa nuestra app de Shopify."
          />
          <PlatformCard
            title="WordPress"
            description="Usa nuestro plugin de WordPress o añade a tu tema."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">Instrucciones de Instalación:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Copia el código de arriba haciendo clic en el botón de copiar</li>
            <li>Abre el editor de tu sitio web o gestor de contenido</li>
            <li>Pega el código donde desees que aparezca el widget</li>
            <li>Guarda los cambios y actualiza tu sitio web</li>
            <li>¡Tu rueda de premios estará lista para usar!</li>
          </ol>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl">
          <h4 className="font-semibold text-amber-900 mb-2">Notas Importantes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
            <li>El widget se ajusta automáticamente al tamaño del contenedor</li>
            <li>Asegúrate de que tu sitio web tenga HTTPS habilitado</li>
            <li>El widget es responsive y funciona en dispositivos móviles</li>
            <li>Los cambios de configuración se actualizan en tiempo real</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

const PlatformCard: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
    <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);