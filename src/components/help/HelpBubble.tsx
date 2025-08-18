import React, { useState, useRef, useEffect } from 'react';
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
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'auto'>(position);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && position === 'auto' && tooltipRef.current && bubbleRef.current) {
      const bubble = bubbleRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

      if (bubble.top > tooltip.height + 20) {
        bestPosition = 'top';
      } else if (viewport.height - bubble.bottom > tooltip.height + 20) {
        bestPosition = 'bottom';
      } else if (bubble.left > tooltip.width + 20) {
        bestPosition = 'left';
      } else if (viewport.width - bubble.right > tooltip.width + 20) {
        bestPosition = 'right';
      }

      setActualPosition(bestPosition);
    } else if (position !== 'auto') {
      setActualPosition(position);
    }
  }, [isOpen, position]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && id) {
      localStorage.setItem(`help_bubble_seen_${id}`, 'true');
    }
  };

  const getTooltipStyles = () => {
    const positions = {
      top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2',
      auto: 'top-full mt-2 left-1/2 -translate-x-1/2', // default to bottom for auto
    };
    return positions[actualPosition] || positions.bottom;
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200',
              getTooltipStyles()
            )}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => showOnHover && setIsOpen(false)}
          >
            <div className="relative">
              <div className="absolute -inset-px bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-sm" />
              
              <div className="relative bg-white rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{content.title}</h3>
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

                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {content.description}
                </p>

                {content.tips && content.tips.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Consejos:
                    </p>
                    <ul className="space-y-1">
                      {content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <ChevronRight className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.examples && content.examples.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
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
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Importante:</strong> {content.warning}
                    </p>
                  </div>
                )}

                {(content.learnMoreUrl || content.videoUrl) && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {content.learnMoreUrl && (
                      <a
                        href={content.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Aprender más</span>
                      </a>
                    )}
                    {content.videoUrl && (
                      <a
                        href={content.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span>Ver video</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};