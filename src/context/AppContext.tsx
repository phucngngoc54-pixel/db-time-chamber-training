import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import { Character, Task } from '../types';
import { CHARACTERS } from '../constants';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

export type Language = 'en' | 'vi';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  isGoogle?: boolean;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'info' | 'error';
  id: number;
}

interface AppContextType {
  // Config
  user: UserProfile | null;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  lobbyBackgroundUrl: string;
  setLobbyBackgroundUrl: (url: string) => void;
  chamberBackgroundUrl: string;
  setChamberBackgroundUrl: (url: string) => void;
  lobbyBgHistory: string[];
  setLobbyBgHistory: React.Dispatch<React.SetStateAction<string[]>>;
  chamberBgHistory: string[];
  setChamberBgHistory: React.Dispatch<React.SetStateAction<string[]>>;
  t: (key: keyof typeof translations['en']) => string;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  
  // Dragon Balls
  dragonBalls: number;
  setDragonBalls: React.Dispatch<React.SetStateAction<number>>;
  
  // Total Training Stats (Hardcore)
  totalSecondsTrained: number;
  setTotalSecondsTrained: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  currentKi: number;
  setCurrentKi: React.Dispatch<React.SetStateAction<number>>;
  
  // EXP (Legacy, kept for compatibility if needed, but we will mostly use currentKi)
  exp: number;
  setExp: React.Dispatch<React.SetStateAction<number>>;
  
  // Timer State
  isSessionActive: boolean;
  setIsSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  timerMode: 'focus' | 'break';
  setTimerMode: React.Dispatch<React.SetStateAction<'focus' | 'break'>>;
  
  // Settings for Timer
  focusTime: number;
  setFocusTime: React.Dispatch<React.SetStateAction<number>>;
  breakTime: number;
  setBreakTime: React.Dispatch<React.SetStateAction<number>>;
  selectedCharacter: Character | null;
  setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  youtubeQueue: string[];
  setYoutubeQueue: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Expose firebase user
  fbUser: User | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [lobbyBackgroundUrl, setLobbyBackgroundUrlState] = useState<string>('https://i.postimg.cc/w7M7HhTB/anh-sanh-cho.webp');
  const [chamberBackgroundUrl, setChamberBackgroundUrlState] = useState<string>('https://i.postimg.cc/FYtmqcYq/background-jpg.webp');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Timer State
  const [dragonBallsState, setDragonBallsState] = useState(0);
  const [expState, setExpState] = useState(0);
  const [totalSecondsTrainedState, setTotalSecondsTrainedState] = useState(0);
  const [currentLevelState, setCurrentLevelState] = useState(0);
  const [currentKiState, setCurrentKiState] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus'|'break'>('focus');
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(CHARACTERS[0]);
  const [tasksState, setTasksState] = useState<Task[]>([]);
  const [youtubeQueueState, setYoutubeQueueState] = useState<string[]>(['NZAkXF6n5-8']);
  
  const DEFAULT_LOBBY_BGS = [
    'https://i.postimg.cc/FYtmqcYq/background-jpg.webp',
    'https://i.postimg.cc/w7M7HhTB/anh-sanh-cho.webp',
    'https://images.unsplash.com/photo-1549298240-0d8e60513026?q=80&w=1920',
    'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920'
  ];

  const DEFAULT_CHAMBER_BGS = [
    'https://i.postimg.cc/FYtmqcYq/background-jpg.webp',
    'https://storage.googleapis.com/aistudio-user-content-prod/12474932087453489816/1744820880315934-image.png',
    'https://images.unsplash.com/photo-1549298240-0d8e60513026?q=80&w=1920',
    'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920'
  ];

  // Gallery History States
  const [lobbyBgHistoryState, setLobbyBgHistoryState] = useState<string[]>(DEFAULT_LOBBY_BGS);
  const [chamberBgHistoryState, setChamberBgHistoryState] = useState<string[]>(DEFAULT_CHAMBER_BGS);

  const loadedFromFirebase = useRef(false);

