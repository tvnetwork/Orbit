import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LiveSupport from '../components/LiveSupport';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Contact() {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'support_messages'), {
        ...form,
        type: 'contact_form',
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg space-y-6 rounded-[2.5rem] bg-white dark:bg-slate-800 p-6 sm:p-10 text-center shadow-2xl border border-gray-100 dark:border-slate-700"
        >
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('contact.thankYouTitle', { defaultValue: 'Message Transmitted' })}</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">{t('contact.thankYouDesc', { defaultValue: 'Your request has been logged in our secure support matrix. A Vynta specialist will analyze and respond shortly.' })}</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-gray-900 hover:bg-black text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            {t('common.back', { defaultValue: 'Back' })}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left Column: Info & Live Chat */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-8 sm:space-y-10"
          >
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                {t('contact.heroTitle', { defaultValue: 'Get in touch with our team' })}
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                {t('contact.heroSubtitle', { defaultValue: 'Have a question about our platform or enterprise solutions? Reach out anytime.' })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              <div className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('contact.emailLabel', { defaultValue: 'Email Us' })}</p>
                  <a href="mailto:support@jobs.kontyra.name.ng" className="text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block">
                    support@jobs.kontyra.name.ng
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-2xl text-purple-600 dark:text-purple-400 shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('contact.hqLabel', { defaultValue: 'Headquarters' })}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Global Distributed Network
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {!showChat ? (
                  <motion.div 
                    key="chat-card"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black">{t('contact.liveSupportTitle', { defaultValue: 'Direct Support Chat' })}</h3>
                    </div>
                    <p className="text-indigo-100/90 text-sm leading-relaxed">{t('contact.liveSupportDesc', { defaultValue: 'Start a real-time support session with our client success team.' })}</p>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="w-full bg-white text-indigo-600 py-3.5 sm:py-4 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition-all active:scale-95 text-sm sm:text-base"
                    >
                      {t('contact.startChat', { defaultValue: 'Launch Live Chat' })}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="chat-interface"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="relative rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-xl"
                  >
                    <div className="bg-gray-100 dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
                      <button 
                        onClick={() => setShowChat(false)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to contact info
                      </button>
                    </div>
                    <div className="h-[60vh] min-h-[380px] max-h-[560px]">
                      <LiveSupport inline />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-6 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl shadow-gray-200/40 dark:shadow-none"
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('contact.firstName', { defaultValue: 'First Name' })}</label>
                <input 
                  required
                  type="text" 
                  value={form.firstName}
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 transition-all font-medium text-sm sm:text-base text-gray-900 dark:text-white outline-none" 
                  placeholder={t('contact.placeholderFirstName', { defaultValue: 'e.g. Alex' })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('contact.lastName', { defaultValue: 'Last Name' })}</label>
                <input 
                  required
                  type="text" 
                  value={form.lastName}
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 transition-all font-medium text-sm sm:text-base text-gray-900 dark:text-white outline-none" 
                  placeholder={t('contact.placeholderLastName', { defaultValue: 'e.g. Vance' })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('contact.emailAddress', { defaultValue: 'Email Address' })}</label>
              <input 
                required
                type="email" 
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 transition-all font-medium text-sm sm:text-base text-gray-900 dark:text-white outline-none" 
                placeholder={t('contact.placeholderEmail', { defaultValue: 'name@company.com' })} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('contact.subject', { defaultValue: 'Inquiry Topic' })}</label>
              <div className="relative">
                <select 
                  value={form.subject}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 transition-all font-medium text-sm sm:text-base text-gray-900 dark:text-white outline-none appearance-none pr-12 cursor-pointer"
                >
                  <option value="General Inquiry">{t('contact.subjects.general', { defaultValue: 'General Inquiry' })}</option>
                  <option value="Account & Billing Support">{t('contact.subjects.support', { defaultValue: 'Account & Billing Support' })}</option>
                  <option value="Enterprise & Hiring Solutions">{t('contact.subjects.sales', { defaultValue: 'Enterprise & Hiring Solutions' })}</option>
                  <option value="Partnership & Press">{t('contact.subjects.media', { defaultValue: 'Partnership & Press' })}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('contact.message', { defaultValue: 'Detailed Message' })}</label>
              <textarea 
                required
                rows={5} 
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 transition-all font-medium text-sm sm:text-base text-gray-900 dark:text-white outline-none resize-none" 
                placeholder={t('contact.placeholderMessage', { defaultValue: 'Describe your project, question, or inquiry in detail...' })} 
              />
            </div>

            <button 
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 sm:py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
            >
              <span>{submitting ? 'Transmitting...' : t('contact.send', { defaultValue: 'Send Message' })}</span>
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </motion.form>

        </div>
      </div>
    </div>
  );
}
