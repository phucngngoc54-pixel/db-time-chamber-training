import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, User, LogOut, Maximize, Play, Pause, AlertTriangle, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LoginModal } from './LoginModal';
import { SettingsModal } from './SettingsModal';

interface Props {
  onEnter: () => void;
  onResume: () => void;
}

export function LobbyScreen({ onEnter, onResume }: Props) {
  const [logoError, setLogoError] = useState(false);
  const { user, logout, t, chamberBackgroundUrl, isSessionActive, setIsSessionActive, timeLeft, isRunning, setIsRunning, timerMode, selectedCharacter, focusTime, breakTime, setTimeLeft, setTasks } = useAppContext();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReentryPopup, setShowReentryPopup] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  };

  const handleEnterClick = () => {
    if (isSessionActive) {
      setShowReentryPopup(true);
    } else {
      onEnter();
    }
  };

  const startNewSession = () => {
    setIsSessionActive(false);
    setIsRunning(false);
    setTimeLeft(focusTime * 60);
    setTasks([]);
    setShowReentryPopup(false);
    onEnter();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <motion.div
        key="lobby"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full overflow-hidden bg-gray-900 flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 w-full h-full z-0 opacity-100"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/u/0/d/1amQkq0RCTvp6oLwHtuP1E2N1GpWczr5S')",
            backgroundSize: 'contain',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated'
          }}
        />

        {/* UI-Inner-Wrapper with 90% Scale Fix */}
        <div 
          className="UI-Inner-Wrapper relative z-10 w-full h-full flex flex-col items-center justify-center p-10 origin-center scale-[0.9] pointer-events-none"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Dynamic Island for Global Timer */}
          <AnimatePresence>
            {isSessionActive && selectedCharacter && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 20, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border-2 border-white flex items-center justify-between p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 w-full max-w-[340px] pointer-events-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#FFCC00] overflow-hidden relative bg-white/10 flex-shrink-0 p-0">
                    <img src={selectedCharacter.image} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top [image-rendering:pixelated]" alt="avatar" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className={`text-[7px] font-pixel uppercase tracking-wider drop-shadow-md ${timerMode === 'focus' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {timerMode === 'focus' ? t('island_focus' as any) || 'Training session' : t('island_break' as any) || 'BREAK'}
                    </span>
                    <span className="text-[10px] font-pixel text-white leading-none tabular-nums mt-1 drop-shadow-md">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`w-7 h-7 flex items-center justify-center border-2 border-white text-white transition-colors ${isRunning ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'}`}
                  >
                    {isRunning ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button 
                    onClick={onResume}
                    className="text-[7px] border-2 border-white font-pixel text-white bg-blue-600 hover:bg-blue-500 px-2 py-1.5 uppercase tracking-widest transition-colors"
                  >
                    {t('island_return' as any) || 'RETURN'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-0 right-0 z-30 flex items-center gap-3 pointer-events-auto">
            {user ? (
              <div className="flex items-center gap-3 bg-black/80 px-3 py-1.5 pixel-panel">
                {selectedCharacter ? (
                  <div className="w-8 h-8 border-2 border-white overflow-hidden relative bg-white/10 flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedCharacter.color} opacity-30`} />
                    <img src={selectedCharacter.image} className="w-full h-full object-cover [image-rendering:pixelated]" alt="avatar" />
                  </div>
                ) : user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 object-cover border-2 border-white" />
                ) : (
                  <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white border-2 border-white font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-white font-bold text-[10px] hidden md:block uppercase tracking-wider">{user.name}</span>
                <button 
                  onClick={logout}
                  title={t('logout')}
                  className="text-red-400 hover:text-red-300 transition-colors ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="w-10 h-10 pixel-panel flex items-center justify-center text-white hover:bg-gray-700 hover:scale-105 transition-all"
              >
                <User size={18} />
              </button>
            )}

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 pixel-panel flex items-center justify-center text-white hover:bg-gray-700 hover:scale-105 transition-all"
            >
              <Settings size={18} />
            </button>
          </div>

          {!isFullscreen && (
            <button 
              onClick={toggleFullscreen}
              className="absolute bottom-0 right-0 z-30 w-10 h-10 pixel-panel flex items-center justify-center text-white hover:bg-gray-700 hover:scale-105 transition-all pointer-events-auto"
              title="Fullscreen"
            >
              <Maximize size={20} />
            </button>
          )}

          <div className="relative z-10 flex flex-col items-center w-full h-full pb-12 pointer-events-none">
            {/* New Start Training Button Genshin Pixel Style */}
            <div className="absolute bottom-[5%] md:bottom-[8%] flex flex-col items-center w-full px-4 pointer-events-auto">
               <button
                 onClick={handleEnterClick}
                 className="w-full max-w-[240px] md:max-w-sm flex items-center justify-center gap-3 md:gap-4 px-4 md:px-6 py-2.5 md:py-3.5 bg-black/60 backdrop-blur-md border-2 border-white hover:bg-black/80 transition-all cursor-pointer group hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
               >
                 <Check size={18} className="text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] flex-shrink-0" strokeWidth={3} />
                 <span className="font-pixel text-[9px] md:text-xs tracking-widest uppercase text-white animate-pulse drop-shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center justify-center pt-1" style={{ animationDuration: '2s' }}>
                   START TRAINING
                 </span>
               </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Re-entry Popup Modal */}
      <AnimatePresence>
        {showReentryPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border-4 border-orange-500 p-8 shadow-[0_0_40px_rgba(249,115,22,0.4)] max-w-md w-full text-center pixel-panel"
            >
              <AlertTriangle size={48} className="text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              <h3 className="text-[10px] md:text-xs font-pixel leading-relaxed text-white mb-8">
                {t('active_session_prompt' as any) || 'You have an active training session. Do you want to resume or start a new one?'}
              </h3>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowReentryPopup(false);
                    onResume();
                  }}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-pixel text-xs uppercase tracking-wider transition-colors shadow-lg border-2 border-white"
                >
                  {t('resume_session' as any) || 'Resume Session'}
                </button>
                <button 
                  onClick={startNewSession}
                  className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-pixel text-xs uppercase tracking-wider transition-colors border-2 border-white"
                >
                  {t('start_new_session' as any) || 'Start New Session'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
