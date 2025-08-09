import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WheelService } from '../services/wheelService';
import toast from 'react-hot-toast';
import type { WheelScheduleConfig } from '../types/models';
import type { Segment } from '../components/dashboard/products/wheel/types';

interface Wheel {
  id: string;
  name: string;
  segments: Segment[];
  schedule?: WheelScheduleConfig;
  wheelDesign?: any;
  widgetConfig?: any;
  is_active?: boolean;
}

interface WheelState {
  // Core state
  wheels: Wheel[];
  selectedWheelId: string | null;
  selectedWheel: Wheel | null;
  isLoading: boolean;
  error: Error | null;
  
  // UI state
  wheelMode: 'edit' | 'report';
  hasWheelSelected: boolean;
  activeConfigSection: string;
  
  // Actions - Data fetching
  loadWheels: (storeId: string) => Promise<void>;
  loadWheel: (wheelId: string) => Promise<void>;
  
  // Actions - CRUD operations
  createWheel: (storeId: string, name: string) => Promise<void>;
  updateWheelName: (wheelId: string, name: string) => Promise<void>;
  deleteWheel: (wheelId: string) => Promise<void>;
  selectWheel: (wheelId: string | null) => void;
  
  // Actions - Update operations
  updateSegments: (segments: Segment[]) => Promise<void>;
  updateSchedule: (schedule: WheelScheduleConfig) => Promise<void>;
  updateWheelDesign: (design: any) => Promise<void>;
  updateWidgetConfig: (config: any) => Promise<void>;
  
  // Actions - UI
  setWheelMode: (mode: 'edit' | 'report') => void;
  setActiveConfigSection: (section: string) => void;
  
  // Actions - Reset
  resetWheelSelection: () => void;
  clearError: () => void;
}

