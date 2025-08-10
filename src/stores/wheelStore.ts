import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WheelService } from '../services/wheelService';
import toast from 'react-hot-toast';
import type { WheelScheduleConfig } from '../types/models';
import type { Segment } from '../components/dashboard/products/wheel/types';
import {
  DEFAULT_WHEEL_DESIGN,
  DEFAULT_WIDGET_HANDLE_CONFIG,
  DEFAULT_EMAIL_CAPTURE_CONFIG,
  DEFAULT_SEGMENTS_SIMPLE,
  DEFAULT_SCHEDULE_CONFIG,
  mergeWithDefaults
} from '../config/wheelDefaults';

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
            const formattedWheels = response.data.map(wheel => {
              const config = wheel.config as any || {};
              return {
                id: wheel.id,
                name: wheel.name,
                segments: config.segments || DEFAULT_SEGMENTS_SIMPLE,
                schedule: mergeWithDefaults(DEFAULT_SCHEDULE_CONFIG, wheel.schedule_config as any),
                wheelDesign: mergeWithDefaults(DEFAULT_WHEEL_DESIGN, config.style),
                widgetConfig: {
                  ...mergeWithDefaults(DEFAULT_WIDGET_HANDLE_CONFIG, config.wheelHandle),
                  ...mergeWithDefaults(DEFAULT_EMAIL_CAPTURE_CONFIG, config.emailCapture)
                },
                is_active: wheel.is_active
              };
            });
            
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
            const config = wheel.config as any || {};
            const formattedWheel: Wheel = {
              id: wheel.id,
              name: wheel.name,
              segments: config.segments || DEFAULT_SEGMENTS_SIMPLE,
              schedule: mergeWithDefaults(DEFAULT_SCHEDULE_CONFIG, wheel.schedule_config as any),
              wheelDesign: mergeWithDefaults(DEFAULT_WHEEL_DESIGN, config.style),
              widgetConfig: {
                ...mergeWithDefaults(DEFAULT_WIDGET_HANDLE_CONFIG, config.wheelHandle),
                ...mergeWithDefaults(DEFAULT_EMAIL_CAPTURE_CONFIG, config.emailCapture)
              },
              is_active: wheel.is_active
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
        
        try {
          console.log('[wheelStore] Calling WheelService.createWheel');
          const response = await WheelService.createWheel(storeId, {
            name,
            config: { 
              segments: DEFAULT_SEGMENTS_SIMPLE,
              style: DEFAULT_WHEEL_DESIGN,
              wheelHandle: DEFAULT_WIDGET_HANDLE_CONFIG,
              emailCapture: DEFAULT_EMAIL_CAPTURE_CONFIG
            } as any,
            schedule_config: DEFAULT_SCHEDULE_CONFIG as any,
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
        
        // Ensure each segment has all properties
        const completeSegments = segments.map(segment => ({
          id: segment.id,
          label: segment.label,
          value: segment.value,
          color: segment.color,
          weight: segment.weight || 20,
          textColor: segment.textColor || '#FFFFFF',
          fontSize: segment.fontSize || 14,
          fontWeight: segment.fontWeight || 'normal',
          icon: segment.icon || null,
          image: segment.image || null,
          description: segment.description || null,
          terms: segment.terms || null,
          isJackpot: segment.isJackpot || false,
          soundEffect: segment.soundEffect || null,
        }));
        
        try {
          // Get the full wheel data from the API first to preserve other config fields
          const wheelResponse = await WheelService.getWheel(state.selectedWheelId);
          if (!wheelResponse.success || !wheelResponse.data) {
            throw new Error('Error al obtener los datos actuales de la ruleta');
          }
          
          const currentConfig = (wheelResponse.data.config as any) || {};
          const updatedConfig = {
            ...currentConfig,
            segments: completeSegments
          };
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, segments: completeSegments }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, segments: completeSegments }
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
      updateSchedule: async (scheduleUpdates: Partial<WheelScheduleConfig>) => {
        const state = get();
        if (!state.selectedWheelId || !state.selectedWheel) {
          return;
        }
        
        // Merge updates with current schedule to create complete object
        const currentSchedule = state.selectedWheel.schedule || DEFAULT_SCHEDULE_CONFIG;
        const completeSchedule = mergeWithDefaults(DEFAULT_SCHEDULE_CONFIG, {
          ...currentSchedule,
          ...scheduleUpdates
        });
        
        try {
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            schedule_config: completeSchedule as any
          });
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, schedule: completeSchedule }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, schedule: completeSchedule }
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
      updateWheelDesign: async (designUpdates: any) => {
        const state = get();
        if (!state.selectedWheelId || !state.selectedWheel) {
          return;
        }
        
        console.log('[wheelStore] updateWheelDesign called with updates:', designUpdates);
        
        // Merge updates with current wheel design to create complete object
        const currentWheelDesign = state.selectedWheel.wheelDesign || DEFAULT_WHEEL_DESIGN;
        const completeDesign = {
          ...DEFAULT_WHEEL_DESIGN, // Start with defaults
          ...currentWheelDesign,    // Apply current saved values
          ...designUpdates          // Apply new updates
        };
        
        console.log('[wheelStore] Complete design object:', completeDesign);
        
        try {
          // Get the full wheel data from the API first to preserve other config fields
          const wheelResponse = await WheelService.getWheel(state.selectedWheelId);
          if (!wheelResponse.success || !wheelResponse.data) {
            throw new Error('Error al obtener los datos actuales de la ruleta');
          }
          
          const currentConfig = (wheelResponse.data.config as any) || {};
          const updatedConfig = {
            ...currentConfig,
            style: completeDesign // Save the complete design object
          };
          
          console.log('[wheelStore] Sending to database - updatedConfig:', updatedConfig);
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          console.log('[wheelStore] Database update response:', response);
          
          if (response.success) {
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, wheelDesign: completeDesign }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, wheelDesign: completeDesign }
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
      updateWidgetConfig: async (configUpdates: any) => {
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
          
          // Determine if this is an email capture or handle update based on properties
          const isEmailCaptureConfig = 'captureFormat' in configUpdates || 
                                      'captureTitle' in configUpdates || 
                                      'captureSubtitle' in configUpdates ||
                                      'emailPlaceholder' in configUpdates;
          
          // Merge with defaults to create complete objects
          const currentHandle = mergeWithDefaults(DEFAULT_WIDGET_HANDLE_CONFIG, currentConfig.wheelHandle);
          const currentCapture = mergeWithDefaults(DEFAULT_EMAIL_CAPTURE_CONFIG, currentConfig.emailCapture);
          
          // Apply updates to the appropriate config
          const completeHandle = isEmailCaptureConfig ? currentHandle : mergeWithDefaults(currentHandle, configUpdates);
          const completeCapture = isEmailCaptureConfig ? mergeWithDefaults(currentCapture, configUpdates) : currentCapture;
          
          const updatedConfig = {
            ...currentConfig,
            wheelHandle: completeHandle,
            emailCapture: completeCapture
          };
          
          const response = await WheelService.updateWheel(state.selectedWheelId, {
            config: updatedConfig as any
          });
          
          if (response.success) {
            const updatedWidgetConfig = {
              ...completeHandle,
              ...completeCapture
            };
            
            set(state => ({
              selectedWheel: state.selectedWheel 
                ? { ...state.selectedWheel, widgetConfig: updatedWidgetConfig }
                : null,
              wheels: state.wheels.map(w => 
                w.id === state.selectedWheelId 
                  ? { ...w, widgetConfig: updatedWidgetConfig }
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