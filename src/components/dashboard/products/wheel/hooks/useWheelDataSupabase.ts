import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { WheelService } from '../../../../../services/wheelService';
import { StoreService } from '../../../../../services/storeService';
import { useAuth } from '../../../../../contexts/AuthContext';
import type { WheelScheduleConfig } from '../../../../../types/models';
import type { Segment } from '../types';

// Fallback to local implementation if not authenticated
import { useWheelData as useWheelDataLocal } from './useWheelDataLocal';

// Helper functions to convert between database and local segment types
// Commenting out unused functions for now
// const _dbSegmentToLocal = (dbSegment: DbSegment): Segment => ({
//   id: dbSegment.id,
//   label: dbSegment.label,
//   value: dbSegment.value,
//   color: dbSegment.color,
//   weight: dbSegment.weight
// });

// const _localSegmentToDb = (segment: Segment): Partial<DbSegment> => ({
//   label: segment.label,
//   value: segment.value,
//   color: segment.color,
//   weight: segment.weight || 1,
//   prize_type: 'custom',
//   prize_data: null
// });

export function useWheelDataSupabase() {
  const { wheelId } = useParams<{ wheelId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // If not authenticated, use local implementation
  if (!user) {
    return useWheelDataLocal();
  }
  
  // Fetch user's store to get tiendanube_store_id
  const { data: storeResponse, isLoading: isLoadingStore } = useQuery({
    queryKey: ['userStore'],
    queryFn: () => StoreService.getUserStore(),
    enabled: !!user
  });
  
  const storeId = storeResponse?.data?.tiendanube_store_id;
  
  // State for selected wheel ID (from URL or first wheel)
  const [selectedWheelId, setSelectedWheelIdState] = useState<string | null>(wheelId || null);

  // Fetch all wheels for the store
  const {
    data: wheelsResponse,
    isLoading: isLoadingWheels,
    error: wheelsError
  } = useQuery({
    queryKey: ['wheels', storeId],
    queryFn: () => WheelService.getWheels(storeId!),
    enabled: !!storeId
  });

  const wheels = wheelsResponse?.data || [];

  // Fetch selected wheel with segments
  const {
    data: selectedWheelResponse,
    isLoading: isLoadingSelectedWheel,
    refetch: refetchSelectedWheel
  } = useQuery({
    queryKey: ['wheel', selectedWheelId],
    queryFn: () => WheelService.getWheel(selectedWheelId!),
    enabled: !!selectedWheelId
  });

  const selectedWheel = selectedWheelResponse?.data;

  // Set initial selected wheel
  useEffect(() => {
    if (!selectedWheelId && wheels.length > 0) {
      const firstWheel = wheels[0];
      setSelectedWheelIdState(firstWheel.id);
    }
  }, [wheels, selectedWheelId]);

  // Update URL when wheel selection changes
  const setSelectedWheelId = (wheelId: string) => {
    setSelectedWheelIdState(wheelId);
  };

  // Create wheel mutation
  const createWheelMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!storeId) {
        throw new Error('No store found for user. Please create a store first.');
      }
      
      console.log('Starting wheel creation process...');
      console.log('Store ID:', storeId);
      console.log('User:', user);
      
      const defaultSegments: Segment[] = [
        { id: '1', label: 'Premio Segmento 1', value: 'PREMIO1', color: '#FF6B6B', weight: 20 },
        { id: '2', label: 'Premio Segmento 2', value: 'PREMIO2', color: '#4ECDC4', weight: 20 },
        { id: '3', label: 'Premio Segmento 3', value: 'PREMIO3', color: '#FFE66D', weight: 20 },
        { id: '4', label: 'Premio Segmento 4', value: 'PREMIO4', color: '#A8E6CF', weight: 20 },
        { id: '5', label: 'Premio Segmento 5', value: 'PREMIO5', color: '#C7B3FF', weight: 20 },
      ];

      const defaultStyleConfig = {
        // Theme
        designTheme: 'modern' as const,
        
        // Background
        backgroundStyle: 'solid',
        backgroundColor: '#FFFFFF',
        backgroundGradientFrom: '#8B5CF6',
        backgroundGradientTo: '#EC4899',
        backgroundImage: undefined,
        backgroundOpacity: 1,
        
        // Wheel specific background
        wheelBackgroundColor: undefined,
        wheelBackgroundGradientFrom: undefined,
        wheelBackgroundGradientTo: undefined,
        wheelBorderStyle: 'solid' as const,
        wheelBorderColor: '#8B5CF6',
        wheelBorderWidth: 4,
        wheelBorderGradientFrom: undefined,
        wheelBorderGradientTo: undefined,
        
        // Shadow
        shadowColor: '#8B5CF6',
        shadowIntensity: 0.3,
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        innerShadowEnabled: false,
        innerShadowColor: '#000000',
        
        // Pegs
        pegStyle: 'dots',
        pegColor: '#FFD700',
        pegSize: 10,
        pegGlowEnabled: false,
        pegGlowColor: '#FFD700',
        
        // Center Button
        centerButtonText: 'GIRAR',
        centerButtonTextSize: 'medium',
        centerButtonBackgroundColor: '#8B5CF6',
        centerButtonTextColor: '#FFFFFF',
        centerButtonLogo: undefined,
        centerButtonBorderColor: undefined,
        centerButtonBorderWidth: 0,
        centerButtonGlowEnabled: false,
        centerButtonGlowColor: '#8B5CF6',
        centerButtonFont: 'default',
        centerButtonFontWeight: 'bold',
        
        // Pointer
        pointerStyle: 'arrow',
        pointerColor: '#FF1744',
        pointerSize: 40,
        pointerGlowEnabled: false,
        pointerGlowColor: '#FF1744',
        
        // Effects
        spinningEffect: 'smooth',
        spinDuration: 5,
        rotations: 5,
        soundEnabled: false,
        confettiEnabled: true,
        glowEffect: true,
        sparkleEffect: false,
        pulseEffect: false,
        
        // Segment styling
        segmentBorderEnabled: false,
        segmentBorderColor: '#ffffff',
        segmentBorderWidth: 2,
        segmentSeparatorEnabled: false,
        segmentSeparatorColor: '#e5e7eb',
        segmentTextFont: 'default',
        segmentTextBold: false,
        segmentTextShadow: false,
      };

      const defaultWidgetConfig = {
        handlePosition: 'right',
        handleType: 'floating',
        handleText: '¡Gana Premios!',
        handleBackgroundColor: '#8B5CF6',
        handleTextColor: '#FFFFFF',
        handleIcon: '🎁',
        handleSize: 'medium',
        handleAnimation: 'pulse',
        handleBorderRadius: '9999px',
        captureImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
        captureTitle: '¡Gira y Gana Premios Increíbles!',
        captureSubtitle: 'Ingresa tu email para participar y ganar descuentos exclusivos',
        captureButtonText: '¡Quiero Participar!',
        capturePrivacyText: 'Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
        captureFormat: 'instant'
      };

      const config = {
        segments: defaultSegments,
        style: defaultStyleConfig,
        wheelHandle: defaultWidgetConfig,
        schedule: {
          enabled: false,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          startTime: '09:00',
          endTime: '18:00',
          startDate: '',
          endDate: '',
        }
      };

      console.log('Creating wheel with config:', config);

      try {
        // Generate wheel ID
        const wheelId = crypto.randomUUID();
        
        const response = await WheelService.createWheel(storeId, {
          id: wheelId,
          store_id: storeId,
          name,
          config: config as any,
          is_active: true
        });

        console.log('Create wheel response:', response);

        if (!response.success) {
          console.error('Failed to create wheel:', response.error);
          throw new Error(response.error || 'Failed to create wheel');
        }

        // Segments are now stored in the config, no need to create them separately
        if (response.data) {
          console.log('Wheel created successfully with segments in config');
        }

        return response;
      } catch (error) {
        console.error('Error in createWheelMutation:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['wheels', storeId] });
        setSelectedWheelId(response.data.id);
        // Also invalidate the specific wheel query to fetch it with segments
        queryClient.invalidateQueries({ queryKey: ['wheel', response.data.id] });
        // Navigate to the new wheel
        navigate(`/dashboard/wheel/${response.data.id}`);
      }
    }
  });

  // Update wheel name mutation
  const updateWheelNameMutation = useMutation({
    mutationFn: ({ wheelId, name }: { wheelId: string; name: string }) =>
      WheelService.updateWheel(wheelId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wheels', storeId] });
      if (selectedWheelId) {
        queryClient.invalidateQueries({ queryKey: ['wheel', selectedWheelId] });
      }
    }
  });

  // Delete wheel mutation
  const deleteWheelMutation = useMutation({
    mutationFn: (wheelId: string) => WheelService.deleteWheel(wheelId),
    onSuccess: (_, deletedWheelId) => {
      queryClient.invalidateQueries({ queryKey: ['wheels', storeId] });
      // If the deleted wheel was selected, navigate to another wheel or dashboard
      if (selectedWheelId === deletedWheelId) {
        const remainingWheels = wheels.filter(w => w.id !== deletedWheelId);
        if (remainingWheels.length > 0) {
          // Navigate to the first remaining wheel
          setSelectedWheelId(remainingWheels[0].id);
        } else {
          // No wheels left, clear selection
          setSelectedWheelIdState(null);
        }
      }
    }
  });

  // Update segments mutation
  const updateSegmentsMutation = useMutation({
    mutationFn: async (segments: Segment[]) => {
      if (!selectedWheelId) throw new Error('No wheel selected');
      
      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error('No wheel data available');
      
      // Update the config with new segments
      const updatedConfig = {
        ...(currentWheel.config as any || {}),
        segments: segments
      };
      
      return WheelService.updateWheel(selectedWheelId, { 
        config: updatedConfig as any
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    }
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (schedule: WheelScheduleConfig) => {
      if (!selectedWheelId) throw new Error('No wheel selected');
      
      return WheelService.updateWheel(selectedWheelId, { 
        schedule_config: schedule as any
      });
    },
    onSuccess: () => {
      if (selectedWheelId) {
        queryClient.invalidateQueries({ queryKey: ['wheel', selectedWheelId] });
      }
    }
  });

  // Update wheel design mutation
  const updateWheelDesignMutation = useMutation({
    mutationFn: (styleConfig: any) => {
      if (!selectedWheelId) throw new Error('No wheel selected');
      
      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error('No wheel data available');
      
      // Update the config with new style
      const updatedConfig = {
        ...(currentWheel.config as any || {}),
        style: styleConfig
      };
      
      return WheelService.updateWheel(selectedWheelId, { 
        config: updatedConfig as any
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    }
  });

  // Update widget config mutation
  const updateWidgetConfigMutation = useMutation({
    mutationFn: (widgetConfig: any) => {
      if (!selectedWheelId) throw new Error('No wheel selected');
      
      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error('No wheel data available');
      
      // Update the config with new widget handle configuration
      const updatedConfig = {
        ...(currentWheel.config as any || {}),
        wheelHandle: widgetConfig
      };
      
      return WheelService.updateWheel(selectedWheelId, { 
        config: updatedConfig as any
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    }
  });

  // Helper functions
  const createNewWheel = (name?: string) => {
    console.log('createNewWheel called with name:', name);
    const wheelName = name || 'New Campaign';
    createWheelMutation.mutate(wheelName, {
      onError: (error) => {
        console.error('Failed to create wheel:', error);
      }
    });
    // Return a dummy wheel object for compatibility with the existing interface
    return {
      id: Date.now().toString(),
      name: wheelName,
      segments: [],
      schedule: {
        enabled: false,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        startTime: '09:00',
        endTime: '18:00',
        startDate: '',
        endDate: '',
      }
    };
  };

  const updateWheelName = (wheelId: string, name: string) => {
    updateWheelNameMutation.mutate({ wheelId, name });
  };

  const deleteWheel = (wheelId: string) => {
    if (wheels.length > 1) {
      deleteWheelMutation.mutate(wheelId);
    }
  };

  const updateSegments = (newSegments: Segment[]) => {
    updateSegmentsMutation.mutate(newSegments);
  };

  const updateSchedule = (newSchedule: WheelScheduleConfig) => {
    updateScheduleMutation.mutate(newSchedule);
  };

  const updateWheelDesign = (newDesign: any) => {
    updateWheelDesignMutation.mutate(newDesign);
  };

  const updateWidgetConfig = (newConfig: any) => {
    updateWidgetConfigMutation.mutate(newConfig);
  };

  // Convert data to expected format
  const formattedWheels = wheels.map(wheel => ({
    id: wheel.id,
    name: wheel.name,
    // Extract segments from config.segments
    segments: (wheel.config as any)?.segments || [],
    schedule: (wheel.config as any)?.schedule || {
      enabled: false,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startTime: '09:00',
      endTime: '18:00',
      startDate: '',
      endDate: '',
    },
    wheelDesign: (wheel.config as any)?.style || {},
    widgetConfig: (wheel.config as any)?.wheelHandle || {}
  }));

  const formattedSelectedWheel = selectedWheel ? {
    id: selectedWheel.id,
    name: selectedWheel.name,
    // Extract segments from config.segments instead of separate table
    segments: (selectedWheel.config as any)?.segments || [],
    wheelDesign: (selectedWheel.config as any)?.style || {},
    widgetConfig: (selectedWheel.config as any)?.wheelHandle || {},
    schedule: (selectedWheel.schedule_config as any) || {
      enabled: false,
      timezone: 'America/Argentina/Buenos_Aires',
      dateRange: {
        startDate: null,
        endDate: null
      },
      timeSlots: {
        enabled: false,
        slots: []
      },
      weekDays: {
        enabled: false,
        days: [0, 1, 2, 3, 4, 5, 6]
      },
      specialDates: {
        blacklistDates: [],
        whitelistDates: []
      }
    }
  } : formattedWheels[0] || null;

  return {
    wheels: formattedWheels,
    selectedWheelId: selectedWheelId || formattedWheels[0]?.id,
    selectedWheel: formattedSelectedWheel,
    setSelectedWheelId,
    updateSegments,
    updateSchedule,
    updateWheelDesign,
    updateWidgetConfig,
    createNewWheel,
    updateWheelName,
    deleteWheel,
    isLoading: isLoadingStore || isLoadingWheels || isLoadingSelectedWheel,
    error: wheelsError || null,
    isCreating: createWheelMutation.isPending,
    isUpdating: updateWheelNameMutation.isPending || updateSegmentsMutation.isPending || updateScheduleMutation.isPending || updateWheelDesignMutation.isPending || updateWidgetConfigMutation.isPending,
    isDeleting: deleteWheelMutation.isPending
  };
};
