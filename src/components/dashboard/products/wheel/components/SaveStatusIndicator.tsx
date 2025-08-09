import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            status === 'saving' ? 'bg-blue-100 text-blue-700' :
            status === 'saved' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}
        >
          {status === 'pending' && (
            <>
              <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse" />
              Sin guardar
            </>
          )}
          {status === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Guardando
            </>
          )}
          {status === 'saved' && (
            <>
              <Check className="w-3 h-3" />
              Guardado
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-3 h-3" />
              Error
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};