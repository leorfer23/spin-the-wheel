import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CalendarX2, 
  CalendarCheck2,
  Plus,
  Trash2
} from 'lucide-react';
import type { WheelScheduleConfig, TimeSlot } from '../../types/models';

interface ScheduleConfiguratorProps {
  config: WheelScheduleConfig;
  onChange: (config: WheelScheduleConfig) => void;
  timezone?: string;
}

export const ScheduleConfigurator: React.FC<ScheduleConfiguratorProps> = ({
  config,
  onChange,
  timezone = 'UTC'
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Set default dates if not provided
  React.useEffect(() => {
    if (!config.dateRange?.startDate || !config.dateRange?.endDate) {
      const today = new Date();
      const weekLater = new Date(today);
      weekLater.setDate(weekLater.getDate() + 7);
      
      const formatDate = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
      };
      
      onChange({
        ...config,
        dateRange: {
          startDate: config.dateRange?.startDate || formatDate(today),
          endDate: config.dateRange?.endDate || formatDate(weekLater)
        }
      });
    }
  }, []);

  const weekDays = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  const timeZones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const scheduleTemplates = [
    {
      name: 'Horario Laboral',
      description: '9 AM - 5 PM, Lunes a Viernes',
      config: {
        weekDays: { enabled: true, days: [1, 2, 3, 4, 5] },
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 540, endMinutes: 1020, label: 'Horario Laboral' }] 
        }
      }
    },
    {
      name: 'Hora Feliz',
      description: '4 PM - 7 PM todos los días',
      config: {
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 960, endMinutes: 1140, label: 'Hora Feliz' }] 
        }
      }
    },
    {
      name: 'Especial de Fin de Semana',
      description: 'Viernes 6 PM hasta Domingo',
      config: {
        weekDays: { enabled: true, days: [0, 5, 6] },
        timeSlots: { 
          enabled: true, 
          slots: [
            { startMinutes: 1080, endMinutes: 1439, label: 'Viernes por la Noche' },
            { startMinutes: 0, endMinutes: 1439, label: 'Fin de Semana' }
          ] 
        }
      }
    },
    {
      name: 'Lunch Rush',
      description: '11:30 AM - 1:30 PM daily',
      config: {
        timeSlots: { 
          enabled: true, 
          slots: [{ startMinutes: 690, endMinutes: 810, label: 'Lunch Time' }] 
        }
      }
    }
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

  const updateConfig = (updates: Partial<WheelScheduleConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      startMinutes: 540, // 9 AM
      endMinutes: 1020,  // 5 PM
      label: 'New Time Slot'
    };
    
    updateConfig({
      timeSlots: {
        enabled: true,
        slots: [...(config.timeSlots?.slots || []), newSlot]
      }
    });
  };

  const removeTimeSlot = (index: number) => {
    const slots = [...(config.timeSlots?.slots || [])];
    slots.splice(index, 1);
    updateConfig({
      timeSlots: {
        enabled: config.timeSlots?.enabled || false,
        slots
      }
    });
  };

  const updateTimeSlot = (index: number, slot: TimeSlot) => {
    const slots = [...(config.timeSlots?.slots || [])];
    slots[index] = slot;
    updateConfig({
      timeSlots: {
        enabled: config.timeSlots?.enabled || false,
        slots
      }
    });
  };

  const toggleWeekDay = (day: number) => {
    const days = config.weekDays?.days || [];
    const newDays = days.includes(day) 
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b);
    
    updateConfig({
      weekDays: {
        enabled: true,
        days: newDays
      }
    });
  };

  const [newSpecialDate, setNewSpecialDate] = useState<{ blacklist: string; whitelist: string }>({
    blacklist: '',
    whitelist: ''
  });

  const addSpecialDate = (type: 'blacklist' | 'whitelist') => {
    const date = newSpecialDate[type];
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    const dates = type === 'blacklist' 
      ? [...(config.specialDates?.blacklistDates || []), date]
      : [...(config.specialDates?.whitelistDates || []), date];

    updateConfig({
      specialDates: {
        blacklistDates: type === 'blacklist' ? dates : (config.specialDates?.blacklistDates || []),
        whitelistDates: type === 'whitelist' ? dates : (config.specialDates?.whitelistDates || [])
      }
    });
    
    setNewSpecialDate(prev => ({ ...prev, [type]: '' }));
  };

  const removeSpecialDate = (type: 'blacklist' | 'whitelist', date: string) => {
    const dates = type === 'blacklist'
      ? config.specialDates?.blacklistDates || []
      : config.specialDates?.whitelistDates || [];

    updateConfig({
      specialDates: {
        blacklistDates: type === 'blacklist' ? dates.filter(d => d !== date) : (config.specialDates?.blacklistDates || []),
        whitelistDates: type === 'whitelist' ? dates.filter(d => d !== date) : (config.specialDates?.whitelistDates || [])
      }
    });
  };

  const applyTemplate = (template: typeof scheduleTemplates[0]) => {
    const newConfig = {
      ...config,
      enabled: true
    };
    
    // Apply template configuration
    if (template.config.weekDays) {
      newConfig.weekDays = {
        enabled: template.config.weekDays.enabled,
        days: template.config.weekDays.days
      };
    }
    
    if (template.config.timeSlots) {
      newConfig.timeSlots = {
        enabled: template.config.timeSlots.enabled,
        slots: template.config.timeSlots.slots
      };
    }
    
    onChange(newConfig);
    
    // Switch to appropriate tab based on what was configured
    if (template.config.weekDays?.enabled && template.config.timeSlots?.enabled) {
      setActiveTab('week');
    } else if (template.config.timeSlots?.enabled) {
      setActiveTab('time');
    } else if (template.config.weekDays?.enabled) {
      setActiveTab('week');
    }
  };

  // Calculate if wheel is currently active
  const isCurrentlyActive = useMemo(() => {
    if (!config.enabled) return true;

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check date range
    if (config.dateRange?.startDate && new Date(config.dateRange.startDate) > now) return false;
    if (config.dateRange?.endDate && new Date(config.dateRange.endDate) < now) return false;

    // Check week days
    if (config.weekDays?.enabled && !config.weekDays.days.includes(currentDay)) return false;

    // Check time slots
    if (config.timeSlots?.enabled) {
      const inTimeSlot = config.timeSlots.slots.some(slot => 
        currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes
      );
      if (!inTimeSlot) return false;
    }

    return true;
  }, [config]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Configuración de Horario</CardTitle>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              !config.enabled ? 'bg-gray-100 text-gray-600' :
              isCurrentlyActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {!config.enabled ? 'Siempre Activo' : isCurrentlyActive ? 'Actualmente Activo' : 'Actualmente Inactivo'}
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>
        <CardDescription>
          Controla cuándo tu rueda está disponible para los usuarios
        </CardDescription>
      </CardHeader>
      
      {config.enabled && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="date">Período de Campaña</TabsTrigger>
              <TabsTrigger value="week">Días de la Semana</TabsTrigger>
              <TabsTrigger value="time">Horarios</TabsTrigger>
              <TabsTrigger value="special">Fechas Especiales</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Campaign Period Card */}
              <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                <h4 className="text-sm font-medium mb-3">Período de Campaña</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overview-startDate" className="text-xs">Fecha de Inicio</Label>
                    <Input
                      id="overview-startDate"
                      type="datetime-local"
                      value={config.dateRange?.startDate || ''}
                      onChange={(e) => updateConfig({
                        dateRange: {
                          startDate: e.target.value || null,
                          endDate: config.dateRange?.endDate || null
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overview-endDate" className="text-xs">Fecha de Fin</Label>
                    <Input
                      id="overview-endDate"
                      type="datetime-local"
                      value={config.dateRange?.endDate || ''}
                      onChange={(e) => updateConfig({
                        dateRange: {
                          startDate: config.dateRange?.startDate || null,
                          endDate: e.target.value || null
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Zona Horaria</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={config.timezone || timezone}
                  onChange={(e) => updateConfig({ timezone: e.target.value })}
                >
                  {timeZones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Plantillas Rápidas</h4>
                <div className="grid gap-2">
                  {scheduleTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplate(template)}
                      className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="date" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-4">Configura el período durante el cual tu campaña estará activa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={config.dateRange?.startDate || ''}
                      onChange={(e) => updateConfig({
                        dateRange: {
                          startDate: e.target.value || null,
                          endDate: config.dateRange?.endDate || null
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de Fin</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={config.dateRange?.endDate || ''}
                      onChange={(e) => updateConfig({
                        dateRange: {
                          startDate: config.dateRange?.startDate || null,
                          endDate: e.target.value || null
                        }
                      })}
                    />
                  </div>
                </div>
                {config.dateRange?.startDate && config.dateRange?.endDate && (
                  <div className="mt-4 text-sm text-gray-600">
                    Duración: {Math.ceil((new Date(config.dateRange.endDate).getTime() - new Date(config.dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="week" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Switch
                  checked={config.weekDays?.enabled || false}
                  onCheckedChange={(enabled) => updateConfig({
                    weekDays: {
                      ...config.weekDays,
                      enabled,
                      days: config.weekDays?.days || [0, 1, 2, 3, 4, 5, 6]
                    }
                  })}
                />
                <Label>Habilitar restricciones por día de la semana</Label>
              </div>

              {config.weekDays?.enabled && (
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleWeekDay(day.value)}
                      className={`p-3 text-center rounded-lg border transition-colors ${
                        config.weekDays?.days.includes(day.value)
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{day.short}</div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.timeSlots?.enabled || false}
                    onCheckedChange={(enabled) => updateConfig({
                      timeSlots: {
                        ...config.timeSlots,
                        enabled,
                        slots: config.timeSlots?.slots || []
                      }
                    })}
                  />
                  <Label>Habilitar restricciones de horario</Label>
                </div>
                {config.timeSlots?.enabled && (
                  <Button size="sm" onClick={addTimeSlot}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Horario
                  </Button>
                )}
              </div>

              {config.timeSlots?.enabled && (
                <div className="space-y-2">
                  {config.timeSlots?.slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Input
                        type="text"
                        value={slot.label || ''}
                        onChange={(e) => updateTimeSlot(idx, { ...slot, label: e.target.value })}
                        placeholder="Nombre del horario"
                        className="flex-1"
                      />
                      <Input
                        type="time"
                        value={minutesToTime(slot.startMinutes)}
                        onChange={(e) => updateTimeSlot(idx, { 
                          ...slot, 
                          startMinutes: timeToMinutes(e.target.value) 
                        })}
                        className="w-32"
                      />
                      <span>a</span>
                      <Input
                        type="time"
                        value={minutesToTime(slot.endMinutes)}
                        onChange={(e) => updateTimeSlot(idx, { 
                          ...slot, 
                          endMinutes: timeToMinutes(e.target.value) 
                        })}
                        className="w-32"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTimeSlot(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="special" className="space-y-4">
              <div>
                <div className="mb-2">
                  <Label className="flex items-center gap-2">
                    <CalendarX2 className="h-4 w-4" />
                    Fechas Excluidas (La ruleta no estará disponible)
                  </Label>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    type="date"
                    value={newSpecialDate.blacklist}
                    onChange={(e) => setNewSpecialDate(prev => ({ ...prev, blacklist: e.target.value }))}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => addSpecialDate('blacklist')} disabled={!newSpecialDate.blacklist}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.specialDates?.blacklistDates.map(date => (
                    <div key={date} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {date}
                      <button
                        onClick={() => removeSpecialDate('blacklist', date)}
                        className="ml-1 hover:text-red-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <Label className="flex items-center gap-2">
                    <CalendarCheck2 className="h-4 w-4" />
                    Fechas Incluidas (La ruleta siempre estará disponible)
                  </Label>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    type="date"
                    value={newSpecialDate.whitelist}
                    onChange={(e) => setNewSpecialDate(prev => ({ ...prev, whitelist: e.target.value }))}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => addSpecialDate('whitelist')} disabled={!newSpecialDate.whitelist}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.specialDates?.whitelistDates.map(date => (
                    <div key={date} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {date}
                      <button
                        onClick={() => removeSpecialDate('whitelist', date)}
                        className="ml-1 hover:text-green-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};