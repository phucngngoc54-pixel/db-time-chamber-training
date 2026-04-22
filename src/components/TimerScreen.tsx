import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Trash2, Settings, BarChart2, Layers } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { ShenronModal } from './ShenronModal';
import { MiniMusicPlayer } from './MiniMusicPlayer';
import { TrainingDashboard } from './TrainingDashboard';
import { processDriveUrl } from '../lib/utils';
import { getVegetaForm, getNextVegetaForm, VEGETA_FORMS } from '../lib/vegeta-forms';
import { FormsGalleryModal } from './FormsGalleryModal';

function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = `${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}/${time.getFullYear()}`;
  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  return (
    <div className="text-[8px] md:text-[10px] text-[#FF9900] font-pixel mb-1 tracking-widest text-center" style={{ textShadow: '1px 1px 0 #000' }}>
      {dateStr} - {timeStr}
    </div>
  );
}

interface Props {
  onBackToLobby: () => void;
}

export const PanelDecor = () => (
  <>
    <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 border border-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] z-20"><div className="w-full h-0.5 bg-black mt-0.5 transform rotate-45 opacity-50"></div></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 border border-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] z-20"><div className="w-full h-0.5 bg-black mt-0.5 transform rotate-[135deg] opacity-50"></div></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 border border-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] z-20"><div className="w-full h-0.5 bg-black mt-0.5 transform rotate-[135deg] opacity-50"></div></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 border border-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] z-20"><div className="w-full h-0.5 bg-black mt-0.5 transform rotate-45 opacity-50"></div></div>
  </>
);

