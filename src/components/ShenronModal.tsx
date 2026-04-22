import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { REWARD_KEYS } from '../translations';
import { translations } from '../translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShenronModal({ isOpen, onClose }: Props) {
  const { t, setDragonBalls, showToast } = useAppContext();
  const [randomRewards, setRandomRewards] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Pick 3 random rewards
      const shuffled = [...REWARD_KEYS].sort(() => 0.5 - Math.random());
      setRandomRewards(shuffled.slice(0, 3));
    }
  }, [isOpen]);

  const handleChooseWish = (wishKey: string) => {
    showToast(t('wish_granted'), 'success');
    setDragonBalls(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          {/* Shenron image & effect */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 pointer-events-none">
             <div className="w-[800px] h-[800px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" />
             <img 
               src="https://pngimg.com/uploads/dragon_ball/dragon_ball_PNG58.png" 
               alt="Shenron" 
               className="absolute max-h-[80vh] object-contain drop-shadow-[0_0_50px_rgba(34,197,94,0.8)] filter brightness-110 contrast-125"
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
             />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="relative z-10 w-full max-w-lg bg-black/80 border-4 border-yellow-500 p-8 shadow-[0_0_50px_rgba(234,179,8,0.4)] flex flex-col items-center pixel-panel"
          >
            <div className="flex gap-2 mb-6">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-600 border-2 border-yellow-400 flex items-center justify-center">
                  <span className="text-[10px] text-red-900 font-bold">★</span>
                </div>
              ))}
            </div>

            <h2 className="text-sm md:text-base font-pixel text-green-400 text-center mb-8 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(74,222,128,0.8)] leading-relaxed">
              {t('shenron_greeting')}
            </h2>

            <p className="text-yellow-400 font-bold mb-4 tracking-widest">{t('choose_wish')}</p>

            <div className="w-full flex flex-col gap-4">
              {randomRewards.map((key, index) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChooseWish(key)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-500/40 hover:to-orange-500/40 border border-yellow-500/50 rounded-xl text-yellow-100 font-bold text-lg text-left shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all flex items-center gap-4"
                >
                  <span className="text-yellow-400 font-black text-2xl">{index + 1}.</span>
                  {t(key as Extract<keyof typeof translations['en'], string>)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
