import React from 'react';
import { motion } from 'motion/react';
import { Search, Book, MessageCircle, FileText, ExternalLink } from 'lucide-react';

export default function HelpCenter() {
  const categories = [
    { title: 'Getting Started', desc: 'New here? Learn the basics of Orbit.', icon: Book },
    { title: 'Payments & Fees', desc: 'Everything you need to know about money.', icon: FileText },
    { title: 'Safety & Privacy', desc: 'Protecting you and your data.', icon: Search },
    { title: 'Work & Collaboration', desc: 'Tips for successful projects.', icon: MessageCircle },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Search */}
      <div className="bg-indigo-600 pt-32 pb-24 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-bold"
          >
            How can we help?
          </motion.h1>
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search for articles, guides, and tutorials..."
              className="w-full pl-16 pr-8 py-6 rounded-3xl bg-white text-gray-900 border-none focus:ring-4 focus:ring-indigo-300 transition-all text-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
                <cat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-2">{cat.title}</h3>
              <p className="text-gray-500 text-sm">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'How long does verification take?',
              'What payment methods do you support?',
              'How are disputes handled?',
              'Can I hire multiple freelancers for one project?',
              'What are the platform fees?',
              'How do I cancel my subscription?'
            ].map((q, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group">
                <span className="font-medium text-gray-700 group-hover:text-indigo-600">{q}</span>
                <ExternalLink className="h-4 w-4 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
