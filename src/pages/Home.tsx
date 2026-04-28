import React from 'react';
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
  Orbit,
  Palette,
  Terminal,
  Code,
  Target,
} from 'lucide-react';
import { useAuth } from '../App';

export default function Home() {
  const { user, login } = useAuth();

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
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-semibold">
              <Zap className="h-4 w-4" fill="currentColor" />
              <span>Matching top 1% talent with global industry leaders</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-sans font-bold tracking-tight text-gray-900">
              The universe of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">work</span> is expanding.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Orbit is the professional freelancing ecosystem designed for high-impact teams and elite creators.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {!user ? (
                <button 
                  onClick={login}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <Link 
                  to="/jobs"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  View Market <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <Link 
                to="/jobs"
                className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:border-gray-300 transition-all"
              >
                Browse Projects
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-16 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale">
              <div className="text-2xl font-bold font-sans">Loom</div>
              <div className="text-2xl font-bold font-sans">Vercel</div>
              <div className="text-2xl font-bold font-sans">Miro</div>
              <div className="text-2xl font-bold font-sans">Linear</div>
              <div className="text-2xl font-bold font-sans">Notion</div>
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
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Explore the Ecosystem</h2>
              <p className="text-gray-500 max-w-xl text-lg">Browse high-impact projects across core technical and creative domains.</p>
            </div>
            <Link to="/jobs" className="group flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors py-2">
              Browse all categories <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
              { icon: Code, title: 'Development', count: '1.2k+ jobs', color: 'bg-blue-50 text-blue-600', span: 'md:col-span-2' },
              { icon: Palette, title: 'Design', count: '850+ jobs', color: 'bg-purple-50 text-purple-600', span: 'md:col-span-1' },
              { icon: Zap, title: 'AI & Data', count: '420+ jobs', color: 'bg-amber-50 text-amber-600', span: 'md:col-span-1' },
              { icon: Terminal, title: 'Cybersecurity', count: '150+ jobs', color: 'bg-rose-50 text-rose-600', span: 'md:col-span-1' },
              { icon: Globe, title: 'Web3', count: '280+ jobs', color: 'bg-emerald-50 text-emerald-600', span: 'md:col-span-2' },
              { icon: Target, title: 'Marketing', count: '640+ jobs', color: 'bg-indigo-50 text-indigo-600', span: 'md:col-span-1' },
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
              { label: 'Total Volume', value: '$120M+' },
              { label: 'Active Talent', value: '45,000+' },
              { label: 'Avg Rating', value: '4.9/5' }
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
            <h2 className="text-4xl font-bold text-gray-900">Why the world works on Orbit</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Traditional platforms prioritize volume. We prioritize trust, speed, and precision.</p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { icon: ShieldCheck, title: "Secure Escrow", desc: "Funds are held securely and released only when milestones are approved.", color: "blue" },
              { icon: Globe, title: "Global Reach", desc: "Access talent and projects from 190+ countries with local currency support.", color: "purple" },
              { icon: CheckCircle2, title: "Verified Skills", desc: "Our AI-driven assessment engine ensures you hire the right fit, every time.", color: "emerald" }
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
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Your mission, <br /><span className="text-indigo-400">accelerated.</span></h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  We've streamlined every step of the collaboration process, from matching to final delivery.
                </p>
              </motion.div>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Connect your orbit', desc: 'Auth with Google and set up your distinct professional profile.' },
                  { step: '02', title: 'Launch projects', desc: 'As a client, post high-impact projects. As talent, submit elite proposals.' },
                  { step: '03', title: 'Synchronized work', desc: 'Manage milestones and payments securely through our dedicated workspace.' }
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
                <Orbit className="h-64 w-64 text-indigo-500/20 animate-spin absolute opacity-20" style={{ animationDuration: '20s' }} />
                <div className="relative text-center space-y-6">
                  <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest leading-none">Milestone Reached</p>
                    <h3 className="text-3xl font-bold leading-none">Deploy v1.0</h3>
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
            <h2 className="text-5xl font-bold tracking-tight">Ready to enter the Orbit?</h2>
            <p className="text-xl text-gray-500">Join 45,000+ top professionals and teams scaling their vision today.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/jobs" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              Start Exploring
            </Link>
            {!user && (
              <button onClick={login} className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-bold text-xl hover:border-gray-300 transition-all">
                Join Network
              </button>
            )}
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
}
