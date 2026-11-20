import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { availableLanguages } from '../languages';
import { cn } from '../lib/utils';

interface LanguageSwitcherProps {
  dropUp?: boolean;
  showNameOnMobile?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ 
  dropUp = false, 
  showNameOnMobile = false,
  className = "" 
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const activeCode = i18n.resolvedLanguage?.split('-')[0] ?? i18n.language.split('-')[0];

  const currentLanguage = useMemo(() => 
    availableLanguages.find(lang => lang.code === activeCode) || availableLanguages[0]
  , [activeCode]);

  const filteredLanguages = useMemo(() => 
    availableLanguages.filter(lang => 
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
    )
  , [search]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer",
          className
        )}
        aria-label="Select language"
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <span className={showNameOnMobile ? "inline text-xs font-semibold" : "hidden sm:inline"}>
          {currentLanguage.name}
        </span>
        <ChevronDown 
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-300", 
            isOpen && (dropUp ? "-rotate-180" : "rotate-180")
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[110] bg-black/10 dark:bg-black/30 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: dropUp ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: dropUp ? -10 : 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute right-0 w-64 sm:w-72 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-[120] flex flex-col overflow-hidden",
                dropUp ? "bottom-full mb-2" : "top-full mt-2"
              )}
              style={{ maxHeight: 'min(300px, 45vh)' }}
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search languages..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scroll-smooth divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer",
                        activeCode === lang.code 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {activeCode === lang.code && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    No languages found
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
