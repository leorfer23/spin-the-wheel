import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 sm:py-12 px-4 bg-white/50 backdrop-blur">
      <div className="max-w-7xl lg:max-w-[1400px] mx-auto text-center text-gray-600">
        <div className="mb-8">
          <img 
            src="/rooleta_wordmark_transparent.png" 
            alt="Rooleta" 
            className="h-8 w-auto mx-auto mb-6"
          />
        </div>
        <p className="text-sm mb-2">&copy; 2024 Rooleta. Todos los derechos reservados.</p>
        <p className="text-xs mb-4">Made with ❤️ in Argentina 🇦🇷</p>
      </div>
    </footer>
  );
};