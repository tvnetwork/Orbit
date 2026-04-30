import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-lg space-y-6"
        >
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold">{t('contact.thankYouTitle', { defaultValue: 'Message Transmitted' })}</h2>
          <p className="text-gray-500 leading-relaxed">{t('contact.thankYouDesc', { defaultValue: 'Your request has been logged in our secure support matrix. A Vynta specialist will analyze and respond shortly.' })}</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            {t('common.back')}
          </button>
        </motion.div>
      </div>
    );
  }

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
                  <p className="text-lg font-bold">support@orbit.global</p>
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

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('contact.firstName')}</label>
                <input 
                  required
                  type="text" 
                  value={form.firstName}
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" 
                  placeholder={t('contact.placeholderFirstName')} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('contact.lastName')}</label>
                <input 
                  required
                  type="text" 
                  value={form.lastName}
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" 
                  placeholder={t('contact.placeholderLastName')} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.emailAddress')}</label>
              <input 
                required
                type="email" 
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" 
                placeholder={t('contact.placeholderEmail')} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.subject')}</label>
              <div className="relative">
                <select 
                  value={form.subject}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium appearance-none"
                >
                  <option>{t('contact.subjects.general')}</option>
                  <option>{t('contact.subjects.support')}</option>
                  <option>{t('contact.subjects.sales')}</option>
                  <option>{t('contact.subjects.media')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('contact.message')}</label>
              <textarea 
                required
                rows={6} 
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none shadow-inner" 
                placeholder={t('contact.placeholderMessage')} 
              />
            </div>
            <button 
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Transmitting...' : t('contact.send')} <Send className="h-5 w-5" />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