export function TimerScreen({ onBackToLobby }: Props) {
  const { 
    t, chamberBackgroundUrl, selectedCharacter, focusTime, breakTime, tasks, setTasks, 
    timeLeft, setTimeLeft, isRunning, setIsRunning, 
    timerMode, setTimerMode, dragonBalls, totalSecondsTrained, currentLevel, currentKi 
  } = useAppContext();
  
  const [newTaskText, setNewTaskText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // New state to hold pending mode switch
  const [pendingModeSwitch, setPendingModeSwitch] = useState<'focus' | 'break' | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // ── Vegeta Multi-Form System ──────────────────────────────────
  const isVegeta = selectedCharacter?.id === 'vegeta';
  const currentForm = isVegeta ? getVegetaForm(currentLevel) : null;
  const nextForm    = isVegeta ? getNextVegetaForm(currentLevel) : null;

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const handleModeRequest = (newMode: 'focus' | 'break') => {
    if (newMode === timerMode) return;
    
    // Only warn if the timer is actually running right now
    if (isRunning) {
      setPendingModeSwitch(newMode);
    } else {
      switchMode(newMode);
    }
  };

  const confirmSwitchMode = () => {
    if (pendingModeSwitch) {
      switchMode(pendingModeSwitch);
    }
    setPendingModeSwitch(null);
  };

  const cancelSwitchMode = () => {
    setPendingModeSwitch(null);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setTimerMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const skipBreak = () => {
    setTimerMode('focus');
    setTimeLeft(focusTime * 60);
    setIsRunning(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false, createdAt: Date.now() }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const totalTimeInSeconds = timerMode === 'focus' ? focusTime * 60 : breakTime * 60;
  const timeProgress = ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100;
  
  // Hardcore Logic Constants
  const requiredKi = 240 * Math.pow(2, currentLevel);
  const expProgress = Math.min((currentKi / requiredKi) * 100, 100);
  const ssjForm = isVegeta && currentForm ? currentForm.name : (currentLevel >= 1 ? `Level ${currentLevel}` : 'Base Form');

  // Stats Logic
  const statsTotalHours = String(Math.floor(totalSecondsTrained / 3600)).padStart(2, '0');
  const statsTotalMins = String(Math.floor((totalSecondsTrained % 3600) / 60)).padStart(2, '0');
  const statsTotalSecs = String(totalSecondsTrained % 60).padStart(2, '0');
  
  const toTransformMins = Math.max(0, requiredKi - currentKi);
  const totalCumulativeMins = Math.floor(totalSecondsTrained / 60);
  const toNextBallMins = dragonBalls >= 7 ? 0 : Math.max(0, 300 - (totalCumulativeMins % 300));

  if (!selectedCharacter) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full w-full flex items-center justify-center overflow-hidden bg-black"
    >
      <div 
        className="absolute inset-0 w-full h-full z-0 transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${chamberBackgroundUrl === '/background.jpg' ? 'https://i.postimg.cc/FYtmqcYq/background-jpg.webp' : chamberBackgroundUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* UI-Inner-Wrapper with 90% Scale Fix */}
      <div 
        className="UI-Inner-Wrapper relative z-10 w-screen h-screen flex flex-col items-center justify-center p-10 origin-center scale-[0.9] pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* MAIN SAFE ZONE CONTAINER */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {/* MAIN GRID LAYOUT allowing internal interactions */}
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-[3.8fr_6.2fr] gap-6 lg:gap-12 pt-14 md:pt-20 pb-6 md:pb-10 px-6 lg:px-12 pointer-events-auto">
            
            {/* LEFT COLUMN (Character) */}
            <div className="flex flex-col h-full w-full justify-start overflow-hidden pt-2 min-h-0">
              {/* Character Name */}
              <h2 className="text-[10px] md:text-xs font-pixel font-bold text-white text-center uppercase mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest shrink-0" style={{textShadow: '2px 2px 0 #000'}}>
                {isVegeta && currentForm ? `VEGETA — ${currentForm.name}` : `${selectedCharacter.name} - [${ssjForm}]`}
              </h2>

              {/* Task Input Area */}
              <div className="relative w-full bg-black/60 border-2 border-white p-3 pixel-panel mb-4 shadow-lg shrink-0 max-w-[90%] mx-auto">
                <PanelDecor />
                <label className="text-[7px] md:text-[9px] text-yellow-500 mb-2 block uppercase font-pixel tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)] relative z-10">Current Mission:</label>
                <form onSubmit={addTask} className="flex gap-2 mb-2 relative z-10">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Type your mission here..."
                    className="flex-1 bg-black text-white placeholder-white/30 px-2 py-1.5 border-2 border-white font-pixel text-[7px] md:text-[9px] outline-none shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                  />
                  <button type="submit" className="pixel-btn px-2.5 py-1.5 text-[7px] md:text-[9px] flex items-center justify-center"><Plus size={12} /></button>
                </form>
                {tasks.length > 0 && (
                  <div className="flex flex-col gap-1 max-h-[10vh] overflow-y-auto custom-scrollbar pr-1 relative z-10">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-[7px] font-pixel text-white bg-black/40 px-2 py-1 border border-white/50">
                         <button onClick={() => toggleTask(task.id)} className={`w-2.5 h-2.5 flex-shrink-0 border ${task.completed ? 'bg-yellow-400 border-yellow-400' : 'border-white'}`} />
                         <span className={`flex-1 truncate ${task.completed ? 'line-through text-white/50' : ''}`}>{task.text}</span>
                         <button onClick={() => deleteTask(task.id)} className="hover:text-red-500"><Trash2 size={8} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Optimized Character Sprite Display */}
              <div className="relative w-full flex-1 min-h-0 max-h-[38vh] flex items-end justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={isVegeta ? currentLevel : selectedCharacter.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    src={isVegeta && currentForm ? currentForm.modelSrc : 'https://lh3.googleusercontent.com/u/0/d/1fY2ya3ToVI4DOkp9wsKnfsnW0gYIFGyC'}
                    referrerPolicy="no-referrer"
                    alt={selectedCharacter.name}
                    className="w-full h-full max-h-full object-contain object-bottom mx-auto z-10 [image-rendering:pixelated]"
                  />
                </AnimatePresence>
                {/* Aura glow under feet */}
                {isVegeta && currentForm && currentLevel > 0 && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-10 blur-xl opacity-50 pointer-events-none z-0"
                    style={{ background: `radial-gradient(ellipse, ${currentForm.glowColor}, transparent 70%)` }}
                  />
                )}
              </div>

              {/* View all forms button */}
              {isVegeta && (
                <motion.button
                  onClick={() => setIsGalleryOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 mt-4 mx-auto px-4 py-2 border-2 border-white bg-black/80 hover:bg-white/10 transition-colors font-pixel text-[6px] md:text-[7px] text-white uppercase tracking-widest shrink-0 pointer-events-auto relative z-[60] cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                >
                  <Layers size={10} />
                  View all forms
                  <span className="text-yellow-400">({Math.min(currentLevel + 1, VEGETA_FORMS.length)}/{VEGETA_FORMS.length})</span>
                </motion.button>
              )}
            </div>

            {/* RIGHT COLUMN (HUD) */}
            <div className="flex flex-col h-full w-full justify-between overflow-hidden gap-6 lg:gap-8 py-2 min-h-0">
              
              {/* Title Area */}
              <div className="w-full shrink-0 max-w-[90%] mx-auto">
                <RealTimeClock />
                <h2 className="text-[9px] lg:text-[11px] font-pixel text-white px-2 py-1.5 bg-black/80 border-2 border-white pixel-panel uppercase text-center tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                  HYPERBOLIC TIME CHAMBER <span className="hidden md:inline">TRAINING</span>
                </h2>
              </div>

              {/* Time and Progress Area (Refined HUD) */}
              <div className="relative flex-1 flex flex-col justify-between items-center bg-black/50 p-3 border-2 border-white pixel-panel overflow-hidden min-h-0 gap-y-1 max-w-[45vw] mx-auto w-full">
                 <PanelDecor />
              {/* Focus/Break Toggle */}
              <div className="flex w-full max-w-[220px] gap-1 relative z-10 shrink-0">
                <button 
                  onClick={() => handleModeRequest('focus')}
                  className={`flex-1 py-1 border-2 border-white font-pixel text-[7px] uppercase transition cursor-pointer active:scale-95 z-50 ${timerMode === 'focus' ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-black/60 text-gray-400 hover:text-white'}`}
                >
                  {t('focus')}
                </button>
                <button 
                  onClick={() => handleModeRequest('break')}
                  className={`flex-1 py-1 border-2 border-white font-pixel text-[7px] uppercase transition cursor-pointer active:scale-95 z-50 ${timerMode === 'break' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-black/60 text-gray-400 hover:text-white'}`}
                >
                  {t('break')}
                </button>
              </div>

              {/* Reduced Timer Number */}
              <h1 className="relative z-10 text-[clamp(18px,4.5vw,44px)] md:text-[clamp(20px,5vw,52px)] font-pixel text-white leading-none tracking-tighter tabular-nums my-0.5 drop-shadow-[5px_5px_0_rgba(0,0,0,1)] shrink-0" style={{textShadow: '4px 4px 0 #000'}}>
                {formatTime(timeLeft)}
              </h1>

              {/* Smaller Progress Bars Container */}
              <div className="w-full flex flex-col gap-1 shrink-0 relative z-10 max-w-[380px]">
                
                {/* TIME Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-[6px] md:text-[7px] text-cyan-400 mb-0.5 font-pixel uppercase tracking-widest drop-shadow-md">
                    <span>TIME</span><span>{Math.floor(timeProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-black border-2 border-white p-0.5">
                    <div className="h-full bg-cyan-400 transition-all duration-1000 ease-linear shadow-[inset_0_0_5px_rgba(255,255,255,0.6)]" style={{ width: `${timeProgress}%` }} />
                  </div>
                </div>

                {/* KI Evolution Bar (Smaller) */}
                <div className="w-full flex items-center justify-between gap-1.5 mt-0.5">
                  
                  {/* Current Avatar */}
                  <div
                    className="shrink-0 w-[5vh] h-[5vh] min-w-[28px] min-h-[28px] max-w-[46px] max-h-[46px] border-2 border-white bg-black/80 p-0 relative overflow-hidden"
                    style={isVegeta && currentForm ? { boxShadow: `0 0 8px ${currentForm.glowColor}` } : {}}
                  >
                    <img
                      src={isVegeta && currentForm ? currentForm.avaSrc : selectedCharacter.image}
                      alt={selectedCharacter.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:pixelated]"
                    />
                  </div>

                  {/* KI Bar */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between text-[6px] md:text-[7px] text-yellow-400 mb-0.5 font-pixel uppercase tracking-widest drop-shadow-md">
                      <span>KI</span><span>{currentKi}/{requiredKi}</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-black border-2 border-white p-0.5">
                      <div
                        className={`h-full transition-all duration-500 shadow-[inset_0_0_5px_rgba(255,255,255,0.6)] ${currentKi >= requiredKi ? 'animate-pulse' : ''}`}
                        style={{
                          width: `${expProgress}%`,
                          background: isVegeta && currentForm ? currentForm.glowColor : '#eab308',
                        }}
                      />
                    </div>
                    {isVegeta && nextForm && (
                      <p className="font-pixel text-[5px] text-gray-400 uppercase tracking-wider mt-0.5 text-right">
                        → {nextForm.shortName}
                      </p>
                    )}
                    {isVegeta && !nextForm && (
                      <p className="font-pixel text-[5px] text-yellow-400 uppercase tracking-wider mt-0.5 text-right animate-pulse">
                        ★ MAX POWER
                      </p>
                    )}
                  </div>

                  {/* Next Avatar */}
                  <div
                    className="shrink-0 w-[5vh] h-[5vh] min-w-[28px] min-h-[28px] max-w-[46px] max-h-[46px] border-2 border-yellow-400 bg-black/80 relative overflow-hidden"
                    style={isVegeta && nextForm ? { boxShadow: `0 0 10px ${nextForm.glowColor}` } : { boxShadow: '0 0 8px rgba(255,204,0,0.4)' }}
                  >
                    {isVegeta && nextForm ? (
                      <img
                        src={nextForm.avaSrc}
                        alt={nextForm.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:pixelated] brightness-75 saturate-75"
                      />
                    ) : isVegeta && !nextForm ? (
                      // Max level — show current form with golden glow
                      <img
                        src={currentForm?.avaSrc}
                        alt="Max Form"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:pixelated]"
                      />
                    ) : (
                      <img
                        src={selectedCharacter.image}
                        alt="Next Form"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:pixelated] brightness-75"
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* Smaller Stats Dashboard */}
              <div className="w-full max-w-[380px] bg-black/80 border border-white/30 p-1.5 shrink-0 relative z-10 font-pixel text-white tracking-widest text-[6px] md:text-[7px] flex flex-col gap-1 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                 <div className="text-center text-cyan-400 drop-shadow-sm uppercase">
                   TOTAL TRAINING: {statsTotalHours}H {statsTotalMins}M {statsTotalSecs}S
                 </div>
                 <div className="grid grid-cols-2 gap-1.5 text-center text-[5px] md:text-[6px] text-gray-300">
                   <div className="bg-black/40 border border-white/20 p-1 uppercase truncate font-pixel">
                     To Transform: <span className="text-yellow-400">{toTransformMins}m</span>
                   </div>
                   <div className="bg-black/40 border border-white/20 p-1 uppercase truncate font-pixel">
                     To Next Ball: <span className="text-orange-400">{dragonBalls >= 7 ? 'MAX' : `${toNextBallMins}m`}</span>
                   </div>
                 </div>
              </div>

              {/* Smaller Buttons with reduced padding */}
              <div className="flex items-center gap-2 w-full justify-center shrink-0 mt-0.5 mb-0.5 relative z-[60]">
                <button 
                  onClick={toggleTimer} 
                  className={`flex items-center justify-center gap-1.5 px-4 py-1.5 font-pixel text-[7px] md:text-[9px] min-w-[120px] md:min-w-[160px] tracking-widest uppercase cursor-pointer border-2 transition-transform active:scale-95 z-[60] pointer-events-auto ${isRunning ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.8)] border-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_rgba(20,83,45,1)] border-white'}`}
                >
                  {isRunning ? <Pause fill="currentColor" size={12} /> : <Play fill="currentColor" size={12} />}
                  <span>{isRunning ? 'PAUSE' : (timeLeft < totalTimeInSeconds ? 'RESUME' : 'START PLAY')}</span>
                </button>
                
                {timerMode === 'break' && (
                  <button 
                    onClick={skipBreak}
                     className="hidden sm:flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 border-2 border-white px-2.5 py-2 md:py-2.5 text-[7px] md:text-[9px] text-white shadow-[0_4px_0_rgba(31,41,55,1)] cursor-pointer active:scale-95 z-[60] pointer-events-auto font-pixel"
                  >
                    SKIP
                  </button>
                )}

                <button 
                   onClick={resetTimer} 
                   className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 border-2 border-white px-2.5 py-2 md:py-2.5 text-[7px] md:text-[9px] text-white shadow-[0_4px_0_rgba(127,29,29,1)] cursor-pointer active:scale-95 z-[60] pointer-events-auto"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Dragon Ball Collection Area (Smaller) */}
            <div className="relative w-full shrink-0 flex flex-col border-2 border-white p-3 lg:p-4 pixel-panel items-center justify-center min-h-[80px] h-[12vh] max-h-[130px] overflow-hidden bg-black pointer-events-none max-w-[90%] mx-auto">
               
               {/* Shenron Background */}
               <div 
                 className="absolute inset-0 z-0 [image-rendering:pixelated] scale-110 md:scale-125 opacity-60"
                 style={{
                   backgroundImage: "url('https://lh3.googleusercontent.com/u/0/d/1pzmOgiL2HslmLWp4IdK8NEneNrP-spFW')",
                   backgroundSize: 'cover',
                   backgroundPosition: '20% center',
                   backgroundRepeat: 'no-repeat'
                 }}
               />
               
               {/* Dark Overlay gradient */}
               <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-black/30 to-black/70" />

               <PanelDecor />
               
               <div className="relative z-10 flex flex-col items-center w-full">
                 <span 
                   className="text-[#FFCC00] text-[9px] lg:text-[10px] font-pixel uppercase tracking-widest text-center mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]"
                   style={{ textShadow: '2px 2px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000' }}
                 >
                   Dragon balls collected ({dragonBalls}/7)
                 </span>
                 <p 
                   className="text-[7px] text-gray-200 font-pixel text-center mb-2 uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                   style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                 >
                   Collect 7 dragon balls to call Shenron
                 </p>
                 <div className="flex gap-1.5 justify-center flex-wrap">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`w-7 h-7 md:w-8 md:h-8 border-2 flex items-center justify-center ${i < dragonBalls ? 'bg-gradient-to-br from-orange-400 to-red-600 border-yellow-400 shadow-[0_0_10px_rgba(249,115,22,0.6)] scale-110 relative overflow-hidden' : 'bg-black/80 border-gray-600 opacity-50'}`}>
                      {i < dragonBalls && <><div className="absolute inset-0 bg-white/20 w-1/2" /><span className="text-[9px] md:text-[10px] text-red-900 font-bold z-10 block leading-none">★</span></>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-[90] pointer-events-auto">
          <button 
            onClick={onBackToLobby}
            className="flex items-center gap-2 text-white px-3 py-1.5 pixel-panel bg-black/60 hover:bg-gray-700 transition-all font-bold text-[10px] uppercase border-2 border-white"
          >
            <ArrowLeft size={12} />
            <span className="hidden md:inline">{t('lobby')}</span>
          </button>
        </div>

        <div className="absolute top-4 right-4 z-[90] pointer-events-auto">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 pixel-panel bg-black/60 flex items-center justify-center text-white hover:bg-gray-700 hover:scale-105 transition-all border-2 border-white cursor-pointer"
          >
            <Settings size={14} />
          </button>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <ShenronModal isOpen={dragonBalls >= 7} onClose={() => {}} />
        <TrainingDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
        {isVegeta && (
          <FormsGalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            currentLevel={currentLevel}
          />
        )}

        {/* Dashboard Toggle Button */}
        <div className="fixed bottom-4 left-4 z-[90] pointer-events-auto">
          <motion.button
            onClick={() => setIsDashboardOpen(true)}
            className="group flex items-center bg-black/80 border-2 border-[#FF9900] text-[#FF9900] p-3 shadow-[0_4px_0_#995c00] hover:translate-y-1 hover:shadow-none transition-all pixel-panel overflow-hidden"
            whileHover="hover"
            initial="initial"
          >
            <BarChart2 size={24} />
            <motion.span
              variants={{
                initial: { width: 0, opacity: 0, marginLeft: 0 },
                hover: { width: 'auto', opacity: 1, marginLeft: 12 }
              }}
              className="font-pixel text-[10px] whitespace-nowrap overflow-hidden tracking-widest"
            >
              VIEW DASHBOARD
            </motion.span>
          </motion.button>
        </div>

        <AnimatePresence>
          {pendingModeSwitch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-sm w-full text-center pixel-panel pointer-events-auto"
              >
                <h3 className="text-xs font-pixel text-white mb-4 leading-relaxed tracking-widest">
                  {t('confirm_switch' as any) || 'Bạn đang trong phiên tập luyện, bạn có chắc chắn muốn dừng lại để chuyển chế độ không?'}
                </h3>
                <p className="text-white/70 mb-8 text-[8px] font-pixel leading-relaxed">
                  {t('confirm_switch_desc' as any) || 'The current progress will be reset.'}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={cancelSwitchMode}
                    className="flex-1 py-3 pixel-btn-secondary text-[8px] sm:text-[10px] tracking-widest"
                  >
                    {t('cancel' as any) || 'Hủy'}
                  </button>
                  <button 
                    onClick={confirmSwitchMode}
                    className="flex-1 py-3 pixel-btn text-[8px] sm:text-[10px] tracking-widest shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                  >
                    {t('ok' as any) || 'Đồng ý'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MiniMusicPlayer />
      </div>
    </motion.div>
  );
}
