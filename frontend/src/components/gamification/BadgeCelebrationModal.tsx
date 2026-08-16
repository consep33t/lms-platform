import React from 'react';

export interface BadgeData {
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
}

export interface BadgeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeData;
}

/**
 * Organism BadgeCelebrationModal Component
 * Modal dialog celebrating new badge unlock with pulse effects and XP rewards.
 */
export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({ isOpen, onClose, badge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-300">
        {/* Particle / Sparkle Accents */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-60 animate-ping"
              style={{
                backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'][i % 5],
                transform: `rotate(${i * 22.5}deg) translate(${80 + (i % 3) * 20}px)`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Badge Glow & Icon Container */}
        <div className="relative mb-6 mt-4">
          {/* Radial Pulse */}
          <div className="absolute inset-0 bg-amber-400 rounded-full opacity-40 blur-xl animate-pulse" />

          {/* Badge Icon */}
          <div className="relative z-10 w-28 h-28 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-300 dark:from-amber-900/60 dark:to-amber-700/60 rounded-full shadow-lg border-4 border-amber-400 text-5xl">
            {badge.icon}
          </div>
        </div>

        {/* Badge Title & Description */}
        <div className="flex flex-col items-center relative z-10">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{badge.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{badge.description}</p>

          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 rounded-full font-bold mb-6 text-sm">
            <span>+{badge.xpReward} XP Reward</span>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
          >
            Lanjutkan Belajar
          </button>
        </div>
      </div>
    </div>
  );
};
