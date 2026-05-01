import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { availableLanguages } from '../languages';

export default function LanguageSwitcher() {
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
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 hover:border-indigo-300 transition-all text-sm font-bold text-gray-900 shadow-sm"
      >
        <span className="text-lg opacity-80">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[110]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
              className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[120] flex flex-col max-h-[480px] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search languages..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scroll-smooth custom-scrollbar">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                        activeCode === lang.code 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        {lang.name}
                      </div>
                      {activeCode === lang.code && <Check className="h-4 w-4" />}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
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
