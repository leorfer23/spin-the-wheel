import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Edit2,
  Check,
  X,
  Trash2,
  Circle,
  CheckCircle,
} from "lucide-react";
import type { WheelConfig } from "./types";
import { useClickOutside } from "../../../../hooks/useClickOutside";

interface WheelSelectorProps {
  wheels: WheelConfig[];
  selectedWheelId: string;
  onSelectWheel: (wheelId: string) => void;
  onCreateWheel: (name?: string) => WheelConfig;
  onUpdateWheelName: (wheelId: string, name: string) => void;
  onDeleteWheel?: (wheelId: string) => void;
}

export const WheelSelector: React.FC<WheelSelectorProps> = ({
  wheels,
  selectedWheelId,
  onSelectWheel,
  onCreateWheel,
  onUpdateWheelName,
  onDeleteWheel,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [editingWheelId, setEditingWheelId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWheelName, setNewWheelName] = useState("");

  const selectedWheel = wheels.find((w) => w.id === selectedWheelId);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setNewWheelName("");
    }
  }, [isCreatingNew]);

  const dropdownRef = useClickOutside(closeDropdown);

  const startEditing = (wheelId: string, currentName: string) => {
    setEditingWheelId(wheelId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingWheelId && editingName.trim()) {
      onUpdateWheelName(editingWheelId, editingName.trim());
    }
    setEditingWheelId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingWheelId(null);
    setEditingName("");
  };

  const handleCreateWheel = () => {
    setIsCreatingNew(true);
    setNewWheelName("New Campaign");
  };

  const saveNewWheel = () => {
    if (newWheelName.trim()) {
      const newWheel = onCreateWheel(newWheelName.trim());
      // Navigate to the new wheel
      navigate(`/dashboard/wheel/${newWheel.id}`);
    }
    setIsCreatingNew(false);
    setNewWheelName("");
  };

  const cancelNewWheel = () => {
    setIsCreatingNew(false);
    setNewWheelName("");
  };

  const handleDelete = (wheelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteWheel && wheels.length > 1) {
      onDeleteWheel(wheelId);
      // If deleting the current wheel, navigate to dashboard
      if (wheelId === selectedWheelId) {
        navigate('/dashboard');
      }
    }
  };

  const isActive = (wheel: WheelConfig) => {
    const now = new Date();
    const today = now.toLocaleDateString("en-US", { weekday: "short" });
    const currentTime = now.toTimeString().slice(0, 5);

    if (!wheel?.schedule?.enabled) return true;

    // Check if today is in the scheduled days
    if (wheel.schedule.days && !wheel.schedule.days.includes(today)) {
      return false;
    }

    // Check time range
    if (wheel.schedule.startTime && wheel.schedule.endTime) {
      return (
        currentTime >= wheel.schedule.startTime &&
        currentTime <= wheel.schedule.endTime
      );
    }

    // Check date range
    if (wheel.schedule.startDate && wheel.schedule.endDate) {
      const startDate = new Date(wheel.schedule.startDate);
      const endDate = new Date(wheel.schedule.endDate);
      return now >= startDate && now <= endDate;
    }

    return true;
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 group border border-gray-100/50"
      >
        {selectedWheel && isActive(selectedWheel) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"
          />
        )}
        <span className="font-medium text-[15px] text-gray-900 group-hover:text-purple-700 transition-colors">
          {selectedWheel?.name || 'Select a wheel'}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 group-hover:text-purple-700 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
            className="absolute top-full mt-2.5 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50"
            style={{ zIndex: 9999 }}
          >
            <div className="p-1.5">
              {wheels.map((wheel) => {
                const active = isActive(wheel);
                return (
                  <div
                    key={wheel.id}
                    className={`relative rounded-xl transition-all ${
                      wheel.id === selectedWheelId
                        ? "bg-purple-50/70"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    {editingWheelId === wheel.id ? (
                      <div className="flex items-center gap-2 px-4 py-3">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="flex-1 px-3 py-1.5 text-[15px] bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center px-4 py-3 group/item">
                        <button
                          onClick={() => {
                            onSelectWheel(wheel.id);
                            navigate(`/dashboard/wheel/${wheel.id}`);
                            setIsOpen(false);
                          }}
                          className="flex-1 flex items-center gap-3"
                        >
                          <div className="relative">
                            {active ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-[15px] text-gray-900 group-hover/item:text-purple-700 transition-colors">
                              {wheel.name}
                            </p>
                            <p className="text-[13px] text-gray-500 mt-0.5">
                              {wheel.segments.length} segmentos •{" "}
                              {wheel.schedule.enabled
                                ? active
                                  ? "Activo ahora"
                                  : "Programado"
                                : "Siempre activo"}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(wheel.id, wheel.name);
                            }}
                            className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500 hover:text-purple-700" />
                          </button>
                          {wheels.length > 1 && (
                            <button
                              onClick={(e) => handleDelete(wheel.id, e)}
                              className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="h-px bg-gray-100 my-1.5" />

              {isCreatingNew ? (
                <div className="px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newWheelName}
                      onChange={(e) => setNewWheelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNewWheel();
                        if (e.key === "Escape") cancelNewWheel();
                      }}
                      placeholder="Ingresa el nombre de la rueda"
                      className="flex-1 px-3 py-1.5 text-[15px] bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                      autoFocus
                    />
                    <button
                      onClick={saveNewWheel}
                      className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={cancelNewWheel}
                      className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCreateWheel}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50/70 transition-colors rounded-xl group/create"
                >
                  <p className="font-medium text-[15px] text-gray-600 group-hover/create:text-purple-700 flex items-center gap-2.5 transition-colors">
                    <Plus className="h-4 w-4" />
                    Crear Nueva Rueda
                  </p>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
