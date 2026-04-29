import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TrustSafety() {
  const { t } = useTranslation();
  
  const pillars = [
    { icon: Lock, title: t('trust.pillars.payment'), desc: t('trust.pillars.paymentDesc'), bg: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Eye, title: t('trust.pillars.identity'), desc: t('trust.pillars.identityDesc'), bg: 'bg-purple-50', text: 'text-purple-600' },
    { icon: AlertTriangle, title: t('trust.pillars.dispute'), desc: t('trust.pillars.disputeDesc'), bg: 'bg-orange-50', text: 'text-orange-600' },
    { icon: ShieldCheck, title: t('trust.pillars.privacy'), desc: t('trust.pillars.privacyDesc'), bg: 'bg-emerald-50', text: 'text-emerald-600' }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <div className="inline-flex p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{t('trust.title')}</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            {t('trust.subtitle')}
          </p>
        </motion.div>

        <div className="mt-20 space-y-16">
          <section className="grid grid-cols-1 gap-12">
            {pillars.map((pillar, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className={`p-4 ${pillar.bg} ${pillar.text} rounded-3xl flex-shrink-0 transition-transform group-hover:scale-110`}>
                  <pillar.icon className="h-8 w-8" />
                </div>
                <div className="space-y-4 pt-1">
                  <h3 className="text-2xl font-bold">{pillar.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <footer className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <h4 className="font-bold text-xl mb-6">{t('trust.tipsTitle')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                t('trust.tips.t1'),
                t('trust.tips.t2'),
                t('trust.tips.t3'),
                t('trust.tips.t4')
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 text-gray-600 font-medium">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  {tip}
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
