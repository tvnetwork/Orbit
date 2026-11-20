import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Orbit, 
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
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function About() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ jobs: 0, talent: 0, clients: 0 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubJobs = onSnapshot(query(collection(db, 'jobs'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, jobs: snap.size }));
    }, () => {});

    const unsubTalent = onSnapshot(query(collection(db, 'users'), where('role', '==', 'freelancer'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, talent: snap.size }));
    }, () => {});

    const unsubClients = onSnapshot(query(collection(db, 'users'), where('role', '==', 'client'), limit(100)), (snap) => {
      setCounts(prev => ({ ...prev, clients: snap.size }));
    }, () => {});

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
      q: t('about.faqs.q1.question', { defaultValue: 'How does VyntaJobs verify talent?' }),
      a: t('about.faqs.q1.answer', { defaultValue: 'We use a combination of AI-driven technical assessments, portfolio verification, and peer reviews to ensure elite talent enters the network.' })
    },
    {
      q: t('about.faqs.q2.question', { defaultValue: 'Is my capital safe in escrow?' }),
      a: t('about.faqs.q2.answer', { defaultValue: 'Absolutely. Funds are only released when you approve a milestone. Our secure treasury ensures full financial transparency for both parties.' })
    },
    {
      q: t('about.faqs.q3.question', { defaultValue: 'What happens if there is a dispute?' }),
      a: t('about.faqs.q3.answer', { defaultValue: 'In the rare case of a dispute, our specialized Resolution Guild provides impartial mediation based on the defined project scope.' })
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-24 md:pb-24 md:pt-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Orbit className="h-4 w-4" />
              {t('about.heroMission', { defaultValue: 'Our Mission' })}
            </motion.div>
            <h1 className="mb-6 text-4xl font-black leading-[0.95] tracking-tighter text-gray-900 dark:text-white sm:text-5xl md:mb-8 md:text-7xl lg:text-8xl">
              Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">Universe</span> of Work.
            </h1>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 md:text-2xl">
              {t('about.heroSubtitle', { defaultValue: "We're building an autonomous talent ecosystem where distance doesn't exist, and the only limit is your imagination." })}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 dark:bg-indigo-950/20 -z-10 rounded-bl-[10rem] pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 border-y border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 md:gap-12">
          {[
            { label: t('about.statsTalent', { defaultValue: 'Verified Experts' }), value: counts.talent > 0 ? `${counts.talent}+` : '150+' },
            { label: t('about.statsClients', { defaultValue: 'Enterprise Clients' }), value: counts.clients > 0 ? `${counts.clients}+` : '80+' },
            { label: t('about.statsProjects', { defaultValue: 'Milestones Completed' }), value: counts.jobs > 0 ? `${counts.jobs}+` : '320+' },
            { label: t('about.statsReach', { defaultValue: 'Global Reach' }), value: 'Global' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="space-y-1 text-center md:text-left"
            >
              <p className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter font-mono">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end md:gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">{t('about.valuesTitle', { defaultValue: 'Values that drive the future.' })}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('about.valuesSubtitle', { defaultValue: 'We build relationships grounded in elite quality and cryptographic trust.' })}</p>
            </div>
            <Link to="/jobs" className="group flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-3 transition-all">
              <span>{t('home.browseAll', { defaultValue: 'Browse Market' })}</span> <ArrowRight className="h-5 w-5" />
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
                title: t('about.values.integrity.title', { defaultValue: 'Radical Integrity' }), 
                desc: t('about.values.integrity.desc', { defaultValue: 'We prioritize the mission over the margin, ensuring absolute transparency in every milestone.' }),
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-950/60'
              },
              { 
                icon: Zap, 
                title: t('about.values.velocity.title', { defaultValue: 'Pure Velocity' }), 
                desc: t('about.values.velocity.desc', { defaultValue: 'We believe in moving fast without breaking things. Efficiency is our foundational protocol.' }),
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-950/60'
              },
              { 
                icon: Award, 
                title: t('about.values.quality.title', { defaultValue: 'Elite Quality' }), 
                desc: t('about.values.quality.desc', { defaultValue: 'Only the top talent makes it through our vetting process. Excellence is non-negotiable.' }),
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-950/60'
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="group p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-800/60 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/50 transition-all duration-500"
              >
                <div className={cn("p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform", value.bg, value.color)}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-900/95 py-20 text-white md:py-32 border-y border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 md:gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">{t('about.storyTitle', { defaultValue: 'Our Story began with a simple question.' })}</h2>
            <div className="space-y-6 text-base leading-relaxed text-slate-300 dark:text-slate-300 sm:text-lg">
              <p>"{t('about.storyP1', { defaultValue: "What if the world's most talented people didn't need to live in Silicon Valley to work on its biggest problems? We saw talented creators tethered to locations, and visionary clients throttled by local talent scarcity." })}"</p>
              <p>{t('about.storyP2', { defaultValue: 'We built VyntaJobs as a synchronized workspace where trust is guaranteed by escrow and quality is enforced by community-driven standards.' })}</p>
            </div>
            <div className="flex gap-6 pt-4 sm:gap-8">
              <div>
                <p className="text-3xl font-black text-white">50+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Localizations</p>
              </div>
              <div className="w-px bg-slate-800" />
              <div>
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global Escrow</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl rotate-3 flex items-center justify-center relative z-10 overflow-hidden group shadow-2xl">
              <Globe2 className="h-32 w-32 text-white/30 animate-pulse sm:h-40 sm:w-40 md:h-48 md:w-48" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -inset-4 border border-indigo-500/30 rounded-3xl -rotate-3 -z-10" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50/70 dark:bg-slate-950 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center md:mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{t('about.faqTitle', { defaultValue: 'Common Questions' })}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">{t('about.faqSubtitle', { defaultValue: 'Everything you need to know about working within VyntaJobs.' })}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/50 transition-all duration-500 cursor-pointer group"
                >
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {faq.q}
                      </h3>
                      <ChevronDown className={cn("h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 md:hidden", isOpen && "rotate-180 text-indigo-600")} />
                    </div>
                    <p className={cn("text-sm sm:text-base leading-relaxed text-gray-500 dark:text-gray-400 flex-1", !isOpen && "line-clamp-4 md:line-clamp-none")}>
                      {faq.a}
                    </p>
                  </div>
                  <div className="border-t border-gray-50 dark:border-slate-800/80 bg-gray-50/60 dark:bg-slate-800/30 px-6 py-4 sm:px-8 flex items-center justify-between">
                    <Link 
                      to="/contact" 
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <span>Help Article</span> <ArrowRight className="h-3 w-3" />
                    </Link>
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
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-center text-white shadow-2xl shadow-indigo-500/20 sm:p-12 md:rounded-[3rem] md:p-20 lg:p-24">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">{t('about.readyTitle', { defaultValue: 'Ready for a new vantage?' })}</h2>
              <p className="text-indigo-100 text-lg md:text-xl leading-relaxed font-medium">
                {t('about.readySubtitle', { defaultValue: "Whether you're hiring for a moonshot project or looking for your next challenge, the best work starts here." })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link 
                  to="/freelancers"
                  className="inline-flex items-center justify-center bg-white text-indigo-950 hover:bg-slate-100 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-indigo-950/20 transition-all hover:scale-105 active:scale-95"
                >
                  {t('about.joinFreelancer', { defaultValue: 'Join as Freelancer' })}
                </Link>
                <Link 
                  to="/jobs"
                  className="inline-flex items-center justify-center bg-indigo-500/80 hover:bg-indigo-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {t('about.postProject', { defaultValue: 'Post a Project' })}
                </Link>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
