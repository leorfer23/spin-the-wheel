import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, Check, AlertTriangle } from 'lucide-react';
import type { WheelScheduleConfig } from '../../types/models';

interface SimpleScheduleConfigProps {
  config: WheelScheduleConfig;
  onChange: (config: WheelScheduleConfig) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

// Quick templates
const scheduleTemplates = [
  {
    name: '🏢 Laboral',
    description: 'L-V, 9-18h',
    config: {
      weekDays: { enabled: true, days: [1, 2, 3, 4, 5] },
      timeSlots: { 
        enabled: true, 
        slots: [{ startMinutes: 540, endMinutes: 1080, label: 'Horario Laboral' }] 
      }
    }
  },
  {
    name: '🍺 Happy',
    description: 'Todos, 16-19h',
    config: {
      weekDays: { enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
      timeSlots: { 
        enabled: true, 
        slots: [{ startMinutes: 960, endMinutes: 1140, label: 'Happy Hour' }] 
      }
    }
  },
  {
    name: '🌟 Finde',
    description: 'S-D, todo el día',
    config: {
      weekDays: { enabled: true, days: [0, 6] },
      timeSlots: { enabled: false, slots: [] }
    }
  },
  {
    name: '🍕 Almuerzo',
    description: 'Todos, 12-14h',
    config: {
      weekDays: { enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
      timeSlots: { 
        enabled: true, 
        slots: [{ startMinutes: 720, endMinutes: 840, label: 'Almuerzo' }] 
      }
    }
  }
];

export const SimpleScheduleConfig: React.FC<SimpleScheduleConfigProps> = ({
  config,
  onChange,
  enabled,
  onEnabledChange,
}) => {
  // Debug logging
  console.log('[SimpleScheduleConfig] Received config:', config);
  console.log('[SimpleScheduleConfig] Config weekDays:', config?.weekDays);
  console.log('[SimpleScheduleConfig] Config dateRange:', config?.dateRange);
  console.log('[SimpleScheduleConfig] Config timeSlots:', config?.timeSlots);
  console.log('[SimpleScheduleConfig] Enabled:', enabled);
  // Track selected template for visual feedback
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  // Warning modal state
  const [showActivationWarning, setShowActivationWarning] = useState(false);
  
  // Check which template matches current config
  const getMatchingTemplate = () => {
    if (!config.weekDays?.enabled || !config.weekDays?.days) return null;
    
    for (const template of scheduleTemplates) {
      const daysMatch = 
        template.config.weekDays.enabled === config.weekDays.enabled &&
        template.config.weekDays.days.length === config.weekDays.days.length &&
        template.config.weekDays.days.every(day => config.weekDays?.days?.includes(day));
      
      const timeSlotsMatch = 
        template.config.timeSlots.enabled === config.timeSlots?.enabled &&
        template.config.timeSlots.slots.length === (config.timeSlots?.slots?.length || 0);
      
      if (daysMatch && timeSlotsMatch) {
        // For templates with time slots, check if they match
        if (template.config.timeSlots.enabled && template.config.timeSlots.slots.length > 0) {
          const firstTemplateSlot = template.config.timeSlots.slots[0];
          const firstConfigSlot = config.timeSlots?.slots?.[0];
          if (firstConfigSlot && 
              firstTemplateSlot.startMinutes === firstConfigSlot.startMinutes &&
              firstTemplateSlot.endMinutes === firstConfigSlot.endMinutes) {
            return template.name;
          }
        } else if (!template.config.timeSlots.enabled) {
          // For templates without time slots, just check days match
          return template.name;
        }
      }
    }
    return null;
  };
  
  const currentMatchingTemplate = getMatchingTemplate();
  
  // Set default dates if not provided - only run once on mount
  useEffect(() => {
    if (!config.dateRange?.startDate || !config.dateRange?.endDate) {
      const today = new Date();
      const weekLater = new Date(today);
      weekLater.setDate(weekLater.getDate() + 7);
      
      const formatDate = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
      };
      
      console.log('[SimpleScheduleConfig] Setting default dates');
      
      onChange({
        ...config,
        dateRange: {
          startDate: config.dateRange?.startDate || formatDate(today),
          endDate: config.dateRange?.endDate || formatDate(weekLater)
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Quick date range options
  const dateRangeOptions = [
    { label: '🚀 Flash', days: 3, description: '3 días' },
    { label: '📅 Semana', days: 7, description: '1 semana' },
    { label: '🎯 Promo', days: 14, description: '2 semanas' },
    { label: '🗓️ Mes', days: 30, description: '1 mes' }
  ];

  const weekDays = [
    { value: 1, label: 'Lun', full: 'Lunes' },
    { value: 2, label: 'Mar', full: 'Martes' },
    { value: 3, label: 'Mié', full: 'Miércoles' },
    { value: 4, label: 'Jue', full: 'Jueves' },
    { value: 5, label: 'Vie', full: 'Viernes' },
    { value: 6, label: 'Sáb', full: 'Sábado' },
    { value: 0, label: 'Dom', full: 'Domingo' }
  ];

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
  };

  const applyTemplate = (template: typeof scheduleTemplates[0]) => {
    console.log('[SimpleScheduleConfig] ========== APPLYING TEMPLATE ==========');
    console.log('[SimpleScheduleConfig] Template:', template.name);
    console.log('[SimpleScheduleConfig] Current config:', config);
    console.log('[SimpleScheduleConfig] Template weekDays:', template.config.weekDays);
    console.log('[SimpleScheduleConfig] Template timeSlots:', template.config.timeSlots);
    
    // Build new config with template's weekDays and timeSlots
    const newConfig: WheelScheduleConfig = {
      enabled: true,
      timezone: config.timezone || 'America/Argentina/Buenos_Aires',
      dateRange: config.dateRange || { startDate: null, endDate: null },
      weekDays: {
        enabled: true, // Always enable weekDays when applying a template
        days: [...template.config.weekDays.days]
      },
      timeSlots: {
        enabled: template.config.timeSlots.enabled,
        slots: template.config.timeSlots.slots.map(slot => ({ ...slot }))
      }
    };
    
    console.log('[SimpleScheduleConfig] New config to be applied:', newConfig);
    console.log('[SimpleScheduleConfig] New weekDays.enabled:', newConfig.weekDays?.enabled);
    console.log('[SimpleScheduleConfig] New weekDays.days:', newConfig.weekDays?.days);
    console.log('[SimpleScheduleConfig] New timeSlots.enabled:', newConfig.timeSlots?.enabled);
    console.log('[SimpleScheduleConfig] New timeSlots.slots:', newConfig.timeSlots?.slots);
    
    // Set selected template for immediate visual feedback
    setSelectedTemplate(template.name);
    
    // First enable the main schedule toggle if not already enabled
    if (!enabled) {
      console.log('[SimpleScheduleConfig] Enabling main schedule toggle');
      onEnabledChange(true);
    }
    
    // Update the config which will trigger auto-save to database
    console.log('[SimpleScheduleConfig] Calling onChange with new config');
    onChange(newConfig);
    
    // Clear selection after a brief delay to show feedback
    setTimeout(() => {
      console.log('[SimpleScheduleConfig] Clearing template selection');
      setSelectedTemplate(null);
    }, 2000);
  };

  const applyDateRange = (days: number) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    
    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      return adjustedDate.toISOString().slice(0, 16);
    };
    
    onChange({
      ...config,
      dateRange: {
        startDate: formatDate(today),
        endDate: formatDate(endDate)
      }
    });
  };

  const toggleWeekDay = (day: number) => {
    const days = config.weekDays?.days || [];
    console.log('[SimpleScheduleConfig] Current weekDays before toggle:', days);
    console.log('[SimpleScheduleConfig] Toggling day:', day);
    
    const newDays = days.includes(day) 
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b);
    
    console.log('[SimpleScheduleConfig] New weekDays after toggle:', newDays);
    
    const newConfig = {
      ...config,
      weekDays: {
        enabled: true,
        days: newDays
      }
    };
    
    console.log('[SimpleScheduleConfig] New config after toggle:', newConfig);
    onChange(newConfig);
  };

  const updateTimeSlot = (index: number, field: 'startMinutes' | 'endMinutes' | 'label', value: string | number) => {
    const slots = [...(config.timeSlots?.slots || [])];
    slots[index] = { ...slots[index], [field]: value };
    onChange({
      ...config,
      timeSlots: {
        enabled: config.timeSlots?.enabled || false,
        slots
      }
    });
  };

  const addTimeSlot = () => {
    const newSlot = {
      startMinutes: 540, // 9:00
      endMinutes: 1080, // 18:00
      label: `Horario ${(config.timeSlots?.slots || []).length + 1}`
    };
    onChange({
      ...config,
      timeSlots: {
        enabled: true,
        slots: [...(config.timeSlots?.slots || []), newSlot]
      }
    });
  };

  const removeTimeSlot = (index: number) => {
    const slots = (config.timeSlots?.slots || []).filter((_, i) => i !== index);
    onChange({
      ...config,
      timeSlots: {
        enabled: config.timeSlots?.enabled || false,
        slots
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Toggle - Compact */}
      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Horario de Activación
            </h3>
            <p className="text-gray-600 text-xs mt-1">
              {enabled ? 'Solo funciona en horarios configurados' : 'Siempre activa'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={enabled}
              onChange={(e) => {
                // If disabling (switching to always active), show warning
                if (!e.target.checked) {
                  setShowActivationWarning(true);
                } else {
                  onEnabledChange(true);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
          </label>
        </div>
      </motion.div>

      {/* Schedule Configuration - Only show when enabled */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Compact Date Range with Quick Options */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Período de Campaña
              </h4>
              
              {/* Quick date options */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dateRangeOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => applyDateRange(option.days)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-purple-100 rounded-xl text-sm font-medium transition-all"
                  >
                    {option.label} <span className="text-xs opacity-75">{option.description}</span>
                  </motion.button>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="datetime-local"
                    value={config.dateRange?.startDate || ''}
                    onChange={(e) => onChange({
                      ...config,
                      dateRange: {
                        startDate: e.target.value || null,
                        endDate: config.dateRange?.endDate || null
                      }
                    })}
                    className="w-full px-3 py-2 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>
                <div className="flex items-center justify-center text-gray-500 px-2">→</div>
                <div className="flex-1">
                  <input
                    type="datetime-local"
                    value={config.dateRange?.endDate || ''}
                    onChange={(e) => onChange({
                      ...config,
                      dateRange: {
                        startDate: config.dateRange?.startDate || null,
                        endDate: e.target.value || null
                      }
                    })}
                    className="w-full px-3 py-2 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>
              </div>
              {config.dateRange?.startDate && config.dateRange?.endDate && (
                <div className="mt-2 text-xs text-gray-600">
                  Duración: {Math.ceil((new Date(config.dateRange.endDate).getTime() - new Date(config.dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                </div>
              )}
            </motion.div>

            {/* Quick Templates - Compact */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-bold text-gray-800 mb-4">Plantillas Rápidas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scheduleTemplates.map((template, idx) => {
                  // Check if this template is currently active (either just selected or matches config)
                  const isSelected = selectedTemplate === template.name || 
                                   (currentMatchingTemplate === template.name && !selectedTemplate);
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyTemplate(template)}
                      className={`relative text-center p-4 rounded-xl transition-all border ${
                        isSelected 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                      <div className={`text-xl mb-1 ${isSelected ? 'text-white' : ''}`}>{template.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>{template.description}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Days Selection - Compact */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800">Días de la Semana</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.weekDays?.enabled !== false}
                    onChange={(e) => onChange({
                      ...config,
                      weekDays: {
                        enabled: e.target.checked,
                        days: config.weekDays?.days || [0, 1, 2, 3, 4, 5, 6]
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {config.weekDays?.enabled !== false && (
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map(day => {
                    const isSelected = config.weekDays?.days?.includes(day.value);
                    console.log(`[SimpleScheduleConfig] Day ${day.label} (${day.value}): ${isSelected ? 'selected' : 'not selected'}`);
                    return (
                      <motion.button
                      key={day.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleWeekDay(day.value)}
                      className={`py-2 px-1 text-center rounded-xl transition-all font-medium ${
                        config.weekDays?.days?.includes(day.value)
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="text-sm">{day.label}</div>
                    </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Time Range - Compact */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horario
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.timeSlots?.enabled || false}
                    onChange={(e) => onChange({
                      ...config,
                      timeSlots: {
                        enabled: e.target.checked,
                        slots: config.timeSlots?.slots || [{ 
                          startMinutes: 540, // 9:00
                          endMinutes: 1080, // 18:00
                          label: 'Horario Principal' 
                        }]
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {config.timeSlots?.enabled && (
                <div className="space-y-3">
                  {(config.timeSlots?.slots || []).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={slot.label || ''}
                            onChange={(e) => updateTimeSlot(idx, 'label', e.target.value)}
                            placeholder="Nombre"
                            className="flex-1 px-3 py-1.5 bg-white rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                          />
                          <input
                            type="time"
                            value={minutesToTime(slot.startMinutes)}
                            onChange={(e) => updateTimeSlot(idx, 'startMinutes', timeToMinutes(e.target.value))}
                            className="px-3 py-1.5 bg-white rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                          />
                          <span className="text-gray-500">→</span>
                          <input
                            type="time"
                            value={minutesToTime(slot.endMinutes)}
                            onChange={(e) => updateTimeSlot(idx, 'endMinutes', timeToMinutes(e.target.value))}
                            className="px-3 py-1.5 bg-white rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                          />
                        </div>
                      </div>
                      {(config.timeSlots?.slots || []).length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeTimeSlot(idx)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        </motion.button>
                      )}
                    </div>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addTimeSlot}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Horario
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Modal */}
      <AnimatePresence>
        {showActivationWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowActivationWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Activar Ruleta Permanentemente?
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Al seleccionar "Siempre activa", tu ruleta estará disponible 
                  <strong className="text-gray-900"> inmediatamente y las 24 horas del día</strong>.
                  Los clientes podrán participar en cualquier momento.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 w-full">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ La ruleta se activará inmediatamente al confirmar
                  </p>
                </div>
                
                <div className="flex gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowActivationWarning(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onEnabledChange(false);
                      setShowActivationWarning(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg transition-all"
                  >
                    Activar Siempre
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};