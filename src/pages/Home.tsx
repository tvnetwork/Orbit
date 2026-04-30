import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Zap,
  Star,
  Orbit as BrandIcon,
  Palette,
  Terminal,
  Code,
  Target,
} from 'lucide-react';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ jobs: 0, talent: 0, volume: 0, rating: 0 });
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Real-time listener for jobs and categories
    const jobsQ = query(collection(db, 'jobs'), where('status', '==', 'open'), limit(500));
    const unsubJobs = onSnapshot(jobsQ, (snap) => {
      const categories: Record<string, number> = {};
      snap.forEach(d => {
        const cat = d.data().category;
        if (cat) categories[cat] = (categories[cat] || 0) + 1;
      });
      setCounts(prev => ({ ...prev, jobs: snap.size }));
      setCatCounts(categories);
    });

    // Real-time listener for talent and ratings
    const talentQ = query(collection(db, 'users'), where('role', '==', 'freelancer'), limit(500));
    const unsubTalent = onSnapshot(talentQ, (snap) => {
      let totalRating = 0;
      let ratingCount = 0;
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.rating) {
          totalRating += data.rating;
          ratingCount++;
        }
      });
      setCounts(prev => ({ 
        ...prev, 
        talent: snap.size,
        rating: ratingCount > 0 ? totalRating / ratingCount : 0
      }));
    });

    // Real-time listener for volume
    const txQ = query(collection(db, 'transactions'), limit(1000));
    const unsubTx = onSnapshot(txQ, (snap) => {
      const totalVolume = snap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setCounts(prev => ({ ...prev, volume: totalVolume }));
    });

    return () => {
      unsubJobs();
      unsubTalent();
      unsubTx();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden"
    >
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-[10px] md:text-sm font-semibold uppercase tracking-wider">
              <Zap className="h-3 w-3 md:h-4 md:w-4" fill="currentColor" />
              <span>{t('home.heroTagline')}</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-sans font-bold tracking-tight text-gray-900 leading-[1.1]">
              {t('home.heroTitleBefore')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{t('home.universeWord')}</span>{t('home.heroTitleAfter')}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
              {t('home.heroSubtitle')}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {!user ? (
                <button 
                  onClick={login}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {t('common.getStarted')} <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <Link 
                  to="/jobs"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {t('common.viewMarket')} <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <Link 
                to="/jobs"
                className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:border-gray-300 transition-all"
              >
                {t('common.browseProjects')}
              </Link>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="pt-24 relative overflow-hidden group"
            >
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
              
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: 30, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="flex w-fit items-center gap-16 grayscale opacity-30 group-hover:opacity-70 group-hover:grayscale-0 transition-all duration-700 cursor-default"
              >
                {[
                  "Google", "Amazon", "Microsoft", "Netflix", "Meta", "Apple", 
                  "Stripe", "Airbnb", "Uber", "Coinbase", "Spotify", "Tesla",
                  // Doubled for seamless loop
                  "Google", "Amazon", "Microsoft", "Netflix", "Meta", "Apple", 
                  "Stripe", "Airbnb", "Uber", "Coinbase", "Spotify", "Tesla"
                ].map((brand, i) => (
                  <div 
                    key={i} 
                    className="text-2xl md:text-3xl font-black font-sans tracking-tighter whitespace-nowrap"
                  >
                    {brand}
                  </div>
                ))}
              </motion.div>
              
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-12 text-center">
                Trusted by elite teams worldwide
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{t('home.exploreTitle')}</h2>
              <p className="text-gray-500 max-w-xl text-lg">{t('home.exploreSubtitle')}</p>
            </div>
            <Link to="/jobs" className="group flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors py-2">
              {t('home.browseAll')} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { id: 'development', icon: Code, title: t('home.categories.development'), count: t('home.categories.jobsCount', { count: catCounts['Development'] || '0' }), color: 'bg-blue-50 text-blue-600', span: 'md:col-span-2' },
              { id: 'design', icon: Palette, title: t('home.categories.design'), count: t('home.categories.jobsCount', { count: catCounts['Design'] || '0' }), color: 'bg-purple-50 text-purple-600', span: 'md:col-span-1' },
              { id: 'ai', icon: Zap, title: t('home.categories.ai'), count: t('home.categories.jobsCount', { count: catCounts['AI & Data'] || '0' }), color: 'bg-amber-50 text-amber-600', span: 'md:col-span-1' },
              { id: 'cyber', icon: Terminal, title: t('home.categories.cyber'), count: t('home.categories.jobsCount', { count: catCounts['Cybersecurity'] || '0' }), color: 'bg-rose-50 text-rose-600', span: 'md:col-span-1' },
              { id: 'web3', icon: Globe, title: t('home.categories.web3'), count: t('home.categories.jobsCount', { count: catCounts['Web3'] || '0' }), color: 'bg-emerald-50 text-emerald-600', span: 'md:col-span-2' },
              { id: 'marketing', icon: Target, title: t('home.categories.marketing'), count: t('home.categories.jobsCount', { count: catCounts['Marketing'] || '0' }), color: 'bg-indigo-50 text-indigo-600', span: 'md:col-span-1' },
            ].map((cat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.01 }}
                onClick={() => window.location.href = '/jobs'}
                className={cn(
                  "p-8 rounded-[2rem] border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5",
                  cat.span
                )}
              >
                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                  <div className={cn("p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500", cat.color)}>
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                    <p className="text-gray-500 font-medium">{cat.count}</p>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { label: t('home.statsVolume'), value: counts.volume > 0 ? `$${(counts.volume / 1000).toFixed(1)}k+` : t('common.loading', { defaultValue: '...' }) },
              { label: t('home.statsTalent'), value: counts.talent > 0 ? `${counts.talent}+` : '10+' },
              { label: t('home.statsRating'), value: counts.rating > 0 ? `${counts.rating.toFixed(1)}/5` : '4.9/5' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 text-center space-y-2 shadow-sm shadow-gray-200/50"
              >
                <p className="text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-4xl font-bold text-indigo-600 font-sans">{stat.value}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-20"
          >
            <h2 className="text-4xl font-bold text-gray-900">{t('home.whyTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('home.whySubtitle')}</p>
          </motion.div>

          {/* New Global Feature Highlight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-24 p-1 rounded-[3rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
          >
            <div className="bg-white rounded-[2.9rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
              <div className="flex-1 space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">
                  <Globe className="h-4 w-4" /> Global Native support
                </div>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                  Work in your native tongue. <span className="text-indigo-600">Collaborate globally.</span>
                </h3>
                <p className="text-xl text-gray-500 leading-relaxed font-medium">
                  We've introduced support for <span className="text-gray-900 font-bold">50+ languages</span> with automatic location detection. VyntaJobs now feels local, wherever you are.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {['English', 'Español', 'Français', 'Deutsch', '日本語', '中文', 'العربية'].map((lang, idx) => (
                    <span key={idx} className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 shadow-sm">
                      {lang}
                    </span>
                  ))}
                  <span className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100">
                    +43 more
                  </span>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {[
                    { flag: '🇺🇸', label: 'Global Search' },
                    { flag: '🇯🇵', label: 'ローカル検索' },
                    { flag: '🇪🇸', label: 'Búsqueda Global' },
                    { flag: '🇸🇦', label: 'بحث عالمي' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                      <span className="text-3xl block mb-2">{item.flag}</span>
                      <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { icon: ShieldCheck, title: t('home.feature1Title'), desc: t('home.feature1Desc'), color: "blue" },
              { icon: Globe, title: t('home.feature2Title'), desc: t('home.feature2Desc'), color: "purple" },
              { icon: CheckCircle2, title: t('home.feature3Title'), desc: t('home.feature3Desc'), color: "emerald" }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="space-y-4 group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                  className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                    feat.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                    feat.color === 'purple' ? "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white" :
                    "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                  )}
                >
                  <feat.icon className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-bold">{feat.title}</h3>
                <p className="text-gray-500">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-3xl -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  {t('home.missionTitle').split(',').map((part, i) => (
                    <React.Fragment key={i}>
                      {i === 0 ? part + ',' : <span className="text-indigo-400 block">{part}</span>}
                    </React.Fragment>
                  ))}
                </h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  {t('home.missionSubtitle')}
                </p>
              </motion.div>

              <div className="space-y-8">
                {[
                  { step: '01', title: t('home.steps.s1Title'), desc: t('home.steps.s1Desc') },
                  { step: '02', title: t('home.steps.s2Title'), desc: t('home.steps.s2Desc') },
                  { step: '03', title: t('home.steps.s3Title'), desc: t('home.steps.s3Desc') }
                ].map((s, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    viewport={{ once: true }}
                    className="flex gap-6 group"
                  >
                    <span className="text-4xl font-black text-white/10 group-hover:text-indigo-500/50 transition-colors duration-500 font-sans">{s.step}</span>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{s.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[4rem] border border-white/10 backdrop-blur-xl flex items-center justify-center p-12 overflow-hidden shadow-2xl">
                <BrandIcon className="h-64 w-64 text-indigo-500/20 animate-spin absolute opacity-20" style={{ animationDuration: '20s' }} />
                <div className="relative text-center space-y-6">
                  <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest leading-none">{t('home.milestoneReached')}</p>
                    <h3 className="text-3xl font-bold leading-none">{t('home.deployV1')}</h3>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl font-bold tracking-tight">{t('home.readyTitle')}</h2>
            <p className="text-xl text-gray-500">{t('home.readySubtitle')}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/jobs" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              {t('home.startExploring')}
            </Link>
            {!user && (
              <button onClick={login} className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-bold text-xl hover:border-gray-300 transition-all">
                {t('home.joinNetwork')}
              </button>
            )}
          </motion.div>
        </div>
      </section>


    </motion.div>
  );
}
