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

const initialWheelConfigs: WheelConfig[] = [
  {
    id: '1',
    name: 'Viernes Negro 2025',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      days: ['Fri'],
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-11-29',
      endDate: '2025-11-29',
    },
    wheelDesign: {},
    widgetConfig: {}
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
      days: ['Mon'],
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-12-02',
      endDate: '2025-12-02',
    },
    wheelDesign: {},
    widgetConfig: {}
  },
  {
    id: '3',
    name: 'Días Festivos',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startTime: '09:00',
      endTime: '22:00',
      startDate: '2025-12-15',
      endDate: '2025-12-31',
    },
    wheelDesign: {},
    widgetConfig: {}
  },
  {
    id: '4',
    name: 'Solo Fines de Semana',
    segments: defaultSegments,
    schedule: {
      enabled: true,
      days: ['Sat', 'Sun'],
      startTime: '10:00',
      endTime: '20:00',
      startDate: '',
      endDate: '',
    },
    wheelDesign: {},
    widgetConfig: {}
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
    // For now, we don't save the schedule config in local mode
    // This is just to satisfy the interface
    console.log('Schedule update in local mode:', newSchedule);
  };

  const createNewWheel = (name?: string) => {
    const newWheel: WheelConfig = {
      id: Date.now().toString(),
      name: name || 'New Campaign',
      segments: [...defaultSegments],
      schedule: {
        enabled: false,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        startTime: '09:00',
        endTime: '18:00',
        startDate: '',
        endDate: '',
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