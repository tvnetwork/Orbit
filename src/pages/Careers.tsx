import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Zap, Coffee } from 'lucide-react';

export default function Careers() {
  const jobs = [
    { title: 'Senior Frontend Engineer', team: 'Product', location: 'Remote / Global' },
    { title: 'Product Designer', team: 'Design', location: 'London / Remote' },
    { title: 'Machine Learning Lead', team: 'Engineering', location: 'San Francisco / Remote' },
    { title: 'Head of Trust & Safety', team: 'Legal', location: 'Remote' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        <div className="text-center space-y-6 mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tight text-gray-900"
          >
            Come build the <span className="text-indigo-600">future</span>.
          </motion.h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Orbit is a distributed team of dreamers, builders, and creators. We're on a mission to expand the possibilities of human collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {[
            { icon: Sparkles, label: 'Visionary Culture', desc: 'Work on problems that matter.' },
            { icon: Heart, label: 'People First', desc: 'Unlimited PTO and wellness benefits.' },
            { icon: Zap, label: 'Speed & Flow', desc: 'Autonomy to move fast and break things.' },
            { icon: Coffee, label: 'Great Vibes', desc: 'Monthly retreats and team bonding.' }
          ].map((benefit, i) => (
            <div key={i} className="p-8 border border-gray-100 rounded-3xl hover:border-indigo-200 transition-all space-y-4 shadow-sm shadow-gray-50">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{benefit.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold">Open Positions</h2>
            <p className="text-gray-500 font-medium">All positions are open to global talent.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 10 }}
                className="p-8 bg-gray-50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group hover:bg-indigo-50 transition-colors"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 font-medium">
                    <span>{job.team}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <button className="bg-white px-6 py-3 rounded-xl border border-gray-200 font-bold group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
