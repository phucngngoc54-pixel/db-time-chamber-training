import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: Props) {
  const { t, showToast } = useAppContext();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError(t('passwords_not_match'));
          return;
        }
        if (email && password && username) {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(res.user, { displayName: username });
          showToast(t('welcome_back').replace('{name}', username), 'success');
          onClose();
          resetForm();
        }
      } else {
        if (email && password) {
          const res = await signInWithEmailAndPassword(auth, email, password);
          const displayUsername = res.user.displayName || email.split('@')[0];
          showToast(t('welcome_back').replace('{name}', displayUsername), 'success');
          onClose();
          resetForm();
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Lỗi: Tên miền chưa được cấp phép. Vui lòng vào Firebase Console -> Authentication -> Settings -> Authorized domains và thêm: ${window.location.hostname}`);
      } else {
        setError(err.message || 'Authentication error');
      }
    }
  };

  const handleFacebookLogin = () => {
    showToast(t('facebook_soon'), 'info');
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      showToast(t('welcome_back').replace('{name}', res.user.displayName || 'Hero'), 'success');
      onClose();
      resetForm();
    } catch(e: any) {
      console.error(e);
      if (e.code === 'auth/unauthorized-domain') {
         setError(`Lỗi: Tên miền chưa được cấp phép. Vui lòng vào Firebase Console -> Authentication -> Settings -> Authorized domains và thêm: ${window.location.hostname}`);
      } else {
         showToast('Google login failed: ' + e.message, 'error');
      }
    }
  };

  const resetForm = () => {
    setIsRegister(false);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
  };

  const FacebookIcon = () => (
    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md pixel-panel p-8 relative overflow-hidden my-auto"
          >
            {/* Capsule style decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-blue-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-all border-2 border-white z-[60]"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl md:text-2xl font-pixel text-white text-center mb-6 uppercase tracking-wider drop-shadow-md">
              {isRegister ? t('register') : t('login')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900 border-2 border-red-500 text-red-200 text-[10px] md:text-xs font-pixel uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('username')}
                    className="w-full bg-black/60 border-2 border-white text-white placeholder:text-white/40 py-3 pl-12 pr-4 outline-none focus:border-orange-400 focus:bg-black transition-all font-pixel text-[10px] uppercase tracking-widest"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className="w-full bg-black/60 border-2 border-white text-white placeholder:text-white/40 py-3 pl-12 pr-4 outline-none focus:border-orange-400 focus:bg-black transition-all font-pixel text-[10px] uppercase tracking-widest"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  className="w-full bg-black/60 border-2 border-white text-white placeholder:text-white/40 py-3 pl-12 pr-4 outline-none focus:border-orange-400 focus:bg-black transition-all font-pixel text-[10px] uppercase tracking-widest"
                  required
                />
              </div>

              {isRegister && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirm_password')}
                    className="w-full bg-black/60 border-2 border-white text-white placeholder:text-white/40 py-3 pl-12 pr-4 outline-none focus:border-orange-400 focus:bg-black transition-all font-pixel text-[10px] uppercase tracking-widest"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-orange-600 hover:bg-orange-500 text-white font-pixel text-[10px] md:text-xs border-2 border-white shadow-[0_4px_0_rgba(255,255,255,0.4)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
              >
                {isRegister ? t('register') : t('login')}
              </button>
            </form>

            <div className="my-6 flex items-center justify-center space-x-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-white font-pixel text-[8px] uppercase tracking-wider">{t('or_continue_with')}</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleGoogleLogin} 
                type="button"
                className="flex-1 py-3 bg-white hover:bg-gray-200 text-gray-900 border-2 border-white shadow-[0_4px_0_rgba(255,255,255,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-pixel"
              >
                <GoogleIcon />
              </button>
              <button 
                onClick={handleFacebookLogin}
                type="button"
                className="flex-1 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white border-2 border-white shadow-[0_4px_0_rgba(255,255,255,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-pixel"
              >
                <FacebookIcon />
              </button>
            </div>

            <div className="mt-8 text-center border-t border-white/10 pt-4">
              <button 
                type="button"
                onClick={toggleMode}
                className="text-white hover:text-[#FFCC00] font-pixel text-[8px] md:text-[10px] uppercase transition-colors"
              >
                {isRegister ? t('have_account') : t('no_account')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
