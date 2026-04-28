import React from 'react';
import { motion } from 'motion/react';
import { Orbit, Users, Target, Rocket } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-6"
          >
            <Orbit className="h-8 w-8" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">Redefining the Universe of Work</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Orbit was founded in 2024 with a simple mission: to build the most trusted, efficient, and inspiring marketplace for elite talent and ambitious companies.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-gray-200/50 space-y-6 group transition-all hover:shadow-xl"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Community First</h3>
            <p className="text-gray-500 leading-relaxed">We believe that great work happens when talented individuals are empowered and respected. Our platform is built around our community.</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-gray-200/50 space-y-6 group transition-all hover:shadow-xl"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Absolute Precision</h3>
            <p className="text-gray-500 leading-relaxed">From our AI-powered matching engine to our milestone-based payments, we bring surgical precision to global collaboration.</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-gray-200/50 space-y-6 group transition-all hover:shadow-xl"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Infinite Growth</h3>
            <p className="text-gray-500 leading-relaxed">We don't just find you work; we give you the tools and insights to grow your business or scale your team to the stars.</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-16 bg-gray-900 rounded-[3rem] text-white text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)] pointer-events-none" />
          <h2 className="text-4xl font-bold relative z-10">Join the Orbit</h2>
          <p className="text-gray-400 max-w-xl mx-auto relative z-10">Be part of the global movement that's changing how the world works together.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all relative z-10 shadow-xl"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
