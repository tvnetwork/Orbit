import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LiveSupport from '../components/LiveSupport';

export default function Contact() {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-6xl font-bold tracking-tight text-gray-900 leading-none">{t('contact.heroTitle')}</h1>
              <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                {t('contact.heroSubtitle')}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-indigo-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{t('contact.emailLabel')}</p>
                  <p className="text-lg font-bold">support@ orbit.global</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-purple-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{t('contact.hqLabel')}</p>
                  <p className="text-lg font-bold">One Infinity Loop, San Francisco</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {!showChat ? (
                  <motion.div 
                    key="chat-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-indigo-200"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6" />
                      <h3 className="text-xl font-bold">{t('contact.liveSupportTitle')}</h3>
                    </div>
                    <p className="text-indigo-100 opacity-80 text-sm">{t('contact.liveSupportDesc')}</p>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      {t('contact.startChat')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="chat-interface"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="h-[600px] relative"
                  >
                    <button 
                      onClick={() => setShowChat(false)}
                      className="absolute -top-12 left-0 text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to options
                    </button>
                    <LiveSupport inline />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('contact.firstName')}</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder={t('contact.placeholderFirstName')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('contact.lastName')}</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder={t('contact.placeholderLastName')} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.emailAddress')}</label>
              <input type="email" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder={t('contact.placeholderEmail')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.subject')}</label>
              <div className="relative">
                <select className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium appearance-none">
                  <option>{t('contact.subjects.general')}</option>
                  <option>{t('contact.subjects.support')}</option>
                  <option>{t('contact.subjects.sales')}</option>
                  <option>{t('contact.subjects.media')}</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   {/* Custom arrow if needed */}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.message')}</label>
              <textarea rows={6} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none shadow-inner" placeholder={t('contact.placeholderMessage')} />
            </div>
            <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
              {t('contact.send')} <Send className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
