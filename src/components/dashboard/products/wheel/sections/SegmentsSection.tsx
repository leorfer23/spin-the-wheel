import React, { useState, useCallback } from "react";
import { Plus, Trash2, Copy, Palette, Gift, GripVertical, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Segment } from "../types";
import { predefinedColors } from "../wheelConfigConstants";

interface SegmentsSectionProps {
  segments: Segment[];
  onUpdateSegments: (segments: Segment[]) => void;
  saveStatus: "idle" | "pending" | "saving" | "saved" | "error";
  selectedColorTheme: number;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const SegmentsSection: React.FC<SegmentsSectionProps> = ({ 
  segments, 
  onUpdateSegments, 
  saveStatus,
  selectedColorTheme 
}) => {
  const [localSegments, setLocalSegments] = useState(segments);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const totalWeight = localSegments.reduce((sum, s) => sum + (s.weight || 10), 0);

  const debouncedSave = useCallback(
    debounce((newSegments: Segment[]) => {
      onUpdateSegments(newSegments);
      setHasUnsavedChanges(false);
    }, 1000),
    [onUpdateSegments]
  );

  const addSegment = () => {
    const newId = Date.now().toString();
    const colorIndex = localSegments.length % predefinedColors[selectedColorTheme].colors.length;
    const newSegment: Segment = {
      id: newId,
      label: `Premio ${localSegments.length + 1}`,
      value: `PREMIO${localSegments.length + 1}`,
      color: predefinedColors[selectedColorTheme].colors[colorIndex],
      weight: 10,
    };
    const newSegments = [...localSegments, newSegment];
    setLocalSegments(newSegments);
    setHasUnsavedChanges(true);
    debouncedSave(newSegments);
  };

  const removeSegment = (id: string) => {
    if (localSegments.length > 2) {
      const newSegments = localSegments.filter((s) => s.id !== id);
      setLocalSegments(newSegments);
      setHasUnsavedChanges(true);
      debouncedSave(newSegments);
    }
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    const newSegments = localSegments.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setLocalSegments(newSegments);
    setHasUnsavedChanges(true);
    debouncedSave(newSegments);
  };

  const duplicateSegment = (segment: Segment) => {
    const newId = Date.now().toString();
    const newSegment: Segment = {
      ...segment,
      id: newId,
      label: `${segment.label} (Copy)`,
      value: `${segment.value}_COPY`,
    };
    const index = localSegments.findIndex(s => s.id === segment.id);
    const newSegments = [
      ...localSegments.slice(0, index + 1),
      newSegment,
      ...localSegments.slice(index + 1),
    ];
    setLocalSegments(newSegments);
    setHasUnsavedChanges(true);
    debouncedSave(newSegments);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newSegments = [...localSegments];
    const draggedSegment = newSegments[draggedIndex];
    newSegments.splice(draggedIndex, 1);
    newSegments.splice(index, 0, draggedSegment);
    setLocalSegments(newSegments);
    setDraggedIndex(index);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (hasUnsavedChanges) {
      debouncedSave(localSegments);
    }
  };

  return (
    <motion.div
      key="segments"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-4 flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Segmentos de Premios
            </h3>
            <p className="text-sm text-gray-500">Configura los premios y sus probabilidades</p>
          </div>
          <AnimatePresence mode="wait">
            {saveStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  saveStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                  saveStatus === "saving" ? "bg-blue-100 text-blue-700" :
                  saveStatus === "saved" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}
              >
                {saveStatus === "pending" && (
                  <>
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse" />
                    Sin guardar
                  </>
                )}
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Guardando
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check className="w-3 h-3" />
                    Guardado
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addSegment}
          disabled={localSegments.length >= 12}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Agregar Premio
        </motion.button>
      </div>

      <div className="bg-gray-50 p-3 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total:</span>
              <span className="font-semibold text-gray-900">{localSegments.length}/12</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Mínimo:</span>
              <span className="font-semibold text-gray-700">2</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Arrastra para reordenar
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {localSegments.map((segment, index) => {
            const percentage = Math.round(((segment.weight || 10) / totalWeight) * 100);
            return (
              <motion.div
                key={segment.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onDragOver={(e) => handleDragOver(e, index)}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm rounded-2xl p-6 border-2 ${
                  draggedIndex === index ? 'border-purple-400 shadow-2xl scale-105' : 'border-gray-200'
                } hover:shadow-lg transition-all group`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing p-2 -m-2 rounded-lg hover:bg-gray-100"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    title="Arrastra para reordenar"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  </div>
                
                  <div 
                    className="relative group"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-110"
                      style={{ backgroundColor: segment.color }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = segment.color;
                        input.onchange = (e) => updateSegment(segment.id, { color: (e.target as HTMLInputElement).value });
                        input.click();
                      }}
                    />
                    <Palette className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div 
                    className="flex-1 space-y-3"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={segment.label}
                      onChange={(e) => updateSegment(segment.id, { label: e.target.value })}
                      className="w-full px-5 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-2xl text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Nombre del premio"
                      draggable={false}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={segment.value}
                        onChange={(e) => updateSegment(segment.id, { value: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border-0 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all"
                        placeholder="Código del premio"
                        draggable={false}
                      />
                      <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl">
                        <span className="text-xs font-medium text-gray-500">Probabilidad</span>
                        <span className="text-lg font-bold text-purple-600">{percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col items-center gap-2"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      value={segment.weight || 10}
                      onChange={(e) => updateSegment(segment.id, { weight: parseInt(e.target.value) })}
                      className="w-32 accent-purple-600 cursor-pointer"
                      min="1"
                      max="100"
                      draggable={false}
                    />
                    <span className="text-xs font-medium text-gray-500">Peso: {segment.weight || 10}</span>
                  </div>

                  <div 
                    className="flex items-center gap-2"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => duplicateSegment(segment)}
                      className="p-3 hover:bg-purple-100 rounded-xl transition-all group"
                      title="Duplicar segmento"
                    >
                      <Copy className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeSegment(segment.id)}
                      disabled={localSegments.length <= 2}
                      className="p-3 hover:bg-red-100 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      title={localSegments.length <= 2 ? "Se requieren mínimo 2 segmentos" : "Eliminar segmento"}
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};