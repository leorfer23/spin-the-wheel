import { useCallback, useEffect } from 'react';
import { useAutoSaveStore, type SaveType } from '../stores/autoSaveStore';

interface UseAutoSaveOptions {
  type: SaveType;
  onSave: (data: any) => Promise<void>;
  debounceDelay?: number;
}

export function useAutoSave({ type, onSave, debounceDelay }: UseAutoSaveOptions) {
  const { 
    queueSave, 
    getSaveStatus, 
    updateDebounceDelay 
  } = useAutoSaveStore();
  
  const saveStatus = getSaveStatus(type);
  
  // Update debounce delay if provided
  useEffect(() => {
    if (debounceDelay !== undefined) {
      updateDebounceDelay(debounceDelay);
    }
  }, [debounceDelay, updateDebounceDelay]);
  
  // Clear pending saves when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if no other tabs are using the store
      // This is handled by the store itself
    };
  }, []);
  
  // Memoized save function
  const save = useCallback((data: any) => {
    console.log(`[useAutoSave] Queueing save for ${type}:`, data);
    queueSave(type, data, onSave);
  }, [type, onSave, queueSave]);
  
  return {
    save,
    saveStatus,
    isIdle: saveStatus === 'idle',
    isPending: saveStatus === 'pending',
    isSaving: saveStatus === 'saving',
    isSaved: saveStatus === 'saved',
    isError: saveStatus === 'error'
  };
}