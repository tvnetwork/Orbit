import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-indigo max-w-none space-y-12"
        >
          <div className="space-y-4 border-b border-gray-100 pb-12">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">{t('privacy.title')}</h1>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">{t('privacy.updated')}: April 28, 2026</p>
          </div>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('privacy.s1Title')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('privacy.s1Desc')}
            </p>
          </section>

          <section className="space-y-6 p-8 bg-gray-50 rounded-3xl">
            <h2 className="text-3xl font-bold text-gray-900">{t('privacy.s2Title')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('privacy.s2Desc')}
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('privacy.s3Title')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('privacy.s3Desc')}
            </p>
          </section>

          <section className="space-y-6 border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('privacy.s4Title')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('privacy.s4Desc')}
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