  // Safe setter overrides that sync to Firestore if logged in
  const setAppTotalSeconds: React.Dispatch<React.SetStateAction<number>> = (val) => {
    setTotalSecondsTrainedState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { totalSecondsTrained: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setAppCurrentLevel: React.Dispatch<React.SetStateAction<number>> = (val) => {
    setCurrentLevelState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { currentLevel: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setAppCurrentKi: React.Dispatch<React.SetStateAction<number>> = (val) => {
    setCurrentKiState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { currentKi: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setAppExp: React.Dispatch<React.SetStateAction<number>> = (val) => {
    setExpState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { exp: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setDragonBalls: React.Dispatch<React.SetStateAction<number>> = (val) => {
    setDragonBallsState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { dragonBalls: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = (val) => {
    setTasksState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { tasks: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setLobbyBgHistory: React.Dispatch<React.SetStateAction<string[]>> = (val) => {
    setLobbyBgHistoryState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('db_lobby_bgs', JSON.stringify(newVal));
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { lobbyBgHistory: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setChamberBgHistory: React.Dispatch<React.SetStateAction<string[]>> = (val) => {
    setChamberBgHistoryState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('db_chamber_bgs', JSON.stringify(newVal));
      if (fbUser && loadedFromFirebase.current) {
        updateDoc(doc(db, 'users', fbUser.uid), { chamberBgHistory: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const setAppSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>> = (val) => {
    setSelectedCharacter(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      if (fbUser && loadedFromFirebase.current && newVal) {
        updateDoc(doc(db, 'users', fbUser.uid), { selectedCharacter: newVal }).catch(console.error);
      }
      return newVal;
    });
  };

  const exp = expState;
  const dragonBalls = dragonBallsState;
  const totalSecondsTrained = totalSecondsTrainedState;
  const currentLevel = currentLevelState;
  const currentKi = currentKiState;
  const tasks = tasksState;
  const lobbyBgHistory = lobbyBgHistoryState;
  const chamberBgHistory = chamberBgHistoryState;
  const youtubeQueue = youtubeQueueState;

  // Load from LocalStorage once for non-firebase stuff
  useEffect(() => {
    try {
      // One-time reset of stats as requested by user for the "new system"
      const hasReset = localStorage.getItem('db_stats_reset_v2');
      if (!hasReset) {
        localStorage.removeItem('db_app_state');
        localStorage.removeItem('trainingHistory');
        setTotalSecondsTrainedState(0);
        setCurrentKiState(0);
        setCurrentLevelState(0);
        localStorage.setItem('db_stats_reset_v2', 'true');
      }

      const savedLang = localStorage.getItem('db_lang') as Language;
      const savedLobbyBg = localStorage.getItem('db_lobby_bg');
      const savedChamberBg = localStorage.getItem('db_chamber_bg');
      const savedOldBg = localStorage.getItem('db_bg'); // Backwards compatibility
      
      if (savedLang) setLanguageState(savedLang);
      if (savedLobbyBg) setLobbyBackgroundUrlState(savedLobbyBg);
      else if (savedOldBg) setLobbyBackgroundUrlState(savedOldBg); // Fallback
      if (savedChamberBg) setChamberBackgroundUrlState(savedChamberBg);
      else if (savedOldBg) setChamberBackgroundUrlState(savedOldBg); // Fallback

      const savedAppState = localStorage.getItem('db_app_state');
      if (savedAppState) {
        const parsedState = JSON.parse(savedAppState);
        
        let initialTimeLeft = parsedState.timeLeft ?? 25 * 60;
        let initialIsRunning = parsedState.isRunning ?? false;
        
        // Account for elapsed time if it was running and we stored a timestamp
        if (initialIsRunning && parsedState.lastSavedAt) {
           const elapsedSeconds = Math.floor((Date.now() - parsedState.lastSavedAt) / 1000);
           initialTimeLeft = Math.max(0, initialTimeLeft - elapsedSeconds);
           if (initialTimeLeft === 0) initialIsRunning = false;
        }

        if (!loadedFromFirebase.current) {
          setAppExp(parsedState.exp ?? 0);
          setDragonBalls(parsedState.dragonBalls ?? 0);
          setAppTotalSeconds(parsedState.totalSecondsTrained ?? 0);
          setAppCurrentLevel(parsedState.currentLevel ?? 0);
          setAppCurrentKi(parsedState.currentKi ?? 0);
          setTasks(parsedState.tasks ?? []);
        }
        
        setIsSessionActive(parsedState.isSessionActive ?? false);
        setTimeLeft(initialTimeLeft);
        setIsRunning(initialIsRunning);
        setTimerMode(parsedState.timerMode ?? 'focus');
        setFocusTime(parsedState.focusTime ?? 25);
        setBreakTime(parsedState.breakTime ?? 5);
        if (parsedState.selectedCharacter) setSelectedCharacter(parsedState.selectedCharacter);
        setYoutubeQueueState(parsedState.youtubeQueue ?? ['5qap5aO4i9A']); // Lo-Fi DBZ default ID
      }
    } catch (e) {
      console.error("Failed parsing localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to LocalStorage when changed (Local Only fields + backup)
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('db_app_state', JSON.stringify({
      exp,
      dragonBalls,
      totalSecondsTrained,
      currentLevel,
      currentKi,
      isSessionActive,
      timeLeft,
      isRunning,
      timerMode,
      focusTime,
      breakTime,
      selectedCharacter,
      tasks,
      youtubeQueue,
      lastSavedAt: Date.now()
    }));
  }, [exp, dragonBalls, totalSecondsTrained, currentLevel, currentKi, isSessionActive, timeLeft, isRunning, timerMode, focusTime, breakTime, selectedCharacter, tasks, youtubeQueue, isInitialized]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFbUser(currentUser);
      if (currentUser) {
        setUser({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown',
          email: currentUser.email || '',
          avatar: currentUser.photoURL || undefined,
          isGoogle: currentUser.providerData.some(p => p.providerId === 'google.com')
        });

        // Setup real-time listener for user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubsSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            loadedFromFirebase.current = true;
            if (data.exp !== undefined) setAppExp(data.exp);
            if (data.dragonBalls !== undefined) setDragonBalls(data.dragonBalls);
            if (data.totalSecondsTrained !== undefined) setTotalSecondsTrainedState(data.totalSecondsTrained);
            if (data.currentLevel !== undefined) setCurrentLevelState(data.currentLevel);
            if (data.currentKi !== undefined) setCurrentKiState(data.currentKi);
            if (data.tasks) setTasks(data.tasks);
            if (data.lobbyBackgroundUrl) setLobbyBackgroundUrlState(data.lobbyBackgroundUrl);
            if (data.chamberBackgroundUrl) setChamberBackgroundUrlState(data.chamberBackgroundUrl);
            if (data.lobbyBgHistory) setLobbyBgHistoryState(data.lobbyBgHistory);
            if (data.chamberBgHistory) setChamberBgHistoryState(data.chamberBgHistory);
            if (data.selectedCharacter) setSelectedCharacter(data.selectedCharacter);
          } else {
            // First time login - set initial document
            setDoc(userDocRef, {
              exp: 0,
              dragonBalls: 0,
              totalSecondsTrained: 0,
              currentLevel: 0,
              currentKi: 0,
              tasks: [],
              lobbyBackgroundUrl: DEFAULT_LOBBY_BGS[0],
              chamberBackgroundUrl: DEFAULT_CHAMBER_BGS[0],
              lobbyBgHistory: DEFAULT_LOBBY_BGS,
              chamberBgHistory: DEFAULT_CHAMBER_BGS,
              selectedCharacter: CHARACTERS[0]
            });
          }
        });

        return () => unsubsSnapshot();
      } else {
        setUser(null);
        loadedFromFirebase.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Global Interval for Timer
  const tickAudio = useRef<HTMLAudioElement | null>(null);
  const alertAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tickAudio.current = new Audio('https://www.soundjay.com/buttons/button-50.mp3');
    alertAudio.current = new Audio('https://www.soundjay.com/nature/sounds/ping-1.mp3');
    
    // Low volume for ticking
    if (tickAudio.current) tickAudio.current.volume = 0.3;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        try {
          setTimeLeft((prev) => {
            const next = Math.max(0, prev - 1);
            
            // Ticking sound in last 5 seconds
            if (next <= 5 && next > 0 && tickAudio.current) {
               tickAudio.current.currentTime = 0;
               tickAudio.current.play().catch(() => {});
            }
            
            return next;
          });
          
          if (timerMode === 'focus') {
            setTotalSecondsTrainedState(prev => prev + 1);
          }
        } catch (err) {
          console.error("Timer interval error:", err);
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      try {
        // Play Alert Sound
        if (alertAudio.current) {
          alertAudio.current.currentTime = 0;
          alertAudio.current.play().catch(() => {});
        }

        if (timerMode === 'focus') {
          // Save Training History
          try {
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
            const historyJSON = localStorage.getItem('trainingHistory');
            let history: { date: string, minutes: number, tasksDone: number, totalTasks: number }[] = historyJSON ? JSON.parse(historyJSON) : [];
            
            const tasksDoneCount = tasksState.filter(t => t.completed).length;
            const totalTasksCount = tasksState.length;
            
            const existingDayIndex = history.findIndex(h => h.date === dateStr);
            if (existingDayIndex >= 0) {
              history[existingDayIndex].minutes += focusTime;
              history[existingDayIndex].tasksDone += tasksDoneCount;
              history[existingDayIndex].totalTasks += totalTasksCount;
            } else {
              history.push({
                date: dateStr,
                minutes: focusTime,
                tasksDone: tasksDoneCount,
                totalTasks: totalTasksCount
              });
            }
            
            // Keep last 30 days
            if (history.length > 30) history = history.slice(history.length - 30);
            
            localStorage.setItem('trainingHistory', JSON.stringify(history));
          } catch (e) {
            console.error("Error saving training history", e);
          }

          setTimerMode('break');
          setTimeLeft((breakTime || 5) * 60);
          setIsRunning(true); // Explicitly ensure it keeps running
        } else {
          setTimerMode('focus');
          setTimeLeft((focusTime || 25) * 60);
          setIsRunning(true); // Explicitly ensure it keeps running
        }
      } catch (err) {
        console.error("Auto switch error:", err);
        setIsRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, focusTime, breakTime, tasksState]);

  // Hardcore Progression Logic based on totalSecondsTrained
  useEffect(() => {
    // Only process if we have valid trained seconds
    if (totalSecondsTrainedState <= 0) return;
    
    // We add 1 ki every 60 seconds of total training
    // So current total cumulative minutes trained:
    const totalMinutes = Math.floor(totalSecondsTrainedState / 60);
    
    // Calculate Dragon Balls: 1 ball per 300 minutes (5 hours)
    const expectedBalls = Math.floor(totalMinutes / 300);
    // Cap at 7 balls
    const newDragonBalls = Math.min(expectedBalls, 7);
    if (newDragonBalls > dragonBallsState) {
        setDragonBalls(newDragonBalls);
        showToast("🐉 You found a Dragon Ball!", "success");
    }

    // Since currentKi resets every level, let's recalculate it.
    // Instead of looping, we can just check if we hit the limit
    const requiredKiToNextLevel = 240 * Math.pow(2, currentLevelState);
    if (currentKiState >= requiredKiToNextLevel) {
       // LEVEL UP!
       setCurrentKiState(0);
       setCurrentLevelState(prev => prev + 1);
       showToast("🔥 LEVEL UP!", "success");
    } else if (totalSecondsTrainedState % 60 === 0 && timerMode === 'focus') {
       // Add 1 min worth of KI
       setCurrentKiState(prev => prev + 1);
    }

  }, [totalSecondsTrainedState]);

  const logout = () => {
    signOut(auth);
  };
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('db_lang', newLang);
  };
  const setLobbyBackgroundUrl = (url: string) => {
    setLobbyBackgroundUrlState(url);
    localStorage.setItem('db_lobby_bg', url);
    if (fbUser && loadedFromFirebase.current) {
      updateDoc(doc(db, 'users', fbUser.uid), { lobbyBackgroundUrl: url }).catch(console.error);
    }
  };
  const setChamberBackgroundUrl = (url: string) => {
    setChamberBackgroundUrlState(url);
    localStorage.setItem('db_chamber_bg', url);
    if (fbUser && loadedFromFirebase.current) {
      updateDoc(doc(db, 'users', fbUser.uid), { chamberBackgroundUrl: url }).catch(console.error);
    }
  };
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  return (
    <AppContext.Provider value={{ 
      user, logout, language, setLanguage, 
      lobbyBackgroundUrl, setLobbyBackgroundUrl, 
      chamberBackgroundUrl, setChamberBackgroundUrl, 
      lobbyBgHistory, setLobbyBgHistory,
      chamberBgHistory, setChamberBgHistory,
      t, showToast,
      exp, setExp: setAppExp,
      totalSecondsTrained, setTotalSecondsTrained: setAppTotalSeconds,
      currentLevel, setCurrentLevel: setAppCurrentLevel,
      currentKi, setCurrentKi: setAppCurrentKi,
      dragonBalls, setDragonBalls,
      isSessionActive, setIsSessionActive,
      timeLeft, setTimeLeft,
      isRunning, setIsRunning,
      timerMode, setTimerMode,
      focusTime, setFocusTime,
      breakTime, setBreakTime,
      selectedCharacter, setSelectedCharacter: setAppSelectedCharacter,
      tasks, setTasks,
      youtubeQueue, setYoutubeQueue: setYoutubeQueueState,
      fbUser
    }}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border border-white/20 font-medium text-white flex items-center gap-2 ${
                toast.type === 'success' ? 'bg-green-500/80 shadow-[0_4px_20px_rgba(34,197,94,0.3)]' :
                toast.type === 'error' ? 'bg-red-500/80 shadow-[0_4px_20px_rgba(239,68,68,0.3)]' :
                'bg-blue-500/80 shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

