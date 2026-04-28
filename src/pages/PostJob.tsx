import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  DollarSign, 
  Clock, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Orbit
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function PostJob() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    type: 'fixed' as 'fixed' | 'hourly',
    category: 'Development'
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'client') return;

    setLoading(true);
    try {
      const jobData = {
        clientId: user.uid,
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
        type: form.type,
        category: form.category,
        status: 'open',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'jobs'), jobData);
      navigate('/jobs');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'jobs');
    } finally {
      setLoading(false);
    }
  };

  const enhanceDescription = async () => {
    if (!form.title || !form.description) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert technical recruiter. Improve the following job description to be more professional, clear, and attractive to top talent. Keep the core requirements but make it sound elite.
        
        Title: ${form.title}
        Current Description: ${form.description}
        
        Only return the improved description text. No preamble.`,
      });
      if (response.text) {
        setForm(prev => ({ ...prev, description: response.text! }));
      }
    } catch (err) {
      console.error("AI Enhancement failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!user || profile?.role !== 'client') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold">Client Access Only</h2>
        <p className="text-gray-500 mt-2">Only registered clients can post new projects on Orbit.</p>
        <button onClick={() => navigate('/jobs')} className="mt-8 text-indigo-600 font-bold hover:underline">
          Back to marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-600 rounded-2xl">
              <PlusCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Project</h1>
              <p className="text-gray-500">Define your project requirements and find the perfect match.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Project Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Build a high-performance React dashboard"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                <select 
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                >
                  <option>Development</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Writing</option>
                  <option>Data Science</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Budget Type</label>
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'fixed' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'fixed' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <DollarSign className="h-4 w-4" /> Fixed Price
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'hourly' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'hourly' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <Clock className="h-4 w-4" /> Hourly Rate
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Budget Amount ($)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                value={form.budget}
                onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Project Description</label>
                <button 
                  type="button"
                  onClick={enhanceDescription}
                  disabled={aiLoading || !form.title || !form.description}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Orbit className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI Enhance
                </button>
              </div>
              <textarea 
                required
                rows={8}
                placeholder="Describe the scope, deliverables, and requirements..."
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all leading-relaxed"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? <Orbit className="h-6 w-6 animate-spin" /> : <Send className="h-5 w-5" />}
              Publish Project
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const PlusCircle = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
  </svg>
)
