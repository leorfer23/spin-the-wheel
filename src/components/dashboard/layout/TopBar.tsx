import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useStore } from "../../../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, LogOut, Store, ChevronDown, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserSettingsDialog } from "../../UserSettingsDialog";
import { AddStoreDialog } from "./AddStoreDialog";
import { WheelService } from "../../../services/wheelService";

export const TopBar: React.FC = () => {
  const { signOut } = useAuth();
  const { selectedStoreId, setSelectedStoreId, stores, isLoading } = useStore();
  const navigate = useNavigate();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch wheel counts for all stores
  const { data: wheelCounts = {} } = useQuery({
    queryKey: ['wheelCounts', stores.map(s => s.tiendanube_store_id)],
    queryFn: async () => {
      if (stores.length === 0) return {};
      const storeIds = stores.map(s => s.tiendanube_store_id).filter(Boolean);
      const response = await WheelService.getWheelCountsByStores(storeIds);
      return response.data || {};
    },
    enabled: stores.length > 0
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStoreDropdownOpen(false);
      }
    };

    if (storeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [storeDropdownOpen]);

  const selectedStore = stores.find((s) => s.tiendanube_store_id === selectedStoreId) || stores[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAddStore = () => {
    setStoreDropdownOpen(false);
    setAddStoreOpen(true);
  };

  return (
    <>
      <div className="h-20 px-6 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <img 
            src="/rooleta_wordmark_transparent.png" 
            alt="Rooleta" 
            className="h-8 object-contain"
          />
        </div>

        <div className="relative flex-1 flex justify-center mt-2" ref={dropdownRef}>
          {isLoading ? (
            <div className="px-6 py-3 bg-gray-50 rounded-2xl flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
              <span className="text-sm text-gray-600">Cargando tiendas...</span>
            </div>
          ) : stores.length === 0 ? (
            <button
              onClick={handleAddStore}
              className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl hover:from-purple-200 hover:to-blue-200 transition-all flex items-center gap-3 group cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 text-purple-700 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm font-medium text-purple-700">
                Agregar tu primera tienda
              </span>
            </button>
          ) : (
            <button
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className="px-5 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white/80 hover:border-purple-200 transition-all flex items-center gap-3 group shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                <Store className="h-3.5 w-3.5 text-purple-700" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                    {selectedStore?.store_name}
                  </p>
                  {selectedStore && ((selectedStore as any).wheel_count !== undefined || wheelCounts[selectedStore.tiendanube_store_id] !== undefined) && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {(selectedStore as any).wheel_count ?? wheelCounts[selectedStore.tiendanube_store_id]} ruletas
                    </span>
                  )}
                </div>
                {selectedStore?.store_url && (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {selectedStore.store_url.replace(/^https?:\/\//, "")}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 group-hover:text-purple-700 transition-all ml-2 ${
                  storeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          <AnimatePresence>
            {storeDropdownOpen && stores.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-400 px-3 py-2 uppercase tracking-wider">
                    Mis tiendas
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto overflow-x-hidden">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          setSelectedStoreId(store.tiendanube_store_id);
                          setStoreDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                          store.tiendanube_store_id === selectedStoreId
                            ? "bg-gradient-to-r from-purple-50 to-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${
                            store.tiendanube_store_id === selectedStoreId
                              ? "bg-gradient-to-br from-purple-100 to-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Store
                            className={`h-3.5 w-3.5 ${
                              store.tiendanube_store_id === selectedStoreId
                                ? "text-purple-700"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-medium ${
                                store.tiendanube_store_id === selectedStoreId
                                  ? "text-purple-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {store.store_name}
                            </p>
                            {((store as any).wheel_count !== undefined || wheelCounts[store.tiendanube_store_id] !== undefined) && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                store.tiendanube_store_id === selectedStoreId
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {(store as any).wheel_count ?? wheelCounts[store.tiendanube_store_id]} {((store as any).wheel_count ?? wheelCounts[store.tiendanube_store_id]) === 1 ? 'ruleta' : 'ruletas'}
                              </span>
                            )}
                          </div>
                          {store.store_url && (
                            <p className="text-xs text-gray-500 truncate">
                              {store.store_url.replace(/^https?:\/\//, "")}
                            </p>
                          )}
                        </div>
                        {store.tiendanube_store_id === selectedStoreId && (
                          <div className="h-1.5 w-1.5 bg-purple-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleAddStore}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all flex items-center gap-3 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
                        <Plus className="h-3.5 w-3.5 text-purple-700 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                      <p className="text-sm font-medium text-purple-700">
                        Agregar nueva tienda
                      </p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white/80 hover:border-purple-200 transition-all group shadow-sm hover:shadow-md cursor-pointer hover:scale-110 active:scale-95"
          >
            <User className="h-4 w-4 text-gray-600 group-hover:text-purple-700" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white/80 hover:border-red-200 transition-all group shadow-sm hover:shadow-md cursor-pointer hover:scale-110 active:scale-95"
          >
            <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>

      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AddStoreDialog open={addStoreOpen} onOpenChange={setAddStoreOpen} />
    </>
  );
};