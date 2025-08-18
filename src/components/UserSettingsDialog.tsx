import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { StoreService } from "../services/storeService";
import { WheelService } from "../services/wheelService";
import { tiendaNubeIntegrationService } from "../services/tiendaNubeIntegrationService";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./onboarding/OnboardingProvider";
import { UserPreferencesService } from "../services/userPreferencesService";
import { useHelpBubbles } from "./help/HelpBubbleProvider";
import {
  Lock,
  ChevronRight,
  Mail,
  Calendar,
  Building2,
  Store,
  Unplug,
  Sparkles,
  Settings,
  Package,
  ExternalLink,
  AlertCircle,
  Loader2,
  Grid3x3,
  GraduationCap,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettingsDialog({
  open,
  onOpenChange,
}: UserSettingsDialogProps) {
  const { user } = useAuth();
  const { startOnboarding } = useOnboarding();
  const { helpEnabled, toggleHelp, resetHelpBubbles } = useHelpBubbles();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "stores" | "wheels">("account");
  const [stores, setStores] = useState<any[]>([]);
  const [wheels, setWheels] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [disconnectingStoreId, setDisconnectingStoreId] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message || "Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // Load stores
      const storesResult = await StoreService.getUserStores();
      if (storesResult.success && storesResult.data) {
        setStores(storesResult.data);
        
        // Load wheels for all stores
        const allWheels: any[] = [];
        for (const store of storesResult.data) {
          const storeIdToUse = (store as any).tiendanube_store_id || store.id;
          const wheelsResult = await WheelService.getWheels(storeIdToUse);
          if (wheelsResult.success && wheelsResult.data) {
            allWheels.push(...wheelsResult.data.map(wheel => ({
              ...wheel,
              store_id: store.id,
              store_name: store.store_name
            })));
          }
        }
        setWheels(allWheels);
      }
    } catch (error) {
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDisconnectStore = async (storeId: string, platform: string) => {
    if (!confirm("¿Estás seguro de que quieres desconectar esta tienda?")) {
      return;
    }
    
    setDisconnectingStoreId(storeId);
    try {
      if (platform === "tiendanube") {
        await tiendaNubeIntegrationService.disconnectIntegration(storeId);
      }
      
      // Delete from local database
      await StoreService.deleteStore(storeId);
      
      // Reload data
      await loadUserData();
    } catch (error) {
      alert("Error al desconectar la tienda");
    } finally {
      setDisconnectingStoreId(null);
    }
  };

  useEffect(() => {
    if (open) {
      loadUserData();
    }
  }, [open]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Desconocido";
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden h-[650px] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "account"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Cuenta
              </div>
            </button>
            <button
              onClick={() => setActiveTab("stores")}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "stores"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Store className="h-4 w-4" />
                Tiendas
              </div>
            </button>
            <button
              onClick={() => setActiveTab("wheels")}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "wheels"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Ruletas
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
          {/* User Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {user?.email?.split("@")[0] || "User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Miembro desde</p>
                <p className="text-sm font-medium">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Tienda</p>
                <p className="text-sm font-medium">Tienda Demo</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {!isChangingPassword ? (
              <>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Cambiar Contraseña</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={async () => {
                    if (user) {
                      await UserPreferencesService.resetOnboarding(user.id);
                      onOpenChange(false);
                      startOnboarding();
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Reiniciar Tutorial</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Configuración de Ayuda</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Ayudas Contextuales</p>
                          <p className="text-xs text-gray-500">Mostrar burbujas de ayuda en la aplicación</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleHelp}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          helpEnabled ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            helpEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        resetHelpBubbles();
                        onOpenChange(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium">Restablecer Ayudas Vistas</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm">
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa la nueva contraseña"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la nueva contraseña"
                    className="h-9"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                  >
                    {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </div>
            )}
          </div>

                {/* Sign Out */}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "stores" && (
              <motion.div
                key="stores"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tiendas conectadas</h3>
                  <span className="text-sm text-gray-500">
                    {stores.length} {stores.length === 1 ? "tienda" : "tiendas"}
                  </span>
                </div>

                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : stores.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No tienes tiendas conectadas</p>
                    <p className="text-sm text-gray-500">Conecta tu primera tienda desde el dashboard</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stores.map((store) => (
                      <div
                        key={store.id}
                        className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{store.store_name}</h4>
                              {store.platform && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                  {store.platform}
                                </span>
                              )}
                            </div>
                            {store.store_url && (
                              <a
                                href={store.store_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                {store.store_url.replace(/^https?:\/\//, "")}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Conectada {formatDate(store.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDisconnectStore(store.id, store.platform)}
                            disabled={disconnectingStoreId === store.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Desconectar tienda"
                          >
                            {disconnectingStoreId === store.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unplug className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Gestión de tiendas</p>
                      <p>Puedes agregar nuevas tiendas desde el dashboard principal usando el botón "Agregar nueva tienda".</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "wheels" && (
              <motion.div
                key="wheels"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ruletas creadas</h3>
                  <span className="text-sm text-gray-500">
                    {wheels.length} {wheels.length === 1 ? "ruleta" : "ruletas"}
                  </span>
                </div>

                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : wheels.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No has creado ruletas aún</p>
                    <p className="text-sm text-gray-500">Crea tu primera ruleta desde el dashboard</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {wheels.map((wheel) => (
                      <div
                        key={wheel.id}
                        className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-white rounded-xl">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {wheel.name || "Ruleta sin nombre"}
                            </h4>
                            {wheel.store_id && (
                              <p className="text-xs text-gray-600 truncate">
                                {stores.find(s => s.id === wheel.store_id)?.store_name || "Tienda"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {wheel.segments?.length || 0} segmentos
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            wheel.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {wheel.is_active ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {wheels.length > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                    <div className="flex gap-3">
                      <Package className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">Gestión de ruletas</p>
                        <p>Edita y configura tus ruletas desde el dashboard. Cada ruleta puede tener diferentes diseños y premios.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}