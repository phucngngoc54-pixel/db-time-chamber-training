import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Globe, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { processDriveUrl } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const { 
    language, setLanguage, 
    lobbyBackgroundUrl, setLobbyBackgroundUrl, 
    chamberBackgroundUrl, setChamberBackgroundUrl, 
    lobbyBgHistory, setLobbyBgHistory,
    chamberBgHistory, setChamberBgHistory,
    t 
  } = useAppContext();
  
  const [customLobbyBg, setCustomLobbyBg] = useState('');
  const [customChamberBg, setCustomChamberBg] = useState('');

  const handleSaveCustomLobby = () => {
    if (customLobbyBg && customLobbyBg.trim() !== '') {
      const url = processDriveUrl(customLobbyBg.trim());
      setLobbyBackgroundUrl(url);
      if (!lobbyBgHistory.includes(url)) {
        setLobbyBgHistory([url, ...lobbyBgHistory]);
      }
      setCustomLobbyBg('');
    }
  };

  const handleSaveCustomChamber = () => {
    if (customChamberBg && customChamberBg.trim() !== '') {
      const url = processDriveUrl(customChamberBg.trim());
      setChamberBackgroundUrl(url);
      if (!chamberBgHistory.includes(url)) {
        setChamberBgHistory([url, ...chamberBgHistory]);
      }
      setCustomChamberBg('');
    }
  };

  const removeLobbyBg = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const newHistory = lobbyBgHistory.filter(bg => bg !== url);
    const DEFAULT_BGS = [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920',
      'https://storage.googleapis.com/aistudio-user-content-prod/12474932087453489816/1744820880315934-image.png',
      'https://images.unsplash.com/photo-1549298240-0d8e60513026?q=80&w=1920',
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920'
    ];
    setLobbyBgHistory(newHistory.length > 0 ? newHistory : DEFAULT_BGS);
  };

  const removeChamberBg = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const newHistory = chamberBgHistory.filter(bg => bg !== url);
    const DEFAULT_BGS = [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920',
      'https://storage.googleapis.com/aistudio-user-content-prod/12474932087453489816/1744820880315934-image.png',
      'https://images.unsplash.com/photo-1549298240-0d8e60513026?q=80&w=1920',
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920'
    ];
    setChamberBgHistory(newHistory.length > 0 ? newHistory : DEFAULT_BGS);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='70' fill='%23333'%3E%3Crect width='120' height='70'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff' font-family='sans-serif' font-size='12'%3EẢnh lỗi%3C/text%3E%3C/svg%3E";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-black/90 pixel-panel border-4 border-white p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 pixel-btn-secondary flex items-center justify-center text-white z-[60]"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl md:text-2xl font-pixel text-white text-center mb-8 uppercase tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,1)] text-[#FF8C00]">
              {t('settings')}
            </h2>

            <div className="space-y-8">
              {/* Language Toggle */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-pixel text-[10px] md:text-xs uppercase tracking-widest">
                  <Globe size={16} className="text-blue-400" />
                  <span>{t('language')}</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-3 px-2 font-pixel text-[8px] md:text-[10px] transition-all flex items-center justify-center uppercase tracking-widest ${language === 'en' ? 'pixel-btn shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-black border-2 border-white/50 text-white/60 hover:border-white hover:text-white'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLanguage('vi')}
                    className={`flex-1 py-3 px-2 font-pixel text-[8px] md:text-[10px] transition-all flex items-center justify-center uppercase tracking-widest ${language === 'vi' ? 'pixel-btn shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-black border-2 border-white/50 text-white/60 hover:border-white hover:text-white'}`}
                  >
                    Tiếng Việt
                  </button>
                </div>
              </div>

              {/* Lobby Background Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-start gap-2 text-white font-pixel text-[10px] md:text-xs uppercase tracking-widest">
                  <ImageIcon size={16} className="text-orange-400" />
                  <span>{t('lobby')} {t('background')}</span>
                </div>
                
                <div className="flex flex-nowrap overflow-x-auto justify-start items-center gap-4 p-4 bg-black/40 border-2 border-white/30 min-h-[140px] custom-scrollbar w-full">
                  {lobbyBgHistory.map((url, idx) => (
                    <div key={idx} className="relative flex-[0_0_160px] h-[90px] group">
                      <button
                        onClick={() => setLobbyBackgroundUrl(url)}
                        className={`w-full h-full relative border-2 overflow-hidden ${lobbyBackgroundUrl === url ? 'border-[#FF8C00] shadow-[0_0_15px_#FF8C00] scale-105 z-10' : 'border-white/50 opacity-80 hover:opacity-100 hover:border-white'}`}
                      >
                        <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover block [image-rendering:pixelated]" onError={handleImageError} />
                        {lobbyBackgroundUrl === url && (
                          <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center pointer-events-none">
                            <span className="bg-orange-500 p-1 border-2 border-white"><Check className="text-white" size={12} strokeWidth={4} /></span>
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={(e) => removeLobbyBg(e, url)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 border-2 border-white shadow-md z-20 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X size={10} strokeWidth={4} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customLobbyBg}
                    onChange={(e) => setCustomLobbyBg(e.target.value)}
                    placeholder="Enter image or Google Drive URL..."
                    className="flex-1 bg-black text-white placeholder-white/30 px-3 py-2 border-2 border-white font-pixel text-[8px] md:text-[10px] outline-none"
                  />
                  <button
                    onClick={handleSaveCustomLobby}
                    className="pixel-btn px-4 py-2 text-[8px] md:text-[10px]"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
              
              {/* Chamber Background Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-start gap-2 text-white font-pixel text-[10px] md:text-xs uppercase tracking-widest">
                  <ImageIcon size={16} className="text-orange-400" />
                  <span>{t('time_chamber')} {t('background')}</span>
                </div>
                
                <div className="flex flex-nowrap overflow-x-auto justify-start items-center gap-4 p-4 bg-black/40 border-2 border-white/30 min-h-[140px] custom-scrollbar w-full">
                  {chamberBgHistory.map((url, idx) => (
                    <div key={idx} className="relative flex-[0_0_160px] h-[90px] group">
                      <button
                        onClick={() => setChamberBackgroundUrl(url)}
                        className={`w-full h-full relative border-2 overflow-hidden ${chamberBackgroundUrl === url ? 'border-[#FF8C00] shadow-[0_0_15px_#FF8C00] scale-105 z-10' : 'border-white/50 opacity-80 hover:opacity-100 hover:border-white'}`}
                      >
                        <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover block [image-rendering:pixelated]" onError={handleImageError} />
                        {chamberBackgroundUrl === url && (
                          <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center pointer-events-none">
                            <span className="bg-orange-500 p-1 border-2 border-white"><Check className="text-white" size={12} strokeWidth={4} /></span>
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={(e) => removeChamberBg(e, url)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 border-2 border-white shadow-md z-20 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X size={10} strokeWidth={4} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customChamberBg}
                    onChange={(e) => setCustomChamberBg(e.target.value)}
                    placeholder="Enter image or Google Drive URL..."
                    className="flex-1 bg-black text-white placeholder-white/30 px-3 py-2 border-2 border-white font-pixel text-[8px] md:text-[10px] outline-none"
                  />
                  <button
                    onClick={handleSaveCustomChamber}
                    className="pixel-btn px-4 py-2 text-[8px] md:text-[10px]"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
