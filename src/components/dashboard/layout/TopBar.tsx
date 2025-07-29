import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, LogOut, Store, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserSettingsDialog } from "../../UserSettingsDialog";

interface StoreOption {
  id: string;
  name: string;
  domain: string;
}

const stores: StoreOption[] = [
  { id: "1", name: "My Main Store", domain: "main-store.com" },
  { id: "2", name: "Holiday Shop", domain: "holiday-shop.com" },
  { id: "3", name: "Weekend Deals", domain: "weekend-deals.com" },
];

export const TopBar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedStore =
    stores.find((s) => s.id === selectedStoreId) || stores[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-1">
        <Sparkles className="h-6 w-6 text-gray-900" />
        <span className="text-lg font-semibold text-gray-900">CoolPop</span>
      </div>

      {/* Store Selector - Centered */}
      <div className="relative flex-1 flex justify-center">
        <button
          onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
          className="px-4 py-2 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-3 group"
        >
          <Store className="h-4 w-4 text-gray-600 group-hover:text-purple-700" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
              {selectedStore.name}
            </p>
            <p className="text-xs text-gray-500">{selectedStore.domain}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-600 group-hover:text-purple-700 transition-transform ${
              storeDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {storeDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStoreId(store.id);
                    setStoreDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                    store.id === selectedStoreId ? "bg-purple-50" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {store.name}
                  </p>
                  <p className="text-xs text-gray-500">{store.domain}</p>
                </button>
              ))}
              <button className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors">
                <p className="text-sm font-medium text-purple-600">
                  + Add New Store
                </p>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 bg-gray-50 rounded-full hover:bg-purple-50 transition-colors group"
        >
          <User className="h-5 w-5 text-gray-600 group-hover:text-purple-700" />
        </button>
        <button
          onClick={handleSignOut}
          className="p-2 bg-gray-50 rounded-full hover:bg-red-50 transition-colors group"
        >
          <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
        </button>
      </div>

      {/* User Settings Dialog */}
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};
