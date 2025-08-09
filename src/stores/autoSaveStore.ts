import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SaveType = 'segments' | 'appearance' | 'handle' | 'capture' | 'schedule' | 'widget';

interface SaveQueueItem {
  type: SaveType;
  data: any;
  timestamp: number;
  retryCount?: number;
}

interface AutoSaveState {
  // Save queue
  saveQueue: Map<SaveType, SaveQueueItem>;
  
  // Save status for each tab
  saveStatus: Map<SaveType, 'idle' | 'pending' | 'saving' | 'saved' | 'error'>;
  
  // Debounce timers
  debounceTimers: Map<SaveType, NodeJS.Timeout>;
  
  // Global settings
  debounceDelay: number;
  maxRetries: number;
  statusClearDelay: number;
  
  // Actions
  queueSave: (type: SaveType, data: any, onSave: (data: any) => Promise<void>) => void;
  processSave: (type: SaveType, onSave: (data: any) => Promise<void>) => Promise<void>;
  getSaveStatus: (type: SaveType) => 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  clearStatus: (type: SaveType) => void;
  clearAllPending: () => void;
  updateDebounceDelay: (delay: number) => void;
}

export const useAutoSaveStore = create<AutoSaveState>()(
  devtools(
    (set, get) => ({
      // Initial state
      saveQueue: new Map(),
      saveStatus: new Map(),
      debounceTimers: new Map(),
      debounceDelay: 1000,
      maxRetries: 3,
      statusClearDelay: 3000,
      
      // Queue a save operation with debouncing
      queueSave: (type: SaveType, data: any, onSave: (data: any) => Promise<void>) => {
        const state = get();
        
        // Clear existing timer for this type
        const existingTimer = state.debounceTimers.get(type);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        
        // Update queue with new data
        const queueItem: SaveQueueItem = {
          type,
          data,
          timestamp: Date.now(),
          retryCount: 0
        };
        
        const newQueue = new Map(state.saveQueue);
        newQueue.set(type, queueItem);
        
        // Update status to pending
        const newStatus = new Map(state.saveStatus);
        newStatus.set(type, 'pending');
        
        // Create new debounce timer
        const newTimer = setTimeout(() => {
          get().processSave(type, onSave);
        }, state.debounceDelay);
        
        const newTimers = new Map(state.debounceTimers);
        newTimers.set(type, newTimer);
        
        set({
          saveQueue: newQueue,
          saveStatus: newStatus,
          debounceTimers: newTimers
        });
      },
      
      // Process the actual save
      processSave: async (type: SaveType, onSave: (data: any) => Promise<void>) => {
        const state = get();
        const queueItem = state.saveQueue.get(type);
        
        if (!queueItem) return;
        
        // Update status to saving
        const newStatus = new Map(state.saveStatus);
        newStatus.set(type, 'saving');
        set({ saveStatus: newStatus });
        
        try {
          // Perform the save
          await onSave(queueItem.data);
          
          // Update status to saved
          const savedStatus = new Map(get().saveStatus);
          savedStatus.set(type, 'saved');
          set({ saveStatus: savedStatus });
          
          // Remove from queue
          const newQueue = new Map(get().saveQueue);
          newQueue.delete(type);
          set({ saveQueue: newQueue });
          
          // Clear status after delay
          setTimeout(() => {
            get().clearStatus(type);
          }, state.statusClearDelay);
          
        } catch (error) {
          console.error(`[AutoSave] Failed to save ${type}:`, error);
          
          // Update retry count
          const retryItem = { ...queueItem, retryCount: (queueItem.retryCount || 0) + 1 };
          
          if (retryItem.retryCount < state.maxRetries) {
            // Retry after delay
            const retryDelay = Math.min(1000 * Math.pow(2, retryItem.retryCount), 10000);
            
            const newQueue = new Map(get().saveQueue);
            newQueue.set(type, retryItem);
            set({ saveQueue: newQueue });
            
            setTimeout(() => {
              get().processSave(type, onSave);
            }, retryDelay);
            
          } else {
            // Max retries reached, mark as error
            const errorStatus = new Map(get().saveStatus);
            errorStatus.set(type, 'error');
            set({ saveStatus: errorStatus });
            
            // Clear error status after longer delay
            setTimeout(() => {
              get().clearStatus(type);
            }, state.statusClearDelay * 2);
          }
        }
      },
      
      // Get save status for a specific type
      getSaveStatus: (type: SaveType) => {
        return get().saveStatus.get(type) || 'idle';
      },
      
      // Clear status for a specific type
      clearStatus: (type: SaveType) => {
        const newStatus = new Map(get().saveStatus);
        newStatus.set(type, 'idle');
        set({ saveStatus: newStatus });
      },
      
      // Clear all pending saves (useful when switching wheels)
      clearAllPending: () => {
        const state = get();
        
        // Clear all timers
        state.debounceTimers.forEach(timer => clearTimeout(timer));
        
        set({
          saveQueue: new Map(),
          saveStatus: new Map(),
          debounceTimers: new Map()
        });
      },
      
      // Update debounce delay
      updateDebounceDelay: (delay: number) => {
        set({ debounceDelay: delay });
      }
    }),
    {
      name: 'auto-save-store'
    }
  )
);