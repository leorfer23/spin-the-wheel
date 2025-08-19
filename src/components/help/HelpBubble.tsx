import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HelpCircle, X, ChevronRight, Lightbulb, BookOpen, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface HelpContent {
  title: string;
  description: string;
  tips?: string[];
  learnMoreUrl?: string;
  videoUrl?: string;
  examples?: string[];
  warning?: string;
}

interface HelpBubbleProps {
  content: HelpContent;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerClassName?: string;
  showOnHover?: boolean;
  defaultOpen?: boolean;
  id?: string;
}

export const HelpBubble: React.FC<HelpBubbleProps> = ({
  content,
  position = 'auto',
  size = 'sm',
  className,
  triggerClassName,
  showOnHover = true,
  defaultOpen = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    position === 'auto' ? 'bottom' : position
  );
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bubbleRef.current) {
      const calculatePosition = () => {
        const bubble = bubbleRef.current!.getBoundingClientRect();
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        // Tooltip width - adjust for smaller screens
        const tooltipWidth = Math.min(320, viewport.width - 20); // Max 320px or viewport - padding
        const tooltipHeight = 400; // Approximate max height

        let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
        let x = 0;
        let y = 0;

        // For small screens, prefer right position if there's space
        const isSmallScreen = viewport.width < 640;
        
        if (position === 'auto') {
          // Check right first for small screens
          if (isSmallScreen && bubble.right + tooltipWidth + 10 < viewport.width) {
            bestPosition = 'right';
          } else if (bubble.top > tooltipHeight + 10) {
            bestPosition = 'top';
          } else if (viewport.height - bubble.bottom > tooltipHeight + 10) {
            bestPosition = 'bottom';
          } else if (bubble.left > tooltipWidth + 10) {
            bestPosition = 'left';
          } else {
            bestPosition = 'right';
          }
        } else {
          bestPosition = position;
        }

        // Calculate exact position based on best position
        switch (bestPosition) {
          case 'top':
            x = Math.min(
              Math.max(10, bubble.left + bubble.width / 2 - tooltipWidth / 2),
              viewport.width - tooltipWidth - 10
            );
            y = bubble.top - 10; // Position will be adjusted by height later
            break;
          case 'bottom':
            x = Math.min(
              Math.max(10, bubble.left + bubble.width / 2 - tooltipWidth / 2),
              viewport.width - tooltipWidth - 10
            );
            y = bubble.bottom + 10;
            break;
          case 'left':
            x = Math.max(10, bubble.left - tooltipWidth - 10);
            y = Math.min(
              Math.max(10, bubble.top + bubble.height / 2 - tooltipHeight / 2),
              viewport.height - tooltipHeight - 10
            );
            break;
          case 'right':
            x = Math.min(bubble.right + 10, viewport.width - tooltipWidth - 10);
            y = Math.min(
              Math.max(10, bubble.top + bubble.height / 2 - tooltipHeight / 2),
              viewport.height - tooltipHeight - 10
            );
            break;
        }

        setActualPosition(bestPosition);
        setTooltipPosition({ x, y });
      };

      calculatePosition();
      
      // Recalculate on scroll or resize
      const handleRecalculate = () => {
        if (isOpen) {
          calculatePosition();
        }
      };
      
      window.addEventListener('scroll', handleRecalculate, true);
      window.addEventListener('resize', handleRecalculate);
      
      return () => {
        window.removeEventListener('scroll', handleRecalculate, true);
        window.removeEventListener('resize', handleRecalculate);
      };
    }
  }, [isOpen, position]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && id) {
      localStorage.setItem(`help_bubble_seen_${id}`, 'true');
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const hasSeenBefore = id ? localStorage.getItem(`help_bubble_seen_${id}`) === 'true' : false;

  return (
    <div className={cn('relative inline-flex items-center', className)} ref={bubbleRef}>
      <button
        onClick={handleToggle}
        onMouseEnter={() => showOnHover && !isOpen && setIsOpen(true)}
        onMouseLeave={() => showOnHover && isOpen && setIsOpen(false)}
        className={cn(
          'text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100',
          !hasSeenBefore && 'animate-pulse text-purple-500 hover:text-purple-600',
          triggerClassName
        )}
        aria-label="Ayuda"
      >
        <HelpCircle className={sizeClasses[size]} />
        {!hasSeenBefore && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
        )}
      </button>

      {isOpen && tooltipPosition && ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200"
            style={{
              left: `${tooltipPosition.x}px`,
              top: actualPosition === 'top' 
                ? 'auto'
                : `${tooltipPosition.y}px`,
              bottom: actualPosition === 'top'
                ? `${window.innerHeight - tooltipPosition.y}px`
                : 'auto',
              width: `min(320px, calc(100vw - 20px))`,
              maxHeight: `min(400px, calc(100vh - ${tooltipPosition.y + 20}px))`,
              overflowY: 'auto'
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => showOnHover && setIsOpen(false)}
          >
            <div className="relative">
              <div className="absolute -inset-px bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-sm" />
              
              <div className="relative bg-white rounded-2xl p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 sm:p-1.5 bg-purple-100 rounded-lg">
                      <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{content.title}</h3>
                  </div>
                  {!showOnHover && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2 sm:mb-3">
                  {content.description}
                </p>

                {content.tips && content.tips.length > 0 && (
                  <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Consejos:
                    </p>
                    <ul className="space-y-1">
                      {content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                          <ChevronRight className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.examples && content.examples.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">
                      Ejemplos:
                    </p>
                    <div className="space-y-1">
                      {content.examples.map((example, index) => (
                        <code
                          key={index}
                          className="block text-xs bg-white px-2 py-1 rounded border border-gray-200"
                        >
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {content.warning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                    <p className="text-xs sm:text-sm text-amber-800">
                      <strong>⚠️ Importante:</strong> {content.warning}
                    </p>
                  </div>
                )}

                {(content.learnMoreUrl || content.videoUrl) && (
                  <div className="flex gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                    {content.learnMoreUrl && (
                      <a
                        href={content.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Aprender más</span>
                      </a>
                    )}
                    {content.videoUrl && (
                      <a
                        href={content.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ver video</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};