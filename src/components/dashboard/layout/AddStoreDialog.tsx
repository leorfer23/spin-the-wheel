import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, Link2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddStoreDialog: React.FC<AddStoreDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnect = async () => {
    setIsSubmitting(true);
    try {
      // Get the current session to get access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        return;
      }
      
      // Initiate OAuth flow for Tienda Nube
      const response = await fetch('/api/integrations/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'tiendanube',
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Tienda Nube OAuth page
      window.location.href = authUrl;
    } catch (error) {
      // Error handled silently
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative px-8 pt-8 pb-6">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer hover:scale-110 active:scale-95"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                    <Store className="h-6 w-6 text-purple-700" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Conectar tu tienda
                  </h2>
                </div>
                
                <p className="text-gray-600 text-sm mt-2">
                  Conecta tu Tiendanube de forma rápida y segura
                </p>
              </div>

              <div className="px-8 pb-8 space-y-6">
                <div className="flex justify-center">
                  <img 
                    src="/tiendanube.png" 
                    alt="Tiendanube" 
                    className="h-20 object-contain"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <p className="text-center text-blue-800">
                    Al hacer clic en <strong>"Conectar con Tiendanube"</strong>, serás redirigido a Tiendanube para autorizar la conexión de forma segura.
                  </p>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={isSubmitting}
                  className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-[0.98] shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-5 w-5" />
                      <span>Conectar con Tiendanube</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};