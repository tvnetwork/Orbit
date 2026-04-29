import React from 'react';
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

export default function About() {
  const { t } = useTranslation();

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
      q: "How does VyntaJobs verify freelancers?",
      a: "Every freelancer undergoes a rigorous 4-step identity and portfolio verification process to ensure only the top 3% enter our elite talent cloud."
    },
    {
      q: "Is payment secure?",
      a: "Yes. VyntaJobs uses a milestone-based escrow system. Funds are held securely until you approve the work delivered."
    },
    {
      q: "Can I manage a large team on VyntaJobs?",
      a: "Absolutely. Our platform is designed for scale, allowing companies to manage multiple projects and dozens of freelancers from a single mission control dashboard."
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
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
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 tracking-tighter leading-[0.9]">
              Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Universe</span> of Work.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl leading-relaxed font-medium">
              {t('about.heroSubtitle')}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 -z-10 rounded-bl-[10rem]" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: t('about.statsTalent'), value: '150k+' },
            { label: t('about.statsClients'), value: '240+' },
            { label: t('about.statsProjects'), value: '1.2M' },
            { label: t('about.statsReach'), value: '180+' }
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
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
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
                title: 'Radical Integrity', 
                desc: 'Transparency is our default state. From pricing to project progress, we believe in full visibility.',
                color: 'blue'
              },
              { 
                icon: Zap, 
                title: 'Pure Velocity', 
                desc: 'Our engine is optimized for speed without compromising depth. Get matched and started in minutes.',
                color: 'purple'
              },
              { 
                icon: Award, 
                title: 'Elite Quality', 
                desc: 'We curate excellence. Every line of code, every design pixel, and every word matters.',
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
      <section className="py-32 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold tracking-tight">{t('about.storyTitle')}</h2>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>"What if the world's most talented people didn't need to live in Silicon Valley to work on its biggest problems?"</p>
              <p>In 2026, VyntaJobs was born to bridge the gap between imagination and execution. We realized that traditional freelancing was broken—plagued by low trust and poor communication. We set out to build a platform that treated freelancers like founders and clients like partners.</p>
              <p>Today, VyntaJobs is more than a marketplace; it's a launchpad for the next generation of global builders.</p>
            </div>
            <div className="pt-4 flex gap-8">
              <div>
                <p className="text-3xl font-bold text-white">2026</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Founded</p>
              </div>
              <div className="w-px bg-gray-800" />
              <div>
                <p className="text-3xl font-bold text-white">Global</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Presence</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-indigo-600 rounded-3xl rotate-3 flex items-center justify-center relative z-10 overflow-hidden group">
              <Globe2 className="h-48 w-48 text-white/20 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="absolute -inset-4 border border-indigo-500/30 rounded-3xl -rotate-3 -z-10" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
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
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight min-h-[4rem]">{faq.q}</h3>
                    <p className="text-gray-500 text-lg leading-relaxed flex-1">
                      {faq.a}
                    </p>
                  </div>
                  <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-50">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Help Article &rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 pb-48">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative p-16 md:p-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-white overflow-hidden text-center shadow-2xl shadow-indigo-500/20">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">{t('about.readyTitle')}</h2>
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
