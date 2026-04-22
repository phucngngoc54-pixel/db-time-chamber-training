import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Zap } from 'lucide-react';
import { VEGETA_FORMS, VegetaForm } from '../lib/vegeta-forms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
}

export function FormsGalleryModal({ isOpen, onClose, currentLevel }: Props) {
  const [selectedForm, setSelectedForm] = useState<VegetaForm>(
    VEGETA_FORMS[Math.min(currentLevel, VEGETA_FORMS.length - 1)]
  );

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isUnlocked = (form: VegetaForm) => form.level <= currentLevel;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto"
        >
          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.88, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-black border-4 border-white pixel-panel overflow-hidden flex flex-col"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* Screw corners */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 border border-black z-20" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 border border-black z-20" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 border border-black z-20" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 border border-black z-20" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-white bg-black shrink-0">
              <div className="flex items-center gap-3">
                <Zap size={14} className="text-yellow-400" />
                <h2 className="font-pixel text-[9px] md:text-[11px] text-white uppercase tracking-widest">
                  Vegeta — Transformation Records
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 border-2 border-white flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

              {/* LEFT — Preview of selected form */}
              <div className="md:w-[340px] shrink-0 flex flex-col items-center justify-center bg-gray-950 border-b-2 md:border-b-0 md:border-r-2 border-white p-6 relative overflow-hidden">
                {/* Aura BG pulse */}
                <div
                  className="absolute inset-0 opacity-20 animate-pulse"
                  style={{
                    background: `radial-gradient(ellipse at center, ${selectedForm.glowColor}, transparent 70%)`,
                  }}
                />

                {/* Lock badge if locked */}
                {!isUnlocked(selectedForm) && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 border border-white/40 px-3 py-1 z-10">
                    <Lock size={8} className="text-gray-400" />
                    <span className="font-pixel text-[6px] text-gray-400 uppercase tracking-widest">Locked</span>
                  </div>
                )}

                {/* Model image */}
                <motion.img
                  key={selectedForm.level}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={selectedForm.modelSrc}
                  alt={selectedForm.name}
                  className={`relative z-10 w-auto max-h-[240px] md:max-h-[300px] object-contain object-bottom [image-rendering:pixelated] transition-all duration-300 ${!isUnlocked(selectedForm) ? 'brightness-50 saturate-50' : 'brightness-100'}`}
                />

                {/* Form name + status */}
                <div className="relative z-10 mt-4 text-center">
                  <p
                    className="font-pixel text-[8px] md:text-[10px] tracking-widest uppercase mb-1"
                    style={{ color: isUnlocked(selectedForm) ? selectedForm.glowColor : '#6b7280', textShadow: isUnlocked(selectedForm) ? `0 0 10px ${selectedForm.glowColor}` : 'none' }}
                  >
                    {selectedForm.name}
                  </p>
                  {isUnlocked(selectedForm) ? (
                    <span className="font-pixel text-[6px] text-green-400 uppercase tracking-widest border border-green-400/40 px-2 py-0.5">✓ UNLOCKED</span>
                  ) : (
                    <span className="font-pixel text-[6px] text-gray-400 uppercase tracking-widest border border-gray-500/40 px-2 py-0.5">
                      PREVIEW ONLY — Requires {selectedForm.kiRequired}m
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT — Form carousel grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <p className="font-pixel text-[6px] text-gray-500 uppercase tracking-widest mb-4">
                  Select a form to preview — {currentLevel < VEGETA_FORMS.length - 1 ? `${VEGETA_FORMS.length - 1 - currentLevel} forms remaining` : 'ALL FORMS UNLOCKED!'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VEGETA_FORMS.map((form) => {
                    const unlocked = isUnlocked(form);
                    const isActive = selectedForm.level === form.level;
                    const isCurrent = form.level === currentLevel;

                    return (
                      <motion.button
                        key={form.level}
                        onClick={() => setSelectedForm(form)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className={`relative flex flex-col items-center gap-2 p-3 border-2 transition-all cursor-pointer overflow-hidden
                          ${isActive
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                            : unlocked
                              ? 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
                              : 'border-gray-700/60 bg-black/40 hover:border-gray-600'
                          }`}
                      >
                        {/* Current badge */}
                        {isCurrent && (
                          <div className="absolute top-1 left-1 font-pixel text-[5px] text-yellow-400 bg-yellow-400/20 border border-yellow-400/50 px-1 py-0.5 uppercase tracking-wider">
                            Current
                          </div>
                        )}

                        {/* Avatar / model thumbnail */}
                        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                          <img
                            src={form.avaSrc}
                            alt={form.name}
                            className={`w-full h-full object-contain object-center [image-rendering:pixelated] transition-all duration-300 ${!unlocked ? 'opacity-40 saturate-0' : ''}`}
                          />
                          {/* Glow overlay for unlocked */}
                          {unlocked && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: `radial-gradient(ellipse at bottom, ${form.glowColor}33, transparent 60%)`,
                              }}
                            />
                          )}
                          {/* Lock icon overlay */}
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-black/60 border border-gray-600 p-2">
                                <Lock size={16} className="text-gray-500" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Form label */}
                        <div className="text-center">
                          <p
                            className={`font-pixel text-[5px] md:text-[6px] uppercase tracking-wider leading-relaxed ${unlocked ? 'text-white' : 'text-gray-600'}`}
                          >
                            {form.shortName}
                          </p>
                          {!unlocked && (
                            <p className="font-pixel text-[4px] md:text-[5px] text-gray-700 uppercase mt-0.5">
                              {form.kiRequired}m
                            </p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Progress Summary */}
                <div className="mt-6 bg-black/60 border border-white/20 p-4">
                  <p className="font-pixel text-[6px] text-cyan-400 uppercase tracking-widest mb-3">Progress Overview</p>
                  <div className="flex flex-col gap-2">
                    {VEGETA_FORMS.slice(0, -1).map((form) => {
                      const nextForm = VEGETA_FORMS[form.level + 1];
                      const unlocked = isUnlocked(form);
                      return (
                        <div key={form.level} className="flex items-center gap-2 text-[5px] md:text-[6px] font-pixel">
                          <div className={`w-1.5 h-1.5 shrink-0 ${unlocked ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                          <span className={unlocked ? 'text-white' : 'text-gray-600'}>
                            {form.shortName} → {nextForm.shortName}
                          </span>
                          <div className="flex-1 h-1 bg-gray-800 border border-gray-700 overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all duration-500"
                              style={{
                                width: unlocked
                                  ? currentLevel > form.level ? '100%' : '0%'
                                  : '0%',
                              }}
                            />
                          </div>
                          <span className={unlocked ? 'text-green-400' : 'text-gray-600'}>
                            {unlocked && currentLevel > form.level ? 'DONE' : `${nextForm.kiRequired}m`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
