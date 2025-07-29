import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  Star, 
  Crown,
  Zap,
  Gift,
  Target,
  Sparkles
} from 'lucide-react';

interface Stage {
  level: number;
  name: string;
  requiredPoints: number;
  prizes: string[];
  isUnlocked: boolean;
  icon: React.ReactNode;
  color: string;
}

interface ProgressionWheelProps {
  currentPoints: number;
  currentStage: number;
  onSpinWheel: (stage: number) => void;
}

export const ProgressionWheel: React.FC<ProgressionWheelProps> = ({
  currentPoints,
  currentStage,
  onSpinWheel
}) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const stages: Stage[] = [
    {
      level: 1,
      name: "Bronze Wheel",
      requiredPoints: 0,
      prizes: ["5% Off", "10% Off", "Free Shipping"],
      isUnlocked: true,
      icon: <Gift className="w-6 h-6" />,
      color: "from-orange-400 to-orange-600"
    },
    {
      level: 2,
      name: "Silver Wheel",
      requiredPoints: 100,
      prizes: ["15% Off", "20% Off", "$10 Credit"],
      isUnlocked: currentPoints >= 100,
      icon: <Star className="w-6 h-6" />,
      color: "from-gray-400 to-gray-600"
    },
    {
      level: 3,
      name: "Gold Wheel",
      requiredPoints: 250,
      prizes: ["25% Off", "30% Off", "$25 Credit"],
      isUnlocked: currentPoints >= 250,
      icon: <Crown className="w-6 h-6" />,
      color: "from-yellow-400 to-yellow-600"
    },
    {
      level: 4,
      name: "Diamond Wheel",
      requiredPoints: 500,
      prizes: ["40% Off", "50% Off", "Free Product"],
      isUnlocked: currentPoints >= 500,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-blue-400 to-purple-600"
    }
  ];

  const nextStage = stages.find(s => !s.isUnlocked);
  const pointsToNext = nextStage ? nextStage.requiredPoints - currentPoints : 0;
  const progressPercentage = nextStage 
    ? ((currentPoints - (stages[nextStage.level - 2]?.requiredPoints || 0)) / 
       (nextStage.requiredPoints - (stages[nextStage.level - 2]?.requiredPoints || 0))) * 100
    : 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Progression Wheels
          </h2>
          <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">{currentPoints}</span>
            <span className="text-sm text-gray-600">points</span>
          </div>
        </div>

        {nextStage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress to {nextStage.name}</span>
              <span className="text-sm font-medium text-purple-600">
                {pointsToNext} points needed
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stages.map((stage) => (
          <motion.div
            key={stage.level}
            whileHover={stage.isUnlocked ? { scale: 1.02 } : {}}
            onHoverStart={() => setHoveredStage(stage.level)}
            onHoverEnd={() => setHoveredStage(null)}
            className={`relative ${!stage.isUnlocked ? 'opacity-60' : ''}`}
          >
            <div className={`
              relative overflow-hidden rounded-xl p-6 
              ${stage.isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
              bg-gradient-to-br ${stage.color}
              ${currentStage === stage.level ? 'ring-4 ring-white ring-opacity-60' : ''}
            `}
            onClick={() => stage.isUnlocked && onSpinWheel(stage.level)}
            >
              {!stage.isUnlocked && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 rounded-lg p-2">
                  {stage.icon}
                </div>
                {stage.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-white/80" />
                ) : (
                  <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-1 rounded-full">
                    {stage.requiredPoints} pts
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{stage.name}</h3>
              
              <AnimatePresence>
                {hoveredStage === stage.level && stage.isUnlocked && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-3"
                  >
                    <p className="text-xs text-white/80 mb-2">Top Prizes:</p>
                    <div className="space-y-1">
                      {stage.prizes.map((prize, idx) => (
                        <div key={idx} className="text-xs text-white flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {prize}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStage === stage.level && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg"
                >
                  <span className="text-xs font-bold text-purple-600">ACTIVE</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-white/60 rounded-xl p-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          How to Earn Points
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• Make a purchase (+50 pts)</div>
          <div>• Share on social (+10 pts)</div>
          <div>• Refer a friend (+25 pts)</div>
          <div>• Leave a review (+15 pts)</div>
        </div>
      </div>
    </div>
  );
};