import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EmailCaptureProps {
  onSubmit: (email: string, marketingConsent: boolean) => void;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  privacyText?: string;
  backgroundColor?: string;
  primaryColor?: string;
  format?: 'instant' | 'minimal' | 'social';
  emailPlaceholder?: string;
  titleColor?: string;
  playerCount?: string;
  popularPrize?: string;
  autoFocus?: boolean;
  showConsent?: boolean;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({
  onSubmit,
  imageUrl = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
  title = '¡Gira y Gana Premios Increíbles!',
  subtitle = 'Ingresa tu email para tener la oportunidad de ganar descuentos y recompensas exclusivas',
  buttonText = '¡Empezar a Girar!',
  privacyText = 'Al jugar, aceptas recibir emails de marketing. Puedes darte de baja en cualquier momento.',
  backgroundColor = '#FFFFFF',
  primaryColor = '#4F46E5',
  format = 'instant',
  emailPlaceholder = 'Ingresa tu email',
  titleColor = '#111827',
  playerCount = '2,847 personas jugaron hoy',
  popularPrize = '¡25% de descuento en todo!',
  autoFocus = true,
  showConsent = true
}) => {
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    if (!marketingConsent && format !== 'instant') {
      setError('Please agree to the terms to continue');
      return;
    }
    
    onSubmit(email, marketingConsent);
  };

  // Format 1: Instant Play - Minimalistic design
  if (format === 'instant') {
    return (
      <motion.div 
        className="max-w-md mx-auto p-6"
        style={{ backgroundColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {title && (
          <h2 className="text-xl font-medium mb-4 text-center" style={{ color: titleColor }}>
            {title}
          </h2>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder={emailPlaceholder || "tu@email.com"}
              className="w-full px-5 py-3.5 text-base rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all pr-14 text-center"
              style={{ 
                borderColor: error ? '#EF4444' : undefined,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              autoFocus={autoFocus}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <motion.button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>
          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}
          {privacyText && showConsent !== false && (
            <p className="text-xs text-gray-400 text-center">
              {privacyText}
            </p>
          )}
        </form>
      </motion.div>
    );
  }

  // Format 2: Minimal Focus - Clean, distraction-free
  if (format === 'minimal') {
    return (
      <motion.div 
        className="max-w-sm mx-auto p-10 rounded-xl bg-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: titleColor }}>
          {title || 'Win Big Prizes 🎁'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder={emailPlaceholder || "Ingresa tu email"}
              className="w-full px-4 py-3 text-center text-lg rounded-lg bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              style={{ 
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              autoFocus={autoFocus}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>
          
          <motion.button
            type="submit"
            className="w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-md"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {buttonText || "Let's Play! →"}
          </motion.button>
          
          {showConsent !== false && (
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => {
                  setMarketingConsent(e.target.checked);
                  if (e.target.checked && error === 'Please agree to the terms to continue') {
                    setError('');
                  }
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-xs text-gray-600">
                {privacyText || 'I agree to receive offers'}
              </span>
            </label>
          )}
        </form>
      </motion.div>
    );
  }

  // Format 3: Social Proof - Shows urgency and popularity
  if (format === 'social') {
    return (
      <motion.div 
        className="max-w-lg mx-auto p-6 rounded-2xl shadow-xl"
        style={{ backgroundColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 px-4 rounded-full text-sm font-bold mb-4 animate-pulse">
          ⏱️ Limited Time! {playerCount}
        </div>
        
        {imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden relative">
            <img 
              src={imageUrl} 
              alt="Vista previa del premio" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
              <div className="text-white">
                <p className="text-xs mb-1">🔥 Most Popular Prize:</p>
                <p className="font-bold">{popularPrize}</p>
              </div>
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: titleColor }}>
          {title || 'Join 10,000+ Winners!'}
        </h2>
        
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-xl">★</span>
          ))}
          <span className="text-sm text-gray-600 ml-2">(4.9/5 from 2,384 reviews)</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={emailPlaceholder || "Enter email to claim your prize"}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                style={{ 
                  borderColor: error ? '#EF4444' : undefined,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-3 rounded-lg">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => {
                setMarketingConsent(e.target.checked);
                if (e.target.checked && error === 'Please agree to the terms to continue') {
                  setError('');
                }
              }}
              className="mt-1 w-4 h-4 rounded"
              style={{ accentColor: primaryColor }}
            />
            <span className="text-sm text-gray-600">
              {privacyText || 'Yes! Send me exclusive deals (you can unsubscribe anytime)'}
            </span>
          </label>
          
          <motion.button
            type="submit"
            className="w-full py-4 px-6 rounded-lg font-bold text-white shadow-lg text-lg relative overflow-hidden"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">{buttonText || 'Spin & Win Now!'}</span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>
          
          <p className="text-xs text-gray-500 text-center">
            🔒 Your email is safe with us. No spam, ever!
          </p>
        </form>
      </motion.div>
    );
  }

  // Default format (original)
  return (
    <motion.div 
      className="max-w-lg mx-auto p-6 rounded-lg shadow-xl"
      style={{ backgroundColor }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Vista previa del premio" 
            className="w-full h-64 object-cover"
          />
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </h2>
      
      <p className="text-gray-600 text-center mb-6">
        {subtitle}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder={emailPlaceholder || "Ingresa tu email"}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
            style={{ 
              borderColor: error ? '#EF4444' : undefined,
              '--tw-ring-color': primaryColor
            } as React.CSSProperties}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => {
              setMarketingConsent(e.target.checked);
              if (e.target.checked && error === 'Please agree to the terms to continue') {
                setError('');
              }
            }}
            className="mt-1 w-4 h-4 rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm text-gray-600">
            {privacyText}
          </span>
        </label>
        
        <motion.button
          type="submit"
          className="w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
        </motion.button>
      </form>
    </motion.div>
  );
};