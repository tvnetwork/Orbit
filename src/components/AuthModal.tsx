import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, ArrowRight, Orbit as BrandIcon } from 'lucide-react';
import { initiateKontyraSSO } from '../lib/kontyraSso';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  loading?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  onGoogleLogin,
  loading = false,
}: AuthModalProps) {
  if (!isOpen) return null;

  const handleKontyraSSO = () => {
    initiateKontyraSSO('vyntajobs');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
        >
          {/* Subtle ambient corner glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500/20 flex items-center justify-center text-white dark:text-indigo-400 shadow-lg shadow-indigo-600/25 border border-indigo-600/30">
              <BrandIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome to VyntaJobs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access your global freelance & client workspace
              </p>
            </div>
          </div>

          {/* Login Actions */}
          <div className="space-y-3">
            {/* Primary: Kontyra Identity SSO */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleKontyraSSO}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold flex items-center gap-2">
                    <span>Kontyra Identity SSO</span>
                    <span className="text-[9px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full font-mono">
                      Fast Pass
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">Single Sign-On across Kontyra</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                or
              </span>
            </div>

            {/* Secondary: Google Auth */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold text-sm transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-6 leading-relaxed">
            By continuing, you agree to VyntaJobs{' '}
            <a href="/terms" className="underline hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-indigo-500">
              Privacy Policy
            </a>
            .
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
