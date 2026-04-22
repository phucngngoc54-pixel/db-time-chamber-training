import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Youtube, SkipForward, Maximize2, GripVertical, X, ListMusic, Save, PlaySquare, ArrowLeft, Minus } from 'lucide-react';
import YouTube from 'react-youtube';
import { useAppContext } from '../context/AppContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

class PlayerErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("YouTube Player Error Caught:", error, info);
  }
  render() {
    if (this.state.hasError) return <div className="text-red-500 font-pixel text-[10px]">Player Error</div>;
    return this.props.children;
  }
}

function SortableItem(props: { id: string; title: string; idx: number; isPlaying: boolean; onSkip: (e?: React.MouseEvent) => void; onRemove: (id: string, e?: React.MouseEvent) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`text-[8px] md:text-[10px] font-pixel p-2 md:p-3 flex justify-between items-center bg-black/60 border-2 mb-2 ${props.isPlaying ? 'border-yellow-400 text-yellow-400 pixel-panel shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'border-white/20 text-gray-400'}`}>
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-white shrink-0 active:cursor-grabbing p-1">
          <GripVertical size={14} />
        </div>
        <span className="truncate pr-2 block overflow-hidden text-ellipsis whitespace-nowrap" title={props.title}>
          {props.isPlaying ? '▶' : `${props.idx}.`} {props.title}
        </span>
      </div>
      <div className="flex gap-2 shrink-0 items-center">
        {props.isPlaying && (
          <button onClick={props.onSkip} className="hover:text-blue-400 text-white cursor-pointer px-2 py-1 bg-white/10 rounded" title="Skip">
            <SkipForward size={12} />
          </button>
        )}
        {!props.isPlaying && (
          <button onClick={(e) => props.onRemove(props.id, e)} className="hover:text-red-500 cursor-pointer text-white/50 px-2 py-1 hover:bg-white/10 rounded">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

interface SavedPlaylist {
  id: string;
  name: string;
  queue: string[];
}

export function MiniMusicPlayer() {
  const { youtubeQueue, setYoutubeQueue, isRunning } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [widgetMode, setWidgetMode] = useState<'LOGO' | 'BAR'>('LOGO'); // Super-Mini State
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'QUEUE' | 'SAVED'>('PLAYER');
  
  const [youtubeInput, setYoutubeInput] = useState('');
  const [saveName, setSaveName] = useState('');
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  
  // Title Cache mappings (videoId -> title)
  const [titleCache, setTitleCache] = useState<Record<string, string>>({});

  const playerRef = useRef<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loaded = localStorage.getItem('db_saved_playlists');
    if (loaded) {
      try {
        setSavedPlaylists(JSON.parse(loaded));
      } catch(e) {}
    }
  }, []);

  // Sync Titles via noembed API for Queue updates
  useEffect(() => {
    youtubeQueue.forEach(id => {
      if (!titleCache[id]) {
        fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${id}`)
          .then(r => r.json())
          .then(data => {
            if (data && data.title) {
              setTitleCache(prev => ({ ...prev, [id]: data.title }));
            }
          })
          .catch(() => {}); // silent fail, will fallback to ID or get from player later
      }
    });
  }, [youtubeQueue, titleCache]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setYoutubeQueue((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeInput.trim()) return;
    let newId = youtubeInput;
    const match = youtubeInput.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match) newId = match[1];
    
    if (!youtubeQueue.includes(newId)) {
      setYoutubeQueue((prev: string[]) => [...prev, newId]);
    }
    setYoutubeInput('');
  };

  const handleNextMusic = (e?: React.MouseEvent, forcePlay: boolean = false) => {
    if (e) e.stopPropagation();
    setYoutubeQueue((prev: string[]) => {
      if (prev.length === 0) return [];
      
      if (prev.length === 1) {
        // Only 1 song in queue -> Loop it by seeking to 0
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
           playerRef.current.loadVideoById(prev[0]);
           if (isRunning || forcePlay) playerRef.current.playVideo();
        }
        return prev;
      }
      
      const nextList = [...prev.slice(1), prev[0]]; // Loop Queue pattern
      const nextId = nextList[0];
      
      // Explicitly Load and Play the Next Video instantly
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        if (isRunning || forcePlay) {
          playerRef.current.loadVideoById(nextId);
        } else {
          playerRef.current.cueVideoById(nextId);
        }
      }
      return nextList;
    });
  };

  const currentPlaying = youtubeQueue.length > 0 ? youtubeQueue[0] : null;
  const currentTitle = currentPlaying ? (titleCache[currentPlaying] || `Track ID: ${currentPlaying}`) : 'EMPTY QUEUE';

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Safe playback continuous sync
  useEffect(() => {
    try {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        if (isRunning) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("YouTube Player Toggle Error", e);
    }
  }, [isRunning]);

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim() || youtubeQueue.length === 0) return;
    const newList = [...savedPlaylists, { id: Date.now().toString(), name: saveName, queue: youtubeQueue }];
    setSavedPlaylists(newList);
    localStorage.setItem('db_saved_playlists', JSON.stringify(newList));
    setSaveName('');
    setActiveTab('SAVED');
  };

  const loadPlaylist = (queue: string[]) => {
    setYoutubeQueue(queue);
    
    if (playerRef.current && queue.length > 0) {
      if (isRunning) playerRef.current.loadVideoById(queue[0]);
      else playerRef.current.cueVideoById(queue[0]);
    }
    setActiveTab('PLAYER');
  };

  const deletePlaylist = (id: string) => {
    const newList = savedPlaylists.filter(pl => pl.id !== id);
    setSavedPlaylists(newList);
    localStorage.setItem('db_saved_playlists', JSON.stringify(newList));
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .music-marquee-container {
          overflow: hidden;
          width: 100%;
          display: flex;
        }
        .music-marquee-content {
          display: flex;
          white-space: nowrap;
          animation: marquee 30s linear infinite; /* Keeps it slow */
        }
        .music-marquee-content:hover {
          animation-play-state: paused;
        }
        .music-marquee-text {
          min-width: 100%;
          padding-right: 50px;
          flex-shrink: 0;
        }
      `}</style>

      {/* Mini Widget (Bottom Corner) */}
      <div className={`fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[80] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col items-end ${!isExpanded ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-10'}`}>
        <AnimatePresence mode="wait">
          {widgetMode === 'LOGO' ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setWidgetMode('BAR')}
              className="bg-black/95 border-2 border-white p-3 pixel-panel flex items-center justify-center cursor-pointer hover:bg-black transition-colors shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              title="Expand Music Player"
            >
              <Youtube size={26} className="text-red-500 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/95 border-2 border-white p-3 md:p-4 pixel-panel flex items-center gap-3 md:gap-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <Youtube 
                size={20} 
                className="text-red-500 animate-pulse shrink-0 cursor-pointer" 
                onClick={() => { setIsExpanded(true); setActiveTab('PLAYER'); }} 
              />
              
              <div 
                className="flex flex-col gap-1 overflow-hidden w-[135px] md:w-[180px] cursor-pointer shrink-0"
                onClick={() => { setIsExpanded(true); setActiveTab('PLAYER'); }} 
              >
                 <span className="text-white/70 text-[7px] font-pixel tracking-widest uppercase">🔊 NOW PLAYING</span>
                  <div className="music-marquee-container">
                    <div className="music-marquee-content">
                      <span className={`text-yellow-400 text-[8px] md:text-[10px] font-pixel font-bold drop-shadow-md music-marquee-text`}>
                        {currentPlaying ? currentTitle : "EMPTY QUEUE"}
                      </span>
                      <span className={`text-yellow-400 text-[8px] md:text-[10px] font-pixel font-bold drop-shadow-md music-marquee-text`} aria-hidden="true">
                        {currentPlaying ? currentTitle : "EMPTY QUEUE"}
                      </span>
                    </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 border-l-2 border-white/20 pl-2 md:pl-4">
                 <button onClick={(e) => { e.stopPropagation(); setWidgetMode('LOGO'); }} className="text-white/50 hover:text-white p-1" title="Minimize">
                   <Minus size={16} strokeWidth={3} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setActiveTab('PLAYER'); }} className="text-white/50 hover:text-white p-1" title="Command Center">
                   <Maximize2 size={14} strokeWidth={3} />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Center Modal Popover */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div onClick={() => setIsExpanded(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal Window */}
        <div className={`transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'} bg-black/95 border-4 border-white p-6 md:p-8 pixel-panel w-full max-w-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col relative z-10 max-h-[90vh]`}>
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b-4 border-white/20 pb-4 mb-4 shrink-0">
             <div className="flex items-center gap-3 text-white font-pixel text-xs md:text-sm uppercase tracking-widest">
               <Youtube size={20} className="text-red-500" />
               <span className="drop-shadow-md">COMMAND CENTER</span>
             </div>
             <button 
               onClick={() => setIsExpanded(false)} 
               className="w-8 h-8 pixel-btn-secondary flex items-center justify-center text-white"
             >
               <X size={16} strokeWidth={3} />
             </button>
          </div>

          {/* Persistent YouTube Iframe (Never Unmounted) */}
          <div className={`transition-all duration-300 relative shrink-0 z-0 ${isExpanded && activeTab === 'PLAYER' && currentPlaying ? 'w-full aspect-video border-2 border-white mb-4 shadow-[0_0_15px_rgba(255,255,255,0.2)] pointer-events-auto' : 'absolute -top-[9999px] -left-[9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}`}>
             <PlayerErrorBoundary>
               <YouTube 
                 videoId={currentPlaying || ''} 
                 opts={{ width: '100%', height: '100%', playerVars: { autoplay: isRunning ? 1 : 0, controls: 1 } }} 
                 onStateChange={(e) => {
                   if (e.data === 0) handleNextMusic(undefined, true); // ENDED -> Trigger Auto-Play Next / Loop force
                   
                   // Dynamic Title Fetch for Safety on real playback
                   if (e.data === 1 || e.data === 3) {
                     try {
                       const videoData = e.target.getVideoData();
                       if (videoData && videoData.title && videoData.title !== titleCache[currentPlaying!]) {
                         setTitleCache(t => ({ ...t, [currentPlaying!]: videoData.title }));
                       }
                     } catch(err) {}
                   }
                 }}
                 onReady={(e) => {
                    try {
                      playerRef.current = e.target;
                      if (isRunning) e.target.playVideo();
                      else e.target.pauseVideo();
                    } catch (err) {
                       console.error("YouTube Ready Hook Error", err);
                    }
                 }}
                 className={isExpanded && activeTab === 'PLAYER' ? 'absolute inset-0 w-full h-full pointer-events-auto' : 'absolute inset-0 w-full h-full pointer-events-none'}
               />
             </PlayerErrorBoundary>
          </div>

          {activeTab === 'PLAYER' && currentPlaying && (
            <div className="w-full mb-4 px-2">
               <div className="music-marquee-container bg-black/50 border border-white/20 p-2 my-2">
                 <div className="music-marquee-content">
                   <span className="text-yellow-400 text-[10px] uppercase font-pixel tracking-wider music-marquee-text">
                     {currentTitle}
                   </span>
                   <span className="text-yellow-400 text-[10px] uppercase font-pixel tracking-wider music-marquee-text" aria-hidden="true">
                     {currentTitle}
                   </span>
                 </div>
               </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col min-h-[250px]">
            {/* PLAYER TAB CONTENT */}
            {activeTab === 'PLAYER' && (
               <div className="flex flex-col h-full justify-between gap-4">
                 {!currentPlaying && (
                   <div className="flex-1 border-2 border-dashed border-white/30 flex items-center justify-center text-gray-500 font-pixel text-xs uppercase p-4 text-center">
                     No Data.<br/>Please add music to Queue.
                   </div>
                 )}
                 <div className="flex flex-col gap-4 mt-auto shrink-0">
                   <div className="flex gap-4">
                     <button onClick={() => setActiveTab('QUEUE')} className="flex-1 pixel-btn py-4 text-[10px] md:text-xs uppercase flex items-center justify-center gap-2 tracking-widest">
                       <ListMusic size={16} /> VIEW QUEUE
                     </button>
                     <button onClick={() => setActiveTab('SAVED')} className="flex-1 pixel-btn-secondary border-2 border-white py-4 text-[10px] md:text-xs uppercase flex items-center justify-center gap-2 tracking-widest">
                       <Save size={16} /> SAVED PLAYLISTS
                     </button>
                   </div>
                   <div className="w-full text-center mt-2 text-[8px] md:text-[10px] text-gray-500 font-pixel tracking-widest uppercase">
                     UP NEXT: {youtubeQueue.length > 1 ? (titleCache[youtubeQueue[1]] || 'TRACK LOAD PENDING...') : 'END OF QUEUE'}
                   </div>
                 </div>
               </div>
            )}

            {/* QUEUE TAB CONTENT */}
            {activeTab === 'QUEUE' && (
              <div className="flex flex-col h-full gap-4 relative">
                <button onClick={() => setActiveTab('PLAYER')} className="w-fit mb-2 text-white/50 hover:text-white flex items-center gap-2 font-pixel text-[10px] uppercase transition-colors shrink-0">
                  <ArrowLeft size={14} /> Back to Player
                </button>

                <form onSubmit={handleYoutubeSubmit} className="flex gap-3 w-full shrink-0">
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="Insert Youtube link here..."
                    className="flex-1 bg-black text-white placeholder-white/30 border-2 border-white px-4 py-3 outline-none font-pixel text-[8px] md:text-[10px]"
                  />
                  <button type="submit" className="pixel-btn px-4 py-3 text-[8px] md:text-[10px] flex items-center gap-2 whitespace-nowrap">
                    <Plus size={14} /> <span className="hidden md:inline">ADD</span>
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-black/40 border-2 border-white/20 p-2">
                  {youtubeQueue.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={youtubeQueue} strategy={verticalListSortingStrategy}>
                        {youtubeQueue.map((id, idx) => (
                          <SortableItem 
                             key={id} 
                             id={id} 
                             title={titleCache[id] || id} 
                             idx={idx} 
                             isPlaying={idx === 0} 
                             onSkip={handleNextMusic}
                             onRemove={(removeId, e) => {
                               if (e) e.stopPropagation();
                               if (removeId === currentPlaying) handleNextMusic();
                               else setYoutubeQueue(prev => prev.filter(q => q !== removeId));
                             }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 font-pixel text-[10px] uppercase p-8 text-center gap-4">
                      <Youtube size={32} className="opacity-20" />
                      QUEUE IS EMPTY.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSavePlaylist} className="flex gap-2 items-center bg-black/60 p-3 border-2 border-yellow-500/50 shrink-0 mt-2">
                  <input 
                    value={saveName} 
                    onChange={e=>setSaveName(e.target.value)} 
                    placeholder="Name this playlist..." 
                    className="flex-1 bg-black text-white px-2 py-2 border border-white/30 font-pixel text-[8px] outline-none"
                  />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-pixel text-[8px] px-3 py-2 border-2 border-white whitespace-nowrap flex items-center gap-1">
                    <Save size={12}/> SAVE
                  </button>
                </form>
              </div>
            )}

            {/* SAVED TAB CONTENT */}
            {activeTab === 'SAVED' && (
              <div className="flex flex-col h-full gap-4 relative">
                 <button onClick={() => setActiveTab('PLAYER')} className="w-fit mb-2 text-white/50 hover:text-white flex items-center gap-2 font-pixel text-[10px] uppercase transition-colors shrink-0">
                  <ArrowLeft size={14} /> Back to Player
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
                  {savedPlaylists.length > 0 ? savedPlaylists.map(pl => (
                    <div key={pl.id} className="flex justify-between items-center bg-black/50 border-2 border-white/30 p-4 text-[10px] md:text-xs font-pixel text-white hover:border-white transition-colors">
                      <div className="flex flex-col gap-1 overflow-hidden pr-2">
                        <span className="truncate text-yellow-400 drop-shadow-md">{pl.name}</span>
                        <span className="text-[8px] text-gray-400">{pl.queue.length} Tracks</span>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button onClick={() => loadPlaylist(pl.queue)} className="pixel-btn text-[8px] px-3 py-2 flex items-center gap-1">
                          <PlaySquare size={12} /> LOAD
                        </button>
                        <button onClick={() => deletePlaylist(pl.id)} className="text-red-500 hover:text-red-400 px-2 py-2 border-2 border-transparent hover:border-red-500 transition-all rounded">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 font-pixel text-[10px] uppercase border-2 border-dashed border-white/20 p-8 text-center gap-4">
                      <Save size={32} className="opacity-20" />
                      NO SAVED PLAYLISTS YET.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
