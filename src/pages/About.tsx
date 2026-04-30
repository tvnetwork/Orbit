import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Orbit, 
  Users, 
  Target, 
  Rocket, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Award,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';

export default function About() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ jobs: 0, talent: 0, clients: 0 });

  useEffect(() => {
    const unsubJobs = onSnapshot(query(collection(db, 'jobs'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, jobs: snap.size }));
    });

    const unsubTalent = onSnapshot(query(collection(db, 'users'), where('role', '==', 'freelancer'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, talent: snap.size }));
    });

    const unsubClients = onSnapshot(query(collection(db, 'users'), where('role', '==', 'client'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, clients: snap.size }));
    });

    return () => {
      unsubJobs();
      unsubTalent();
      unsubClients();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  } as const;

  const faqs = [
    {
      q: t('about.faqs.q1.question'),
      a: t('about.faqs.q1.answer')
    },
    {
      q: t('about.faqs.q2.question'),
      a: t('about.faqs.q2.answer')
    },
    {
      q: t('about.faqs.q3.question'),
      a: t('about.faqs.q3.answer')
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-24 md:pb-24 md:pt-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Orbit className="h-4 w-4" />
              {t('about.heroMission')}
            </motion.div>
            <h1 className="mb-6 text-4xl font-bold leading-[0.95] tracking-tighter text-gray-900 sm:text-5xl md:mb-8 md:text-7xl lg:text-8xl">
              Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Universe</span> of Work.
            </h1>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-gray-500 md:text-2xl">
              {t('about.heroSubtitle')}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 -z-10 rounded-bl-[10rem]" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-100 bg-gray-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 md:gap-12">
          {[
            { label: t('about.statsTalent'), value: counts.talent > 0 ? `${counts.talent}+` : '0' },
            { label: t('about.statsClients'), value: counts.clients > 0 ? `${counts.clients}+` : '0' },
            { label: t('about.statsProjects'), value: counts.jobs > 0 ? `${counts.jobs}+` : '0' },
            { label: t('about.statsReach'), value: 'Global' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="space-y-1 text-center md:text-left"
            >
              <p className="text-4xl font-bold text-gray-900 tracking-tighter font-mono">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end md:gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{t('about.valuesTitle')}</h2>
              <p className="text-gray-500 font-medium">{t('about.valuesSubtitle')}</p>
            </div>
            <Link to="/jobs" className="group flex items-center gap-2 text-indigo-600 font-bold hover:gap-4 transition-all">
              {t('home.browseAll')} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: ShieldCheck, 
                title: t('about.values.integrity.title'), 
                desc: t('about.values.integrity.desc'),
                color: 'blue'
              },
              { 
                icon: Zap, 
                title: t('about.values.velocity.title'), 
                desc: t('about.values.velocity.desc'),
                color: 'purple'
              },
              { 
                icon: Award, 
                title: t('about.values.quality.title'), 
                desc: t('about.values.quality.desc'),
                color: 'emerald'
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className={`p-4 bg-${value.color}-50 text-${value.color}-600 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform`}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative overflow-hidden bg-gray-900 py-20 text-white md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 md:gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('about.storyTitle')}</h2>
            <div className="space-y-6 text-base leading-relaxed text-gray-400 sm:text-lg">
              <p>"{t('about.storyP1')}"</p>
              <p>{t('about.storyP2')}</p>
            </div>
            <div className="flex gap-6 pt-4 sm:gap-8">
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Localizations</p>
              </div>
              <div className="w-px bg-gray-800" />
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Global Support</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-indigo-600 rounded-3xl rotate-3 flex items-center justify-center relative z-10 overflow-hidden group">
              <Globe2 className="h-32 w-32 text-white/20 animate-pulse sm:h-40 sm:w-40 md:h-48 md:w-48" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="absolute -inset-4 border border-indigo-500/30 rounded-3xl -rotate-3 -z-10" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center md:mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('about.faqTitle')}</h2>
            <p className="text-gray-500 text-lg">{t('about.faqSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faqs.map((faq, i) => {
              const [isOpen, setIsOpen] = React.useState(false);
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                >
                  <div className="flex flex-1 flex-col p-6 sm:p-8 md:p-10">
                    <h3 className="mb-4 text-xl font-bold leading-tight text-gray-900 sm:mb-6 sm:text-2xl md:min-h-[4rem]">{faq.q}</h3>
                    <p className="flex-1 text-base leading-relaxed text-gray-500 md:text-lg">
                      {faq.a}
                    </p>
                  </div>
                  <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-5 sm:px-8 md:px-10 md:py-6">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Help Article &rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 pb-28 md:py-32 md:pb-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white shadow-2xl shadow-indigo-500/20 sm:p-12 md:rounded-[3rem] md:p-20 lg:p-24">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">{t('about.readyTitle')}</h2>
              <p className="text-indigo-100 text-lg md:text-xl leading-relaxed font-medium">
                {t('about.readySubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-900 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all"
                >
                  {t('about.joinFreelancer')}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-lg border border-indigo-400/30 hover:bg-indigo-400 transition-all"
                >
                  {t('about.postProject')}
                </motion.button>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