export const useWheelStore = create<WheelState>()(
  devtools(
    (set, get) => ({
      // Initial state
      wheels: [],
      selectedWheelId: null,
      selectedWheel: null,
      isLoading: false,
      error: null,
      wheelMode: 'edit',
      hasWheelSelected: false,
      activeConfigSection: 'segments',
      
      // Load all wheels for a store
      loadWheels: async (storeId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await WheelService.getWheels(storeId);
          
          if (response.success && response.data) {
            const formattedWheels = response.data.map(wheel => ({
              id: wheel.id,
              name: wheel.name,
              segments: (wheel.config as any)?.segments || [],
              schedule: wheel.schedule_config as unknown as WheelScheduleConfig,
              wheelDesign: (wheel.config as any)?.style || {},
              widgetConfig: {
                ...(wheel.config as any)?.wheelHandle || {},
                ...(wheel.config as any)?.emailCapture || {}
              }
            }));
            
            set({ wheels: formattedWheels, isLoading: false });
            
            // Auto-select first wheel if none selected
            const state = get();
            if (formattedWheels.length > 0 && !state.selectedWheelId) {
              get().selectWheel(formattedWheels[0].id);
            }
          } else {
            throw new Error(response.error || 'Error al cargar las ruletas');
          }
        } catch (error) {
          set({ error: error as Error, isLoading: false });
        }
      },
      
      // Load a specific wheel with all details
      loadWheel: async (wheelId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await WheelService.getWheel(wheelId);
          
          if (response.success && response.data) {
            const wheel = response.data;
            const formattedWheel: Wheel = {
              id: wheel.id,
              name: wheel.name,
              segments: (wheel.config as any)?.segments || [],
              schedule: wheel.schedule_config as unknown as WheelScheduleConfig,
              wheelDesign: (wheel.config as any)?.style || {},
              widgetConfig: {
                ...(wheel.config as any)?.wheelHandle || {},
                ...(wheel.config as any)?.emailCapture || {}
              }
            };
            
            
            // Update in wheels array and set as selected
            set(state => ({
              wheels: state.wheels.map(w => w.id === wheelId ? formattedWheel : w),
              selectedWheel: formattedWheel,
              selectedWheelId: wheelId,
              hasWheelSelected: true,
              isLoading: false
            }));
          } else {
            throw new Error(response.error || 'Error al cargar la ruleta');
          }
        } catch (error) {
          set({ error: error as Error, isLoading: false });
        }
      },
      
      // Create a new wheel
      createWheel: async (storeId: string, name: string) => {
        console.log('[wheelStore] createWheel called with storeId:', storeId, 'name:', name);
        set({ isLoading: true, error: null });
        
        const defaultSegments: Segment[] = [
          { id: '1', label: 'Premio 1', value: 'PREMIO1', color: '#FF6B6B', weight: 20 },
          { id: '2', label: 'Premio 2', value: 'PREMIO2', color: '#4ECDC4', weight: 20 },
          { id: '3', label: 'Premio 3', value: 'PREMIO3', color: '#FFE66D', weight: 20 },
          { id: '4', label: 'Premio 4', value: 'PREMIO4', color: '#A8E6CF', weight: 20 },
          { id: '5', label: 'Premio 5', value: 'PREMIO5', color: '#C7B3FF', weight: 20 },
        ];
        
        try {
          console.log('[wheelStore] Calling WheelService.createWheel');
          const response = await WheelService.createWheel(storeId, {
            name,
            config: { segments: defaultSegments } as any,
            is_active: true
          });
          
          console.log('[wheelStore] WheelService.createWheel response:', response);
          
          if (response.success && response.data) {
            toast.success('¡Ruleta creada exitosamente!');
            
            // Reload wheels and select the new one
            console.log('[wheelStore] Reloading wheels after creation');
            await get().loadWheels(storeId);
            get().selectWheel(response.data.id);
            set({ isLoading: false });
          } else {
            console.error('[wheelStore] Creation failed, response:', response);
            throw new Error(response.error || 'Error al crear la ruleta');
          }
        } catch (error) {
          console.error('[wheelStore] Create wheel error:', error);
          toast.error(error instanceof Error ? error.message : 'Error al crear la ruleta');
          set({ error: error as Error, isLoading: false });
        }
      },
      
      // Update wheel name
      updateWheelName: async (wheelId: string, name: string) => {
        
        try {
          const response = await WheelService.updateWheel(wheelId, { name });
          
          if (response.success) {
            set(state => ({
              wheels: state.wheels.map(w => w.id === wheelId ? { ...w, name } : w),
              selectedWheel: state.selectedWheel?.id === wheelId 
                ? { ...state.selectedWheel, name }
                : state.selectedWheel
            }));
            toast.success('¡Nombre actualizado exitosamente!');
          } else {
            throw new Error(response.error || 'Error al actualizar el nombre');
          }
        } catch (error) {
          toast.error('Error al actualizar el nombre');
        }
      },
      
      // Delete wheel
      deleteWheel: async (wheelId: string) => {
        
        try {
          const response = await WheelService.deleteWheel(wheelId);
          
          if (response.success) {
            const state = get();
            const remainingWheels = state.wheels.filter(w => w.id !== wheelId);
            
            // Update state
            set({ wheels: remainingWheels });
            
            // If deleted wheel was selected, select another
            if (state.selectedWheelId === wheelId) {
              if (remainingWheels.length > 0) {
                get().selectWheel(remainingWheels[0].id);
              } else {
                set({ selectedWheel: null, selectedWheelId: null, hasWheelSelected: false });
              }
            }
            
            toast.success('¡Ruleta eliminada exitosamente!');
          } else {
            throw new Error(response.error || 'Error al eliminar la ruleta');
          }
        } catch (error) {
          toast.error('Error al eliminar la ruleta');
        }
      },
      
      // Select a wheel
      selectWheel: (wheelId: string | null) => {
        if (!wheelId) {
          set({ selectedWheel: null, selectedWheelId: null, hasWheelSelected: false });
          return;
        }
        
        const state = get();
        const wheel = state.wheels.find(w => w.id === wheelId);
        
        if (wheel) {
          set({ selectedWheel: wheel, selectedWheelId: wheelId, hasWheelSelected: true });
          // Load full details
          get().loadWheel(wheelId);
        } else {
          set({ selectedWheel: null, selectedWheelId: null, hasWheelSelected: false });
        }
      },
      
      // Update segments
      updateSegments: async (segments: Segment[]) => {
        const state = get();
        if (!state.selectedWheelId || !state.selectedWheel) {
          return;
        }
        
        
        try {
          // Get the full wheel data from the API first to preserve other config fields
          const wheelResponse = await WheelService.getWheel(state.selectedWheelId);
          if (!wheelResponse.success || !wheelResponse.data) {
            throw new Error('Error al obtener los datos actuales de la ruleta');
          }
          
          const currentConfig = (wheelResponse.data.config as any) || {};
          const updatedConfig = {
            ...currentConfig,
            segments
          };
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, segments }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, segments }
                  : w
              )
            }));
          } else {
            throw new Error(response.error || 'Error al actualizar los segmentos');
          }
        } catch (error) {
          toast.error('Error al actualizar los segmentos');
        }
      },
      
      // Update schedule
      updateSchedule: async (schedule: WheelScheduleConfig) => {
        const state = get();
        if (!state.selectedWheelId) {
          return;
        }
        
        
        try {
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            schedule_config: schedule as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, schedule }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, schedule }
                  : w
              )
            }));
          } else {
            throw new Error(response.error || 'Error al actualizar el horario');
          }
        } catch (error) {
          toast.error('Error al actualizar el horario');
        }
      },
      
      // Update wheel design
      updateWheelDesign: async (design: any) => {
        const state = get();
        if (!state.selectedWheelId || !state.selectedWheel) {
          return;
        }
        
        
        try {
          // Get the full wheel data from the API first to preserve other config fields
          const wheelResponse = await WheelService.getWheel(state.selectedWheelId);
          if (!wheelResponse.success || !wheelResponse.data) {
            throw new Error('Error al obtener los datos actuales de la ruleta');
          }
          
          const currentConfig = (wheelResponse.data.config as any) || {};
          const updatedConfig = {
            ...currentConfig,
            style: design
          };
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, wheelDesign: design }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, wheelDesign: design }
                  : w
              )
            }));
          } else {
            throw new Error(response.error || 'Error al actualizar el diseño');
          }
        } catch (error) {
          toast.error('Error al actualizar el diseño');
        }
      },
      
      // Update widget config
      updateWidgetConfig: async (config: any) => {
        const state = get();
        if (!state.selectedWheelId || !state.selectedWheel) {
          return;
        }
        
        
        try {
          // Get the full wheel data from the API first to preserve other config fields
          const wheelResponse = await WheelService.getWheel(state.selectedWheelId);
          if (!wheelResponse.success || !wheelResponse.data) {
            throw new Error('Error al obtener los datos actuales de la ruleta');
          }
          
          const currentConfig = (wheelResponse.data.config as any) || {};
          const isEmailCaptureConfig = 'captureFormat' in config || 
                                      'captureTitle' in config || 
                                      'captureSubtitle' in config;
          
          const updatedConfig = {
            ...currentConfig,
            wheelHandle: isEmailCaptureConfig ? currentConfig.wheelHandle : config,
            emailCapture: isEmailCaptureConfig ? config : currentConfig.emailCapture
          };
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, widgetConfig: { ...state.selectedWheel.widgetConfig, ...config } }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, widgetConfig: { ...w.widgetConfig, ...config } }
                  : w
              )
            }));
          } else {
            throw new Error(response.error || 'Error al actualizar la configuración del widget');
          }
        } catch (error) {
          toast.error('Error al actualizar la configuración del widget');
        }
      },
      
      // UI Actions
      setWheelMode: (mode: 'edit' | 'report') => {
        set({ wheelMode: mode });
      },
      
      setActiveConfigSection: (section: string) => {
        set({ activeConfigSection: section });
      },
      
      // Reset wheel selection
      resetWheelSelection: () => {
        set({
          selectedWheelId: null,
          selectedWheel: null,
          hasWheelSelected: false,
          wheels: [],
          error: null
        });
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'wheel-store'
    }
  )
);