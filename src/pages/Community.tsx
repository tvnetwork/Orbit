import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Users, Award, Trophy } from 'lucide-react';

export default function Community() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex p-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold px-4">
              COMMUNITY ECOSYSTEM
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              A home for the <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-600">extraordinary</span>.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Orbit isn't just a platform; it's a thriving ecosystem of creators, developers, and visionaries. Connect, collaborate, and grow together.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all">
                Access the Forum
              </button>
              <button className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold hover:border-gray-300 transition-all">
                Events Calendar
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-8 bg-indigo-50 rounded-[2rem] space-y-4"
            >
              <Users className="h-10 w-10 text-indigo-600" />
              <h3 className="text-xl font-bold">Groups</h3>
              <p className="text-sm text-gray-600">Join specialized cohorts for your niche.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-emerald-50 rounded-[2rem] space-y-4 lg:mt-12"
            >
              <MessageSquare className="h-10 w-10 text-emerald-600" />
              <h3 className="text-xl font-bold">Discussions</h3>
              <p className="text-sm text-gray-600">Share insights and solve complex problems.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-purple-50 rounded-[2rem] space-y-4"
            >
              <Award className="h-10 w-10 text-purple-600" />
              <h3 className="text-xl font-bold">Mentorship</h3>
              <p className="text-sm text-gray-600">Learn from seasoned vets in your field.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-orange-50 rounded-[2rem] space-y-4 lg:mt-12"
            >
              <Trophy className="h-10 w-10 text-orange-600" />
              <h3 className="text-xl font-bold">Showcase</h3>
              <p className="text-sm text-gray-600">Exhibit your best work to global leads.</p>
            </motion.div>
          </div>
        </div>

        <section className="mt-40 text-center space-y-12">
          <h2 className="text-4xl font-bold">Orbit Community Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Members', value: '450K+' },
              { label: 'Daily Topics', value: '1,200+' },
              { label: 'Successful Matches', value: '85K+' },
              { label: 'Average Growth', value: '320%' }
            ].map((stat, i) => (
              <div key={i} className="p-8 border-b-2 border-indigo-100">
                <p className="text-gray-500 font-medium mb-2">{stat.label}</p>
                <h4 className="text-4xl font-bold text-gray-900">{stat.value}</h4>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
