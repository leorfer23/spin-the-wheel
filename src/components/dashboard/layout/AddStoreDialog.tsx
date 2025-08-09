import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, Globe, Sparkles, Link2, CheckCircle } from "lucide-react";
import { StoreService } from "../../../services/storeService";
import { supabase } from "../../../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddStoreDialog: React.FC<AddStoreDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [platform, setPlatform] = useState<"tiendanube" | "shopify" | "other">("tiendanube");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"manual" | "oauth">("oauth");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      if (platform === "tiendanube" && connectionMode === "oauth") {
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
            storeName: storeName || undefined,
            userId: session.user.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate OAuth');
        }

        const { authUrl } = await response.json();
        
        // Redirect to Tienda Nube OAuth page
        window.location.href = authUrl;
      } else {
        // Manual store creation
        if (!storeName.trim()) return;
        
        const result = await StoreService.createStore({
          tiendanube_store_id: `${platform}-${Date.now()}`,
          store_name: storeName,
          store_url: storeUrl || null,
          platform,
          plan_tier: "free",
          is_active: true,
        });

        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ["userStores"] });
          onOpenChange(false);
          setStoreName("");
          setStoreUrl("");
          setPlatform("tiendanube");
          setConnectionMode("oauth");
        } else {
          console.error("Failed to create store:", result.error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
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
                    Agregar nueva tienda
                  </h2>
                </div>
                
                <p className="text-gray-600 text-sm mt-2">
                  Conecta tu tienda para empezar a crear experiencias interactivas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Plataforma
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlatform("tiendanube")}
                      className={`px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        platform === "tiendanube"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium">Tiendanube</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("shopify")}
                      className={`px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        platform === "shopify"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium">Shopify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("other")}
                      className={`px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        platform === "other"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium">Otra</span>
                    </button>
                  </div>
                </div>

                {platform === "tiendanube" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Método de conexión
                    </label>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setConnectionMode("oauth")}
                        className={`w-full px-4 py-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                          connectionMode === "oauth"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Link2 className={`h-5 w-5 ${connectionMode === "oauth" ? "text-purple-700" : "text-gray-500"}`} />
                          <div className="text-left">
                            <p className={`font-medium ${connectionMode === "oauth" ? "text-purple-700" : "text-gray-900"}`}>
                              Conectar con Tienda Nube
                            </p>
                            <p className={`text-sm ${connectionMode === "oauth" ? "text-purple-600" : "text-gray-500"}`}>
                              Autorización segura con OAuth
                            </p>
                          </div>
                        </div>
                        {connectionMode === "oauth" && (
                          <CheckCircle className="h-5 w-5 text-purple-700" />
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setConnectionMode("manual")}
                        className={`w-full px-4 py-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                          connectionMode === "manual"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Store className={`h-5 w-5 ${connectionMode === "manual" ? "text-purple-700" : "text-gray-500"}`} />
                          <div className="text-left">
                            <p className={`font-medium ${connectionMode === "manual" ? "text-purple-700" : "text-gray-900"}`}>
                              Configuración manual
                            </p>
                            <p className={`text-sm ${connectionMode === "manual" ? "text-purple-600" : "text-gray-500"}`}>
                              Ingresa los datos manualmente
                            </p>
                          </div>
                        </div>
                        {connectionMode === "manual" && (
                          <CheckCircle className="h-5 w-5 text-purple-700" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {(connectionMode === "manual" || platform !== "tiendanube") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la tienda
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Mi tienda increíble"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        required={connectionMode === "manual"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la tienda (opcional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={storeUrl}
                          onChange={(e) => setStoreUrl(e.target.value)}
                          placeholder="https://mitienda.com"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {platform === "tiendanube" && connectionMode === "oauth" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Serás redirigido a Tienda Nube para autorizar la conexión. 
                      Una vez autorizada, tu tienda se sincronizará automáticamente.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (connectionMode === "manual" && !storeName.trim())}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{platform === "tiendanube" && connectionMode === "oauth" ? "Conectando..." : "Agregando..."}</span>
                      </>
                    ) : (
                      <>
                        {platform === "tiendanube" && connectionMode === "oauth" ? (
                          <>
                            <Link2 className="h-4 w-4" />
                            <span>Conectar con Tienda Nube</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Agregar tienda</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};