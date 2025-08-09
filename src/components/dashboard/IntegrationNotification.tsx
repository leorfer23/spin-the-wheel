import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

export const IntegrationNotification: React.FC = () => {
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check URL params for integration status
    const params = new URLSearchParams(window.location.search);
    const success = params.get("integration_success");
    const error = params.get("integration_error");
    // const storeId = params.get("store_id"); // For future use

    if (success === "true") {
      setNotification({
        type: "success",
        message: "¡Tienda conectada exitosamente! Tu tienda de Tienda Nube ha sido sincronizada.",
      });
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } else if (error) {
      let errorMessage = "Error al conectar la tienda. ";
      
      switch (error) {
        case "missing_params":
          errorMessage += "Parámetros faltantes en la autorización.";
          break;
        case "invalid_state":
          errorMessage += "Estado de autorización inválido.";
          break;
        case "state_expired":
          errorMessage += "La sesión de autorización ha expirado. Por favor, intenta nuevamente.";
          break;
        case "callback_failed":
          errorMessage += "No se pudo completar la conexión. Por favor, intenta nuevamente.";
          break;
        default:
          errorMessage += error;
      }
      
      setNotification({
        type: "error",
        message: errorMessage,
      });
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Auto-dismiss after 7 seconds
      setTimeout(() => setNotification(null), 7000);
    }
  }, []);

  if (!notification) return null;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-green-50/95 border-green-200 text-green-800"
                : "bg-red-50/95 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            
            <button
              onClick={() => setNotification(null)}
              className={`p-1 rounded-lg transition-colors ${
                notification.type === "success"
                  ? "hover:bg-green-200"
                  : "hover:bg-red-200"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};