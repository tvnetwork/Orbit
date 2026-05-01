import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, MessageCircle, FileText, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HelpCenter() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const categories = [
    { title: t('help.gettingStarted'), desc: t('help.gettingStartedDesc'), icon: Book },
    { title: t('help.paymentsFees'), desc: t('help.paymentsFeesDesc'), icon: FileText },
    { title: t('help.safetyPrivacy'), desc: t('help.safetyPrivacyDesc'), icon: Search },
    { title: t('help.collaboration'), desc: t('help.collaborationDesc'), icon: MessageCircle },
  ];

  const faqs = [
    { q: t('help.faqs.q1'), a: t('help.faqs.a1') },
    { q: t('help.faqs.q2'), a: t('help.faqs.a2') },
    { q: t('help.faqs.q3'), a: t('help.faqs.a3') },
    { q: t('help.faqs.q4'), a: t('help.faqs.a4') },
    { q: t('help.faqs.q5'), a: t('help.faqs.a5') },
    { q: t('help.faqs.q6'), a: t('help.faqs.a6') }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Search */}
      <div className="bg-indigo-600 pt-32 pb-24 px-4 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-bold"
          >
            {t('help.title')}
          </motion.h1>
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder={t('help.searchPlaceholder')}
              className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white text-gray-900 border-none focus:ring-4 focus:ring-indigo-300 transition-all text-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {/* Link each category to its HTML guide */}
          <a href="/public/guides/GettingStarted.html" target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
              <Book className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2">{t('help.gettingStarted')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('help.gettingStartedDesc')}</p>
          </a>
          <a href="/public/guides/PaymentsAndFees.html" target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2">{t('help.paymentsFees')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('help.paymentsFeesDesc')}</p>
          </a>
          <a href="/public/guides/SafetyAndPrivacy.html" target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2">{t('help.safetyPrivacy')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('help.safetyPrivacyDesc')}</p>
          </a>
          <a href="/public/guides/Collaboration.html" target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2">{t('help.collaboration')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('help.collaborationDesc')}</p>
          </a>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('help.faqTitle')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between group"
                >
                  <span className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
