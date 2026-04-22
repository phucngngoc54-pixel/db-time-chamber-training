import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Character } from '../types';
import { CHARACTERS } from '../constants';
import { useAppContext } from '../context/AppContext';

interface Props {
  onBack: () => void;
  onStart: () => void;
}

export function CharacterSelectScreen({
  onBack,
  onStart
}: Props) {
  const { t, selectedCharacter, setSelectedCharacter, focusTime, setFocusTime, breakTime, setBreakTime, setIsSessionActive, chamberBackgroundUrl } = useAppContext();
  const [flash, setFlash] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handleStart = () => {
    setIsSessionActive(true);
    onStart();
  };

  const selectCharacterPlay = (char: Character) => {
    setSelectedCharacter(char);
    setFlash(true);
    
    // Play a short generic beep sound if available natively, else just flash
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    setTimeout(() => setFlash(false), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full bg-gray-900 text-[#1F2937] flex flex-col overflow-hidden"
    >
      {/* Selection Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-yellow-400 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* Background */}
      <img 
        src={chamberBackgroundUrl === '/background.jpg' ? 'https://i.postimg.cc/FYtmqcYq/background-jpg.webp' : chamberBackgroundUrl} 
        alt="Chamber Background" 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none" 
      />

      {/* UI-Inner-Wrapper with 90% Scale Fix */}
      <div 
        className="UI-Inner-Wrapper relative z-10 w-full h-full flex flex-col items-center justify-center p-10 origin-center scale-[0.9] pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      >
        <div className="relative z-10 flex flex-col h-full w-full pointer-events-auto">
        {/* Header */}
        <div className="relative z-30 h-[60px] px-[30px] flex items-center justify-between bg-black/60 border-b border-white/50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white px-4 py-2 pixel-panel hover:bg-gray-700 hover:shadow-md transition-all font-bold text-xs uppercase"
        >
          <ArrowLeft size={16} /> {t('lobby')}
        </button>
        <h1 className="text-xl md:text-2xl font-black tracking-[2px] text-white uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
          {t('select_fighter')}
        </h1>
        <div className="w-[100px]" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-6 z-10 overflow-y-auto w-full max-w-[95vw] mx-auto">
        
        {/* Character Grid */}
        <div className="grid grid-cols-4 gap-[12px] max-w-xl w-full">
          {CHARACTERS.map((char) => (
            <motion.button
              key={char.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectCharacterPlay(char)}
              className={`relative flex justify-center items-center bg-black/50 rounded-sm aspect-square overflow-hidden border-2 transition-all duration-300 group ${
                selectedCharacter?.id === char.id 
                  ? 'border-[#FFCC00] shadow-[0_0_20px_#FFCC00] z-20 scale-105 pixel-panel' 
                  : 'border-white/20 hover:border-[#FFCC00]/50 hover:shadow-[0_0_10px_#FFCC00]'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${char.color} opacity-20`} />
              <img 
                src={char.image} 
                alt={char.name} 
                referrerPolicy="no-referrer"
                className="max-w-[70%] max-h-[70%] object-contain [image-rendering:pixelated] z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1 text-center font-pixel text-[7px] sm:text-[8px] tracking-widest uppercase text-white z-20 border-t border-white/40 overflow-hidden text-ellipsis whitespace-nowrap px-1">
                {char.name}
              </div>
            </motion.button>
          ))}
        </div>
        
       {/* Settings Panel */}
        <motion.div 
          animate={{ y: isCustomOpen ? -30 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-[320px] flex flex-col items-center justify-center z-10 gap-2 shrink-0"
        >
          <div className="relative flex flex-col items-center h-[30vh] lg:h-[40vh] w-full justify-end shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/u/0/d/1fY2ya3ToVI4DOkp9wsKnfsnW0gYIFGyC" 
              alt={selectedCharacter?.name || 'Character Model'} 
              referrerPolicy="no-referrer"
              className="absolute bottom-0 w-[40vh] max-w-[140%] h-[40vh] max-h-[140%] object-contain object-bottom [image-rendering:pixelated] z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
            />
          </div>

          <div className="bg-[#111] border-2 border-[#FFCC00] text-yellow-400 px-5 py-1.5 text-[10px] md:text-xs font-pixel tracking-widest uppercase shadow-[0_4px_0_rgba(255,204,0,0.4)] whitespace-nowrap overflow-hidden text-ellipsis max-w-full relative z-20 mt-1">
            {selectedCharacter?.name || t('select_fighter')}
          </div>

          <div className="w-full flex justify-center text-center font-pixel text-[8px] md:text-[10px] text-white uppercase tracking-widest mt-3 px-2 py-1 bg-black/50 border border-white/50 w-max shrink-0">
            TRAINING MODE
          </div>

          <div className="w-full flex gap-3 justify-between shrink-0 mb-1 mt-1">
            <button 
              onClick={() => { setFocusTime(50); setBreakTime(10); handleStart(); }}
              className="flex-1 pixel-btn-secondary px-2 py-3 text-[9px] md:text-[11px] whitespace-nowrap leading-none transition-colors border-2 border-white hover:bg-orange-600 hover:text-white"
            >
              50:10
            </button>
            <button 
              onClick={() => { setFocusTime(25); setBreakTime(5); handleStart(); }}
              className="flex-1 pixel-btn-secondary px-2 py-3 text-[9px] md:text-[11px] whitespace-nowrap leading-none transition-colors border-2 border-white hover:bg-orange-600 hover:text-white"
            >
              25:5
            </button>
            <button 
              onClick={() => setIsCustomOpen(!isCustomOpen)}
               className={`flex-1 pixel-btn px-2 py-3 text-[9px] md:text-[11px] whitespace-nowrap leading-none transition-colors border-2 border-white ${isCustomOpen ? 'bg-orange-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : ''}`}
            >
              CUSTOM
            </button>
          </div>

          <AnimatePresence>
            {isCustomOpen && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="w-full bg-black/80 p-4 border-2 border-white overflow-hidden shrink-0"
               >
                 <div className="flex gap-4 w-full">
                    {/* Focus Time */}
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="font-bold tracking-wider text-[10px] uppercase text-orange-400">FOCUS</span>
                      <div className="flex items-center justify-between bg-black/50 p-1 border-2 border-white">
                        <button onClick={() => setFocusTime(Math.max(1, focusTime - 1))} className="p-1 hover:bg-white/20 transition-colors">
                          <Minus size={14} className="text-white" />
                        </button>
                        <input 
                          type="number" min="1" max="120"
                          value={focusTime || ''}
                          onChange={(e) => setFocusTime(parseInt(e.target.value) || 0)}
                          onBlur={() => setFocusTime(Math.max(1, Math.min(120, focusTime)))}
                          className="text-sm font-black w-10 text-center bg-transparent outline-none text-white transition-colors [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button onClick={() => setFocusTime(Math.min(120, focusTime + 1))} className="p-1 hover:bg-white/20 transition-colors">
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Break Time */}
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="font-bold tracking-wider text-[10px] uppercase text-blue-400">BREAK</span>
                      <div className="flex items-center justify-between bg-black/50 p-1 border-2 border-white">
                        <button onClick={() => setBreakTime(Math.max(1, breakTime - 1))} className="p-1 hover:bg-white/20 transition-colors">
                          <Minus size={14} className="text-white" />
                        </button>
                        <input 
                          type="number" min="1" max="30"
                          value={breakTime || ''}
                          onChange={(e) => setBreakTime(parseInt(e.target.value) || 0)}
                          onBlur={() => setBreakTime(Math.max(1, Math.min(30, breakTime)))}
                          className="text-sm font-black w-10 text-center bg-transparent outline-none text-white transition-colors [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button onClick={() => setBreakTime(Math.min(30, breakTime + 1))} className="p-1 hover:bg-white/20 transition-colors">
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                 </div>
                 
                 <button onClick={handleStart} className="w-full pixel-btn py-3 text-[10px] md:text-xs tracking-widest mt-4">
                   START TRAINING
                 </button>
               </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
      </div>
      </div>
    </motion.div>
  );
}
