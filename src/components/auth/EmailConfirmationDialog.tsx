import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

export const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  isOpen,
  email,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Mail className="w-10 h-10 text-purple-600" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  ¡Casi listo! 🎉
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-gray-600 mb-6"
                >
                  Te hemos enviado un correo de confirmación a:
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 rounded-xl p-3 mb-6"
                >
                  <p className="font-medium text-gray-900 break-all">{email}</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-4 mb-6"
                >
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revisa tu bandeja de entrada</p>
                      <p className="text-xs text-gray-500">El correo puede tardar unos minutos en llegar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Haz clic en el enlace de confirmación</p>
                      <p className="text-xs text-gray-500">Esto verificará tu cuenta y la activará</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Comienza a crear ruletas increíbles</p>
                      <p className="text-xs text-gray-500">Una vez confirmado, podrás acceder a todas las funciones</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <p className="font-bold text-purple-900">¿Por qué Spin the Wheel?</p>
                  </div>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>✨ Aumenta las conversiones hasta un 30%</li>
                    <li>🎯 Captura emails de manera divertida</li>
                    <li>🎮 Gamifica la experiencia de compra</li>
                    <li>📊 Analytics detallados en tiempo real</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="text-xs text-gray-500 mb-6"
                >
                  <p className="mb-2">
                    <strong>¿No encuentras el correo?</strong>
                  </p>
                  <p>
                    Revisa tu carpeta de spam o correo no deseado.
                    Si aún no lo recibes, contacta con soporte.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Entendido
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};