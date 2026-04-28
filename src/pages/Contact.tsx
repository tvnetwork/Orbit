import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-6xl font-bold tracking-tight text-gray-900 leading-none">Get in touch.</h1>
              <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                Have questions about the platform? Need help with a project? Our team is here to support you 24/7.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-indigo-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Email us</p>
                  <p className="text-lg font-bold">support@orbit.global</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-purple-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Our HQ</p>
                  <p className="text-lg font-bold">One Infinity Loop, San Francisco</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <h3 className="text-xl font-bold">Live Support</h3>
              </div>
              <p className="text-indigo-100 opacity-80 text-sm">Our typical response time for live chat is under 2 minutes.</p>
              <button className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold shadow-lg shadow-indigo-900/20">
                Start Chat Now
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">First Name</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Last Name</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input type="email" className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium" placeholder="jane@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Subject</label>
              <select className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium appearance-none">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Enterprise Sales</option>
                <option>Media & PR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Message</label>
              <textarea rows={6} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none" placeholder="Tell us how we can help..." />
            </div>
            <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              Send Message <Send className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
