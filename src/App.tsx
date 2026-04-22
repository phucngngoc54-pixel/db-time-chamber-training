import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Screen } from './types';
import { LobbyScreen } from './components/LobbyScreen';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { TimerScreen } from './components/TimerScreen';
import { AppProvider } from './context/AppContext';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('lobby');

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-sans fixed inset-0 flex items-center justify-center">
      <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
        {currentScreen === 'lobby' && (
          <LobbyScreen 
            onEnter={() => setCurrentScreen('character-select')} 
            onResume={() => setCurrentScreen('timer')}
          />
        )}
        {currentScreen === 'character-select' && (
          <CharacterSelectScreen 
            onBack={() => setCurrentScreen('lobby')}
            onStart={() => setCurrentScreen('timer')}
          />
        )}
        {currentScreen === 'timer' && (
          <TimerScreen 
            onBackToLobby={() => setCurrentScreen('lobby')}
          />
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
