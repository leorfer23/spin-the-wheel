import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { WheelService } from "../../../../../services/wheelService";
import { StoreService } from "../../../../../services/storeService";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useStore } from "../../../../../contexts/StoreContext";
import toast from "react-hot-toast";
import type { WheelScheduleConfig } from "../../../../../types/models";
import type { Segment } from "../types";

// Fallback to local implementation if not authenticated
import { useWheelData as useWheelDataLocal } from "./useWheelDataLocal";

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
  const { selectedStoreId } = useStore();

  // If not authenticated, use local implementation
  if (!user) {
    return useWheelDataLocal();
  }

  // Use the store ID from the selected store
  const storeId = selectedStoreId;

  // Get selected wheel ID from URL or null
  const [selectedWheelId, setSelectedWheelIdState] = useState<string | null>(
    wheelId || null
  );

  // Simply update when URL changes
  useEffect(() => {
    setSelectedWheelIdState(wheelId || null);
  }, [wheelId]);

  // Fetch all wheels for the store
  const {
    data: wheelsResponse,
    isLoading: isLoadingWheels,
    error: wheelsError,
  } = useQuery({
    queryKey: ["wheels", storeId],
    queryFn: () => WheelService.getWheels(storeId!),
    enabled: !!storeId,
  });

  const wheels = wheelsResponse?.data || [];

  // Fetch selected wheel with segments
  const {
    data: selectedWheelResponse,
    isLoading: isLoadingSelectedWheel,
    refetch: refetchSelectedWheel,
  } = useQuery({
    queryKey: ["wheel", selectedWheelId],
    queryFn: () => WheelService.getWheel(selectedWheelId!),
    enabled: !!selectedWheelId,
  });

  const selectedWheel = selectedWheelResponse?.data;

  // Update URL when wheel selection changes
  const setSelectedWheelId = (wheelId: string) => {
    setSelectedWheelIdState(wheelId);
    // Navigate to the wheel URL
    if (wheelId) {
      navigate(`/dashboard/wheels/${wheelId}`);
    }
  };

  // Create wheel mutation
  const createWheelMutation = useMutation({
    mutationFn: async (name: string) => {
      let currentStoreId = storeId;

      // If no store exists, create one automatically
      if (!currentStoreId) {
        toast.loading("Creating your store...", { id: "store-create" });

        try {
          const storeData = {
            tiendanube_store_id: `store-${Date.now()}`,
            store_name: "My Store",
            platform: "custom" as const,
            store_url: "https://example.com",
          };

          const storeResponse = await StoreService.createStore(storeData);

          if (!storeResponse.success || !storeResponse.data) {
            toast.dismiss("store-create");
            const errorMsg =
              "Failed to create store: " +
              (storeResponse.error || "Unknown error");
            throw new Error(errorMsg);
          }

          currentStoreId = storeResponse.data.id; // Use the store id field
          toast.success("Store created!", { id: "store-create" });

          // Invalidate the store query to refresh the data
          queryClient.invalidateQueries({ queryKey: ["userStore"] });
        } catch (error) {
          toast.dismiss("store-create");
          throw error;
        }
      }

      const defaultSegments: Segment[] = [
        {
          id: "1",
          label: "Premio Segmento 1",
          value: "PREMIO1",
          color: "#FF6B6B",
          weight: 20,
        },
        {
          id: "2",
          label: "Premio Segmento 2",
          value: "PREMIO2",
          color: "#4ECDC4",
          weight: 20,
        },
        {
          id: "3",
          label: "Premio Segmento 3",
          value: "PREMIO3",
          color: "#FFE66D",
          weight: 20,
        },
        {
          id: "4",
          label: "Premio Segmento 4",
          value: "PREMIO4",
          color: "#A8E6CF",
          weight: 20,
        },
        {
          id: "5",
          label: "Premio Segmento 5",
          value: "PREMIO5",
          color: "#C7B3FF",
          weight: 20,
        },
      ];

      const defaultStyleConfig = {
        // Theme
        designTheme: "modern" as const,

        // Background
        backgroundStyle: "solid",
        backgroundColor: "#FFFFFF",
        backgroundGradientFrom: "#8B5CF6",
        backgroundGradientTo: "#EC4899",
        backgroundImage: undefined,
        backgroundOpacity: 1,

        // Wheel specific background
        wheelBackgroundColor: undefined,
        wheelBackgroundGradientFrom: undefined,
        wheelBackgroundGradientTo: undefined,
        wheelBorderStyle: "solid" as const,
        wheelBorderColor: "#8B5CF6",
        wheelBorderWidth: 4,
        wheelBorderGradientFrom: undefined,
        wheelBorderGradientTo: undefined,

        // Shadow
        shadowColor: "#8B5CF6",
        shadowIntensity: 0.3,
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        innerShadowEnabled: false,
        innerShadowColor: "#000000",

        // Pegs
        pegStyle: "dots",
        pegColor: "#FFD700",
        pegSize: 10,
        pegGlowEnabled: false,
        pegGlowColor: "#FFD700",

        // Center Button
        centerButtonText: "GIRAR",
        centerButtonTextSize: "medium",
        centerButtonBackgroundColor: "#8B5CF6",
        centerButtonTextColor: "#FFFFFF",
        centerButtonLogo: undefined,
        centerButtonBorderColor: undefined,
        centerButtonBorderWidth: 0,
        centerButtonGlowEnabled: false,
        centerButtonGlowColor: "#8B5CF6",
        centerButtonFont: "default",
        centerButtonFontWeight: "bold",

        // Pointer
        pointerStyle: "triangle",
        pointerColor: "#FF1744",
        pointerSize: 60,
        pointerGlowEnabled: false,
        pointerGlowColor: "#FF1744",

        // Effects
        spinningEffect: "smooth",
        spinDuration: 5,
        rotations: 5,
        soundEnabled: false,
        confettiEnabled: true,
        glowEffect: true,
        sparkleEffect: false,
        pulseEffect: false,

        // Segment styling
        segmentBorderEnabled: false,
        segmentBorderColor: "#ffffff",
        segmentBorderWidth: 2,
        segmentSeparatorEnabled: false,
        segmentSeparatorColor: "#e5e7eb",
        segmentTextFont: "default",
        segmentTextBold: false,
        segmentTextShadow: false,
      };

      const defaultWidgetConfig = {
        handlePosition: "right",
        handleType: "floating",
        handleText: "¡Gana Premios!",
        handleBackgroundColor: "#8B5CF6",
        handleTextColor: "#FFFFFF",
        handleIcon: "🎁",
        handleSize: "medium",
        handleAnimation: "pulse",
        handleBorderRadius: "9999px",
      };

      const defaultEmailCaptureConfig = {
        captureImageUrl:
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop",
        captureTitle: "¡Gira y Gana Premios Increíbles!",
        captureSubtitle:
          "Ingresa tu email para participar y ganar descuentos exclusivos",
        captureButtonText: "¡Quiero Participar!",
        capturePrivacyText:
          "Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.",
        captureFormat: "instant",
      };

      const config = {
        segments: defaultSegments,
        style: defaultStyleConfig,
        wheelHandle: defaultWidgetConfig,
        emailCapture: defaultEmailCaptureConfig,
        schedule: {
          enabled: false,
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          startTime: "09:00",
          endTime: "18:00",
          startDate: "",
          endDate: "",
        },
      };

      try {
        // Generate wheel ID
        const wheelId = crypto.randomUUID();

        toast.loading("Creating your wheel...", { id: "wheel-create" });

        const response = await WheelService.createWheel(currentStoreId!, {
          id: wheelId,
          name,
          config: config as any,
          is_active: true,
        });

        if (!response.success) {
          toast.dismiss("wheel-create");
          const errorMsg = response.error || "Failed to create wheel";
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        toast.success("Wheel created successfully!", { id: "wheel-create" });

        // Segments are now stored in the config, no need to create them separately

        return response;
      } catch (error) {
        toast.dismiss("wheel-create");
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
        throw error;
      }
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ["wheels", storeId] });
        setSelectedWheelId(response.data.id);
        // Also invalidate the specific wheel query to fetch it with segments
        queryClient.invalidateQueries({
          queryKey: ["wheel", response.data.id],
        });
        // Navigate to the new wheel
        navigate(`/dashboard/wheels/${response.data.id}`);
      }
    },
  });

  // Update wheel name mutation
  const updateWheelNameMutation = useMutation({
    mutationFn: ({ wheelId, name }: { wheelId: string; name: string }) =>
      WheelService.updateWheel(wheelId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheels", storeId] });
      if (selectedWheelId) {
        queryClient.invalidateQueries({ queryKey: ["wheel", selectedWheelId] });
      }
    },
  });

  // Delete wheel mutation
  const deleteWheelMutation = useMutation({
    mutationFn: (wheelId: string) => WheelService.deleteWheel(wheelId),
    onSuccess: (_, deletedWheelId) => {
      queryClient.invalidateQueries({ queryKey: ["wheels", storeId] });
      // If the deleted wheel was selected, navigate to another wheel or dashboard
      if (selectedWheelId === deletedWheelId) {
        const remainingWheels = wheels.filter((w) => w.id !== deletedWheelId);
        if (remainingWheels.length > 0) {
          // Navigate to the first remaining wheel
          setSelectedWheelId(remainingWheels[0].id);
        } else {
          // No wheels left, clear selection
          setSelectedWheelIdState(null);
        }
      }
    },
  });

  // Update segments mutation
  const updateSegmentsMutation = useMutation({
    mutationFn: async (segments: Segment[]) => {
      if (!selectedWheelId) throw new Error("No wheel selected");

      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error("No wheel data available");

      // Update the config with new segments
      const updatedConfig = {
        ...((currentWheel.config as any) || {}),
        segments: segments,
      };

      return WheelService.updateWheel(selectedWheelId, {
        config: updatedConfig as any,
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (schedule: WheelScheduleConfig) => {
      if (!selectedWheelId) throw new Error("No wheel selected");

      const result = await WheelService.updateWheel(selectedWheelId, {
        schedule_config: schedule as any,
      });

      return result;
    },
    onSuccess: () => {
      if (selectedWheelId) {
        queryClient.invalidateQueries({ queryKey: ["wheel", selectedWheelId] });
      }
    },
    onError: () => {
      // Handle error silently
    },
  });

  // Update wheel design mutation
  const updateWheelDesignMutation = useMutation({
    mutationFn: (styleConfig: any) => {
      if (!selectedWheelId) throw new Error("No wheel selected");

      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error("No wheel data available");

      // Update the config with new style
      const updatedConfig = {
        ...((currentWheel.config as any) || {}),
        style: styleConfig,
      };

      return WheelService.updateWheel(selectedWheelId, {
        config: updatedConfig as any,
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    },
  });

  // Update widget config mutation
  const updateWidgetConfigMutation = useMutation({
    mutationFn: (widgetConfig: any) => {
      if (!selectedWheelId) throw new Error("No wheel selected");

      // Get current wheel config
      const currentWheel = selectedWheel;
      if (!currentWheel) throw new Error("No wheel data available");

      // Determine if this is handle config or email capture config
      const isEmailCaptureConfig =
        "captureFormat" in widgetConfig ||
        "captureTitle" in widgetConfig ||
        "captureSubtitle" in widgetConfig ||
        "captureButtonText" in widgetConfig ||
        "capturePrivacyText" in widgetConfig ||
        "captureImageUrl" in widgetConfig;

      // Update the appropriate config section
      const updatedConfig = {
        ...((currentWheel.config as any) || {}),
        wheelHandle: isEmailCaptureConfig
          ? (currentWheel.config as any)?.wheelHandle
          : widgetConfig,
        emailCapture: isEmailCaptureConfig
          ? widgetConfig
          : (currentWheel.config as any)?.emailCapture,
      };

      return WheelService.updateWheel(selectedWheelId, {
        config: updatedConfig as any,
      });
    },
    onSuccess: () => {
      refetchSelectedWheel();
    },
  });

  // Helper functions
  const createNewWheel = (name?: string) => {
    const wheelName = name || "New Campaign";
    createWheelMutation.mutate(wheelName);
    // Return a dummy wheel object for compatibility with the existing interface
    return {
      id: Date.now().toString(),
      name: wheelName,
      segments: [],
      schedule: {
        enabled: false,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        startTime: "09:00",
        endTime: "18:00",
        startDate: "",
        endDate: "",
        timezone: "America/Argentina/Buenos_Aires",
      },
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
  const formattedWheels = wheels.map((wheel) => ({
    id: wheel.id,
    name: wheel.name,
    // Extract segments from config.segments
    segments: (wheel.config as any)?.segments || [],
    // Clean and get schedule from schedule_config field
    schedule: wheel.schedule_config
      ? {
          enabled: (wheel.schedule_config as any).enabled || false,
          timezone:
            (wheel.schedule_config as any).timezone ||
            "America/Argentina/Buenos_Aires",
          weekDays: (wheel.schedule_config as any).weekDays || {
            enabled: false,
            days: [],
          },
          dateRange: (wheel.schedule_config as any).dateRange || {
            startDate: null,
            endDate: null,
          },
          timeSlots: (wheel.schedule_config as any).timeSlots || {
            enabled: false,
            slots: [],
          },
        }
      : {
          enabled: false,
          timezone: "America/Argentina/Buenos_Aires",
          dateRange: {
            startDate: null,
            endDate: null,
          },
          timeSlots: {
            enabled: false,
            slots: [],
          },
          weekDays: {
            enabled: false,
            days: [],
          },
        },
    wheelDesign: (wheel.config as any)?.style || {},
    widgetConfig: {
      ...((wheel.config as any)?.wheelHandle || {}),
      ...((wheel.config as any)?.emailCapture || {}),
    },
  }));

  // Clean up old format fields if they exist for selectedWheel
  if (selectedWheel && selectedWheel.schedule_config) {
    // Cleaned schedule is computed but not used - keeping for potential future use
    // const cleanedSchedule = {
    //   enabled: (selectedWheel.schedule_config as any).enabled || false,
    //   timezone: (selectedWheel.schedule_config as any).timezone || 'America/Argentina/Buenos_Aires',
    //   weekDays: (selectedWheel.schedule_config as any).weekDays || { enabled: false, days: [] },
    //   dateRange: (selectedWheel.schedule_config as any).dateRange || { startDate: null, endDate: null },
    //   timeSlots: (selectedWheel.schedule_config as any).timeSlots || { enabled: false, slots: [] }
    // };
  }

  const formattedSelectedWheel = selectedWheel
    ? {
        id: selectedWheel.id,
        name: selectedWheel.name,
        // Extract segments from config.segments instead of separate table
        segments: (selectedWheel.config as any)?.segments || [],
        wheelDesign: (selectedWheel.config as any)?.style || {},
        widgetConfig: {
          ...((selectedWheel.config as any)?.wheelHandle || {}),
          ...((selectedWheel.config as any)?.emailCapture || {}),
        },
        // Clean and get schedule from schedule_config field, removing old format fields
        schedule: selectedWheel.schedule_config
          ? {
              enabled: (selectedWheel.schedule_config as any).enabled || false,
              timezone:
                (selectedWheel.schedule_config as any).timezone ||
                "America/Argentina/Buenos_Aires",
              weekDays: (selectedWheel.schedule_config as any).weekDays || {
                enabled: false,
                days: [],
              },
              dateRange: (selectedWheel.schedule_config as any).dateRange || {
                startDate: null,
                endDate: null,
              },
              timeSlots: (selectedWheel.schedule_config as any).timeSlots || {
                enabled: false,
                slots: [],
              },
            }
          : {
              enabled: false,
              timezone: "America/Argentina/Buenos_Aires",
              dateRange: {
                startDate: null,
                endDate: null,
              },
              timeSlots: {
                enabled: false,
                slots: [],
              },
              weekDays: {
                enabled: false,
                days: [],
              },
            },
      }
    : formattedWheels[0] || null;

  // Auto-select first wheel if none selected and wheels are available
  const effectiveSelectedWheelId =
    selectedWheelId || formattedWheels[0]?.id || null;
  const effectiveSelectedWheel =
    formattedSelectedWheel || formattedWheels[0] || null;

  return {
    wheels: formattedWheels,
    selectedWheelId: effectiveSelectedWheelId,
    selectedWheel: effectiveSelectedWheel,
    setSelectedWheelId,
    updateSegments,
    updateSchedule,
    updateWheelDesign,
    updateWidgetConfig,
    createNewWheel,
    updateWheelName,
    deleteWheel,
    isLoading: isLoadingWheels || isLoadingSelectedWheel,
    error: wheelsError || null,
    isCreating: createWheelMutation.isPending,
    isUpdating:
      updateWheelNameMutation.isPending ||
      updateSegmentsMutation.isPending ||
      updateScheduleMutation.isPending ||
      updateWheelDesignMutation.isPending ||
      updateWidgetConfigMutation.isPending,
    isDeleting: deleteWheelMutation.isPending,
  };
}
