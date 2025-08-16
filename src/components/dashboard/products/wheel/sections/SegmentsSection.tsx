import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Plus, Trash2, Copy, Palette, Gift, GripVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Segment } from "../types";
import { predefinedColors } from "../wheelConfigConstants";
import { SimpleCouponSelector } from "../components/SimpleCouponSelector";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { TiendaNubeCoupon } from "@/types/tiendanube.types";
import { CouponDebugPanel } from "../components/CouponDebugPanel";
import { useStore } from "@/contexts/StoreContext";
interface SegmentsSectionProps {
  segments: Segment[];
  onUpdateSegments: (segments: Segment[]) => void;
  saveStatus: "idle" | "pending" | "saving" | "saved" | "error";
  selectedColorTheme: number;
}

export const SegmentsSection: React.FC<SegmentsSectionProps> = ({ 
  segments, 
  onUpdateSegments, 
  saveStatus: _saveStatus, // Unused, keeping for backward compatibility
  selectedColorTheme 
}) => {
  const { stores, selectedStoreId } = useStore();
  const currentStore = stores.find(s => s.tiendanube_store_id === selectedStoreId);
  const [localSegments, setLocalSegments] = useState(segments);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [colorPickerState, setColorPickerState] = useState<{
    isOpen: boolean;
    segmentId: string | null;
    position: { x: number; y: number };
  }>({ isOpen: false, segmentId: null, position: { x: 0, y: 0 } });
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Use centralized auto-save
  const { save, saveStatus } = useAutoSave({
    type: 'segments',
    onSave: async (segments) => {
      await onUpdateSegments(segments);
    }
  });

  // Update local segments when props change (when switching wheels)
  React.useEffect(() => {
    setLocalSegments(segments);
  }, [segments]);

  // Handle clicks outside color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setColorPickerState({ isOpen: false, segmentId: null, position: { x: 0, y: 0 } });
      }
    };

    if (colorPickerState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [colorPickerState.isOpen]);

  const totalWeight = localSegments.reduce((sum, s) => sum + (s.weight || 10), 0);

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
    save(newSegments);
  };

  const removeSegment = (id: string) => {
    if (localSegments.length > 2) {
      const newSegments = localSegments.filter((s) => s.id !== id);
      setLocalSegments(newSegments);
      save(newSegments);
    }
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    const newSegments = localSegments.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setLocalSegments(newSegments);
    save(newSegments);
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
    save(newSegments);
  };

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    // Add a slight transparency to the dragged element
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    
    const newSegments = [...localSegments];
    const draggedSegment = newSegments[draggedIndex];
    
    // Remove the dragged item
    newSegments.splice(draggedIndex, 1);
    
    // Insert at the new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSegments.splice(insertIndex, 0, draggedSegment);
    
    setLocalSegments(newSegments);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Save the new order after drop
    save(newSegments);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCouponValueChange = (segmentId: string, value: string, coupon?: TiendaNubeCoupon) => {
    if (coupon) {
      // If a coupon is selected, update the label to show coupon details
      const couponLabel = `${coupon.code} - ${formatCouponValue(coupon)}`;
      updateSegment(segmentId, { 
        value,
        coupon,
        label: couponLabel
      });
    } else {
      // If it's just text, update the value
      updateSegment(segmentId, { 
        value,
        coupon: undefined
      });
    }
  };

  const formatCouponValue = (coupon: TiendaNubeCoupon): string => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% de descuento`;
      case 'absolute':
        return `$${coupon.value} de descuento`;
      case 'shipping':
        return 'Envío Gratis';
      default:
        return coupon.value;
    }
  };

  const handleColorPickerOpen = (segmentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 8;
    
    setColorPickerState({
      isOpen: true,
      segmentId,
      position: { x, y }
    });
  };

  const handleColorChange = (color: string) => {
    if (colorPickerState.segmentId) {
      updateSegment(colorPickerState.segmentId, { color });
    }
  };

  const applyTheme = useCallback((themeIndex: number) => {
    const theme = predefinedColors[themeIndex];
    const newSegments = localSegments.map((segment, index) => ({
      ...segment,
      color: theme.colors[index % theme.colors.length]
    }));
    setLocalSegments(newSegments);
    save(newSegments);
  }, [localSegments, save]);

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
          <SaveStatusIndicator status={saveStatus} />
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
        
        {/* Theme Selector Row */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 font-medium">Temas:</span>
            </div>
            <div className="flex gap-2">
              {predefinedColors.map((theme, index) => (
                <motion.button
                  key={theme.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyTheme(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedColorTheme === index 
                      ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={`Aplicar tema ${theme.name}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      {theme.colors.slice(0, 3).map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence mode="popLayout">
          {localSegments.map((segment, index) => {
            const percentage = Math.round(((segment.weight || 10) / totalWeight) * 100);
            const isDragOver = dragOverIndex === index;
            
            return (
              <React.Fragment key={segment.id}>
                {/* Drop indicator line */}
                {isDragOver && draggedIndex !== null && draggedIndex < index && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-4"
                    transition={{ duration: 0.2 }}
                  />
                )}
              <motion.div
                layout
                layoutId={segment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: draggedIndex === index ? 0.5 : 1, 
                  x: 0,
                  scale: dragOverIndex === index ? 1.03 : 1,
                  y: dragOverIndex === index ? -5 : 0
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 }
                }}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                whileHover={{ scale: draggedIndex === null ? 1.02 : 1 }}
                className={`relative bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm rounded-2xl p-6 border-2 ${
                  draggedIndex === index 
                    ? 'border-purple-400 shadow-2xl opacity-50' 
                    : dragOverIndex === index 
                      ? 'border-purple-500 shadow-xl bg-purple-50/30' 
                      : 'border-gray-200'
                } hover:shadow-lg transition-all group`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing p-2 -m-2 rounded-lg hover:bg-gray-100"
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragEnd={handleDragEnd}
                    title="Arrastra para reordenar"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  </div>
                
                  <div className="relative group">
                    <div
                      className="w-14 h-14 rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-110 relative flex items-center justify-center"
                      style={{ backgroundColor: segment.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorPickerOpen(segment.id, e);
                      }}
                    >
                      <Palette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
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
                      <SimpleCouponSelector
                        value={segment.value}
                        onValueChange={(value, coupon) => handleCouponValueChange(segment.id, value, coupon)}
                        placeholder="Código del premio o cupón"
                        className="flex-1"
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
                
                {/* Drop indicator line for bottom */}
                {isDragOver && draggedIndex !== null && draggedIndex > index && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-4"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Color Picker Popover */}
      {colorPickerState.isOpen && ReactDOM.createPortal(
        <div
          ref={colorPickerRef}
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl p-4 border border-gray-200"
          style={{
            left: `${colorPickerState.position.x}px`,
            top: `${colorPickerState.position.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="grid grid-cols-5 gap-2 mb-3">
            {predefinedColors[selectedColorTheme].colors.map((color, index) => (
              <button
                key={index}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform cursor-pointer active:scale-95"
                style={{ backgroundColor: color }}
                onClick={() => {
                  handleColorChange(color);
                  setColorPickerState({ isOpen: false, segmentId: null, position: { x: 0, y: 0 } });
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={localSegments.find(s => s.id === colorPickerState.segmentId)?.color || '#000000'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
            <button
              onClick={() => setColorPickerState({ isOpen: false, segmentId: null, position: { x: 0, y: 0 } })}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer hover:scale-105 active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>,
        document.body
      )}
      
      {/* Debug Panel - Only show in development */}
      {import.meta.env.DEV && currentStore?.tiendanube_store_id && (
        <div className="mt-6">
          <CouponDebugPanel storeId={currentStore.tiendanube_store_id} />
        </div>
      )}
    </motion.div>
  );
};