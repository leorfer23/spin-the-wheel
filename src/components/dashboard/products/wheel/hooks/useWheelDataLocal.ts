import { useState } from 'react';
import type { WheelConfig, Segment } from '../types';
import type { WheelScheduleConfig } from '../../../../../types/models';

const defaultSegments: Segment[] = [
  { id: '1', label: '10% DESCUENTO', value: 'AHORRA10', color: '#FF6B6B', weight: 30 },
  { id: '2', label: 'ENVÍO GRATIS', value: 'ENVIOGRATIS', color: '#4ECDC4', weight: 25 },
  { id: '3', label: 'INTENTA DE NUEVO', value: 'INTENTAR', color: '#FFE66D', weight: 20 },
  { id: '4', label: '20% DESCUENTO', value: 'AHORRA20', color: '#A8E6CF', weight: 15 },
  { id: '5', label: 'REGALO EXTRA', value: 'REGALO', color: '#C7B3FF', weight: 10 },
];

const defaultWidgetConfig = {
  handlePosition: 'right' as const,
  handleType: 'floating' as const,
  handleText: '¡Gana Premios!',
  handleBackgroundColor: '#8B5CF6',
  handleTextColor: '#FFFFFF',
  handleIcon: '🎁',
  handleSize: 'medium' as const,
  handleAnimation: 'pulse' as const,
  handleBorderRadius: '12px',
  captureImageUrl: '',
  captureTitle: '',
  captureSubtitle: '',
  captureButtonText: '',
  capturePrivacyText: '',
  captureFormat: 'instant' as const
};

const initialWheelConfigs: WheelConfig[] = [
  {
    id: '1',
    name: 'Viernes Negro 2025',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      timezone: 'America/Argentina/Buenos_Aires',
      dateRange: {
        startDate: '2025-11-29T00:00',
        endDate: '2025-11-29T23:59',
      },
      weekDays: {
        enabled: true,
        days: [5] // Friday
      },
      timeSlots: {
        enabled: false,
        slots: []
      }
    },
    wheelDesign: {},
    widgetConfig: defaultWidgetConfig
  },
  {
    id: '2',
    name: 'Lunes Cibernético',
    segments: [
      { id: '1', label: '30% DESCUENTO', value: 'CIBER30', color: '#FF6B6B', weight: 20 },
      { id: '2', label: 'REGALO GRATIS', value: 'REGALO', color: '#4ECDC4', weight: 30 },
      { id: '3', label: '15% DESCUENTO', value: 'AHORRA15', color: '#FFE66D', weight: 50 },
    ],
    schedule: {
      enabled: true,
      timezone: 'America/Argentina/Buenos_Aires',
      dateRange: {
        startDate: '2025-12-02T00:00',
        endDate: '2025-12-02T23:59',
      },
      weekDays: {
        enabled: true,
        days: [1] // Monday
      },
      timeSlots: {
        enabled: false,
        slots: []
      }
    },
    wheelDesign: {},
    widgetConfig: defaultWidgetConfig
  },
  {
    id: '3',
    name: 'Días Festivos',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      timezone: 'America/Argentina/Buenos_Aires',
      dateRange: {
        startDate: '2025-12-15T00:00',
        endDate: '2025-12-31T23:59',
      },
      weekDays: {
        enabled: true,
        days: [0, 1, 2, 3, 4, 5, 6] // All days
      },
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 540, // 9:00
          endMinutes: 1320, // 22:00
          label: 'Horario Festivo'
        }]
      }
    },
    wheelDesign: {},
    widgetConfig: defaultWidgetConfig
  },
  {
    id: '4',
    name: 'Solo Fines de Semana',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      timezone: 'America/Argentina/Buenos_Aires',
      dateRange: {
        startDate: null,
        endDate: null,
      },
      weekDays: {
        enabled: true,
        days: [0, 6] // Saturday and Sunday
      },
      timeSlots: {
        enabled: true,
        slots: [{
          startMinutes: 600, // 10:00
          endMinutes: 1200, // 20:00
          label: 'Horario Fin de Semana'
        }]
      }
    },
    wheelDesign: {},
    widgetConfig: defaultWidgetConfig
  },
];

export const useWheelData = () => {
  const [wheels, setWheels] = useState<WheelConfig[]>(initialWheelConfigs);
  const [selectedWheelId, setSelectedWheelId] = useState(wheels[0].id);

  const selectedWheel = wheels.find(w => w.id === selectedWheelId) || wheels[0];

  const updateSegments = (newSegments: Segment[]) => {
    const updatedWheels = wheels.map(w =>
      w.id === selectedWheelId ? { ...w, segments: newSegments } : w
    );
    setWheels(updatedWheels);
  };

  const updateSchedule = (newSchedule: WheelScheduleConfig) => {
    console.log('[useWheelDataLocal] Updating schedule for wheel:', selectedWheelId, newSchedule);
    const updatedWheels = wheels.map(w =>
      w.id === selectedWheelId ? { ...w, schedule: newSchedule } : w
    );
    setWheels(updatedWheels);
  };

  const createNewWheel = (name?: string) => {
    const newWheel: WheelConfig = {
      id: Date.now().toString(),
      name: name || 'New Campaign',
      segments: [...defaultSegments],
      schedule: {
        enabled: false,
        timezone: 'America/Argentina/Buenos_Aires',
        dateRange: {
          startDate: null,
          endDate: null,
        },
        weekDays: {
          enabled: false,
          days: []
        },
        timeSlots: {
          enabled: false,
          slots: []
        }
      },
      wheelDesign: {},
      widgetConfig: {}
    };
    setWheels([...wheels, newWheel]);
    setSelectedWheelId(newWheel.id);
    return newWheel;
  };

  const updateWheelName = (wheelId: string, newName: string) => {
    const updatedWheels = wheels.map(w =>
      w.id === wheelId ? { ...w, name: newName } : w
    );
    setWheels(updatedWheels);
  };

  const deleteWheel = (wheelId: string) => {
    const updatedWheels = wheels.filter(w => w.id !== wheelId);
    setWheels(updatedWheels);
    
    // If deleting the selected wheel, select the first available wheel
    if (wheelId === selectedWheelId && updatedWheels.length > 0) {
      setSelectedWheelId(updatedWheels[0].id);
    }
  };

  const updateWheelDesign = (newDesign: any) => {
    if (selectedWheel) {
      const updatedWheels = wheels.map(w =>
        w.id === selectedWheel.id ? { ...w, wheelDesign: newDesign } : w
      );
      setWheels(updatedWheels);
    }
  };

  const updateWidgetConfig = (newConfig: any) => {
    if (selectedWheel) {
      const updatedWheels = wheels.map(w =>
        w.id === selectedWheel.id ? { ...w, widgetConfig: newConfig } : w
      );
      setWheels(updatedWheels);
    }
  };

  return {
    wheels,
    selectedWheelId,
    selectedWheel,
    setSelectedWheelId,
    updateSegments,
    updateSchedule,
    updateWheelDesign,
    updateWidgetConfig,
    createNewWheel,
    updateWheelName,
    deleteWheel,
    isLoading: false,
    error: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  };
};