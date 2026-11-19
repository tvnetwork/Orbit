import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ExternalLink, Terminal, Shield, Zap, Ticket, BookOpen, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EcosystemApp {
  id: string;
  name: string;
  tagline: string;
  url: string;
  badge: string;
  color: string;
  icon: React.ElementType;
}

const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: 'devos',
    name: 'DevOS',
    tagline: 'Cloud IDE & Execution',
    url: 'https://devos.kontyra.name.ng',
    badge: 'Runtime',
    color: 'from-cyan-500 to-blue-600',
    icon: Terminal,
  },
  {
    id: 'accounts',
    name: 'Identity & SSO',
    tagline: 'Universal Auth & Passkeys',
    url: 'https://accounts.kontyra.name.ng',
    badge: 'Security',
    color: 'from-emerald-500 to-teal-600',
    icon: Shield,
  },
  {
    id: 'kora',
    name: 'KORA AI',
    tagline: 'Neural Intelligence',
    url: 'https://api.kontyra.name.ng',
    badge: 'Models',
    color: 'from-blue-600 to-indigo-700',
    icon: Zap,
  },
  {
    id: 'vux',
    name: 'VUX Events',
    tagline: 'Experience Platform',
    url: 'https://vux.kontyra.name.ng',
    badge: 'Live',
    color: 'from-pink-500 to-rose-600',
    icon: Ticket,
  },
  {
    id: 'novelora',
    name: 'Novelora',
    tagline: 'Authoring Studio',
    url: 'https://novelora.kontyra.name.ng',
    badge: 'Studio',
    color: 'from-amber-500 to-yellow-600',
    icon: BookOpen,
  },
  {
    id: 'docs',
    name: 'Docs Hub',
    tagline: 'Architecture & Guides',
    url: 'https://docs.kontyra.name.ng',
    badge: 'Docs',
    color: 'from-slate-600 to-slate-800',
    icon: FileText,
  },
];

export default function EcosystemAppLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
        title="Kontyra Ecosystem Apps"
        aria-label="Kontyra Ecosystem Apps"
      >
        <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-slate-950/95 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl p-4 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <img src="/kontyra-gradient.svg" alt="Kontyra" className="w-4 h-4 object-contain" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Kontyra Ecosystem
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Connected</span>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto custom-scrollbar p-1">
              {ECOSYSTEM_APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-white/15 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-sm shrink-0`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {app.badge}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                        <span>{app.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {app.tagline}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Footer row */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between px-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span>Current: VyntaJobs</span>
              <a
                href="https://kontyra.name.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                kontyra.name.ng →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
