import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Sparkles, 
  DollarSign, 
  Clock, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Settings,
  Cpu,
  Target
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cn } from '../lib/utils';

export default function PostJob() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    type: 'fixed' as 'fixed' | 'hourly',
    skills: [] as string[],
    newSkill: '',
    category: 'Development',
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async () => {
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
        skills: form.skills,
        status: 'open',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'jobs'), jobData);
      navigate('/client/dashboard');
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
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`You are an expert technical recruiter. Improve the following job description to be more professional, clear, and attractive to top talent. Keep the core requirements but make it sound elite.
        
        Title: ${form.title}
        Current Description: ${form.description}
        
        Only return the improved description text. No preamble.`);
      const response = await result.response;
      const text = response.text();
      if (text) {
        setForm(prev => ({ ...prev, description: text }));
      }
    } catch (err) {
      console.error("AI Enhancement failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newSkill.trim() && !form.skills.includes(form.newSkill.trim())) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  if (!user || profile?.role !== 'client') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold">Client Access Only</h2>
        <p className="text-gray-500 mt-2">Only registered clients can post new projects in our elite database.</p>
        <button onClick={() => navigate('/jobs')} className="mt-8 text-indigo-600 font-bold hover:underline">
          Back to Marketplace
        </button>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Identity', icon: Target },
    { number: 2, title: 'Requirements', icon: Settings },
    { number: 3, title: 'Budget', icon: DollarSign }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-16 px-12 relative">
          <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10" />
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 font-bold",
                step === s.number ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110" : 
                step > s.number ? "bg-emerald-500 text-white" : "bg-white text-gray-400 border border-gray-100"
              )}>
                {step > s.number ? <CheckCircle2 className="h-6 w-6" /> : s.number}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                step === s.number ? "text-gray-900" : "text-gray-400"
              )}>{s.title}</span>
            </div>
          ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-xl shadow-indigo-500/5 min-h-[500px] flex flex-col"
        >
          {step === 1 && (
            <div className="space-y-10 flex-1">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Identity</h2>
                <p className="text-gray-500 mt-1">Define the core vision of your project.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior React Developer for Fintech App"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 outline-none transition-all text-lg font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Description</label>
                    <button 
                      onClick={enhanceDescription}
                      disabled={aiLoading || !form.title || !form.description}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 group"
                    >
                      {aiLoading ? <Sparkles className="h-3 w-3 animate-pulse" /> : <Sparkles className="h-3 w-3" />}
                      AI Enhance
                    </button>
                  </div>
                  <textarea 
                    rows={6}
                    placeholder="Describe the scope, technical challenges, and goals..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 flex-1">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Required Expertise</h2>
                <p className="text-gray-500 mt-1">What skills are mandatory for this success?</p>
              </div>

              <div className="space-y-8">
                <form onSubmit={addSkill} className="space-y-3">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Add Skill</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="e.g. TypeScript, AWS, Figma"
                      value={form.newSkill}
                      onChange={e => setForm(prev => ({ ...prev, newSkill: e.target.value }))}
                      className="flex-1 px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 outline-none transition-all"
                    />
                    <button 
                      type="submit"
                      className="bg-gray-900 text-white px-8 rounded-3xl font-bold hover:bg-black transition-all"
                    >
                      Add
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-3">
                  {form.skills.map(skill => (
                    <div key={skill} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-bold group">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                        <ChevronRight className="h-4 w-4 rotate-45" />
                      </button>
                    </div>
                  ))}
                  {form.skills.length === 0 && (
                    <div className="text-gray-400 text-sm font-medium italic">No skills added yet...</div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Category</label>
                  <select 
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 flex-1">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Budget & Escrow</h2>
                <p className="text-gray-500 mt-1">Set the financial parameters for your project.</p>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest text-center block">Budget Type</label>
                  <div className="flex p-2 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <button 
                      onClick={() => setForm(prev => ({ ...prev, type: 'fixed' }))}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl text-sm font-bold transition-all",
                        form.type === 'fixed' ? "bg-white shadow-lg shadow-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <DollarSign className="h-5 w-5" /> Fixed Price
                    </button>
                    <button 
                      onClick={() => setForm(prev => ({ ...prev, type: 'hourly' }))}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl text-sm font-bold transition-all",
                        form.type === 'hourly' ? "bg-white shadow-lg shadow-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Clock className="h-5 w-5" /> Hourly Rate
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest text-center block">Total Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={form.budget}
                      onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-16 py-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-center text-4xl font-black focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 outline-none transition-all placeholder:text-gray-200"
                    />
                  </div>
                  <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Elite talent typically starts at $500+</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center gap-6 pt-12 border-t border-gray-50">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-8 py-5 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-5 w-5" /> Back
              </button>
            )}
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !form.title}
                className="flex-1 bg-gray-900 text-white p-5 rounded-3xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                Continue to {steps[step].title}
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-all" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading || !form.budget}
                className="flex-1 bg-indigo-600 text-white p-5 rounded-3xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {loading ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
                Publish Elite Project
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
