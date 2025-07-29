import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import type { WheelScheduleConfig } from '../../types/models';

interface SimpleScheduleConfigProps {
  config: WheelScheduleConfig;
  onChange: (config: WheelScheduleConfig) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const SimpleScheduleConfig: React.FC<SimpleScheduleConfigProps> = ({
  config,
  onChange,
  enabled,
  onEnabledChange,
}) => {
  // Quick templates
  const scheduleTemplates = [
    {
      name: '🏢 Horario Laboral',
      description: 'Lunes a Viernes, 9:00 - 18:00',
      config: {
        weekDays: { enabled: true, days: [1, 2, 3, 4, 5] },
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 540, endMinutes: 1080, label: 'Horario Laboral' }] 
        }
      }
    },
    {
      name: '🍺 Happy Hour',
      description: 'Todos los días, 16:00 - 19:00',
      config: {
        weekDays: { enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 960, endMinutes: 1140, label: 'Happy Hour' }] 
        }
      }
    },
    {
      name: '🌟 Fin de Semana',
      description: 'Sábados y Domingos, todo el día',
      config: {
        weekDays: { enabled: true, days: [0, 6] },
        timeSlots: { enabled: false, slots: [] }
      }
    },
    {
      name: '🍕 Almuerzo',
      description: 'Todos los días, 12:00 - 14:00',
      config: {
        weekDays: { enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 720, endMinutes: 840, label: 'Almuerzo' }] 
        }
      }
    }
  ];

  const weekDays = [
    { value: 0, label: 'Dom', full: 'Domingo' },
    { value: 1, label: 'Lun', full: 'Lunes' },
    { value: 2, label: 'Mar', full: 'Martes' },
    { value: 3, label: 'Mié', full: 'Miércoles' },
    { value: 4, label: 'Jue', full: 'Jueves' },
    { value: 5, label: 'Vie', full: 'Viernes' },
    { value: 6, label: 'Sáb', full: 'Sábado' }
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
    onChange({
      ...config,
      ...template.config,
      enabled: true,
      timezone: 'America/Argentina/Buenos_Aires'
    });
    onEnabledChange(true);
  };

  const toggleWeekDay = (day: number) => {
    const days = config.weekDays?.days || [];
    const newDays = days.includes(day) 
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b);
    
    onChange({
      ...config,
      weekDays: {
        enabled: true,
        days: newDays
      }
    });
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
      {/* Main Toggle */}
      <motion.div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Horario de Activación
            </h3>
            <p className="text-gray-600 text-sm">
              {enabled ? 'Tu rueda solo funcionará en los horarios configurados' : 'Tu rueda está siempre activa'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
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
            {/* Quick Templates */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-lg font-bold text-gray-800 mb-6">Plantillas Rápidas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduleTemplates.map((template, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applyTemplate(template)}
                    className="text-left p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all border-2 border-transparent hover:border-purple-200"
                  >
                    <div className="text-2xl mb-2">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Days Selection */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-gray-800">Días de la Semana</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.weekDays?.enabled || false}
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
              
              {config.weekDays?.enabled && (
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <motion.button
                      key={day.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleWeekDay(day.value)}
                      className={`p-4 text-center rounded-2xl transition-all font-medium ${
                        config.weekDays?.days.includes(day.value)
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="text-lg">{day.label}</div>
                      <div className="text-xs opacity-75 hidden sm:block">{day.full}</div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Time Range */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
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
                <div className="space-y-4">
                  {(config.timeSlots?.slots || []).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={slot.label || ''}
                          onChange={(e) => updateTimeSlot(idx, 'label', e.target.value)}
                          placeholder="Nombre del horario"
                          className="w-full px-4 py-3 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-gray-600">Desde</span>
                            <input
                              type="time"
                              value={minutesToTime(slot.startMinutes)}
                              onChange={(e) => updateTimeSlot(idx, 'startMinutes', timeToMinutes(e.target.value))}
                              className="flex-1 px-4 py-3 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-gray-600">Hasta</span>
                            <input
                              type="time"
                              value={minutesToTime(slot.endMinutes)}
                              onChange={(e) => updateTimeSlot(idx, 'endMinutes', timeToMinutes(e.target.value))}
                              className="flex-1 px-4 py-3 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      {(config.timeSlots?.slots || []).length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeTimeSlot(idx)}
                          className="p-3 hover:bg-red-100 rounded-xl transition-all group"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        </motion.button>
                      )}
                    </div>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addTimeSlot}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Horario
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Date Range */}
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Período de Campaña
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Fecha de Inicio</label>
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
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Fecha de Fin</label>
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
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};