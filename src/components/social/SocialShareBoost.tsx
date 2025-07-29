import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Facebook, 
  Twitter,
  Instagram,
  MessageCircle,
  Link,
  Users,
  TrendingUp,
  Zap,
  Gift,
  ChevronRight
} from 'lucide-react';

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bonus: string;
}

interface SocialShareBoostProps {
  prizeWon?: string;
  onShare: (platform: string) => void;
  referralCode?: string;
  shareStats?: {
    totalShares: number;
    totalReferrals: number;
    bonusSpinsEarned: number;
  };
}

export const SocialShareBoost: React.FC<SocialShareBoostProps> = ({
  prizeWon = "20% OFF",
  onShare,
  referralCode = "SPIN123",
  shareStats = { totalShares: 0, totalReferrals: 0, bonusSpinsEarned: 0 }
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms: SharePlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      bonus: '+2 Spins'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'from-sky-400 to-sky-500',
      bonus: '+2 Spins'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'from-pink-500 to-purple-600',
      bonus: '+3 Spins'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      bonus: '+1 Spin'
    }
  ];

  const handleShare = (platformId: string) => {
    setSelectedPlatform(platformId);
    onShare(platformId);
    setTimeout(() => setSelectedPlatform(null), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full mb-4"
        >
          <Gift className="w-5 h-5" />
          <span className="font-bold">You Won: {prizeWon}</span>
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Share & Earn More Spins! 🎉
        </h3>
        <p className="text-gray-600">
          Share your win and unlock bonus spins for even bigger prizes!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <motion.button
            key={platform.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare(platform.id)}
            className={`
              relative overflow-hidden rounded-xl p-4 text-white
              bg-gradient-to-br ${platform.color}
              ${selectedPlatform === platform.id ? 'ring-4 ring-white ring-opacity-60' : ''}
            `}
          >
            <AnimatePresence>
              {selectedPlatform === platform.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white/30 rounded-full"
                />
              )}
            </AnimatePresence>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {platform.icon}
                <span className="font-medium">{platform.name}</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {platform.bonus}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-white/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Referral Program
          </h4>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
            +5 Spins per Friend
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm">
            {referralCode}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyReferralCode}
            className="bg-purple-600 text-white p-3 rounded-lg"
          >
            <Link className="w-5 h-5" />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {copiedCode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-sm text-green-600 font-medium"
            >
              ✓ Code copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {shareStats.totalShares > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white"
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Social Impact
          </h4>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{shareStats.totalShares}</div>
              <div className="text-xs opacity-80">Shares</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{shareStats.totalReferrals}</div>
              <div className="text-xs opacity-80">Referrals</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {shareStats.bonusSpinsEarned}
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs opacity-80">Bonus Spins</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-2 px-4 flex items-center justify-center gap-2"
          >
            <span className="text-sm font-medium">View Leaderboard</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};