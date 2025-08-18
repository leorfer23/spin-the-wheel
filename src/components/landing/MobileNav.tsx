import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <img 
            src="/rooleta_wordmark_transparent.png" 
            alt="Rooleta" 
            className="h-8 object-contain"
          />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/signup');
                }}
              >
                Empieza Gratis
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Iniciar Sesión
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};