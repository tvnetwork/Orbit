import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Send, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Milestone {
  id: string;
  title: string;
  amount: string;
}

export default function SubmitProposal() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    coverLetter: '',
    bidAmount: '',
    duration: '1 month',
    milestones: [] as Milestone[]
  });

  useEffect(() => {
    if (jobId) {
      getDoc(doc(db, 'jobs', jobId)).then(snap => {
        if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
        setLoading(false);
      });
    }
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jobId) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'proposals'), {
        jobId,
        freelancerId: user.uid,
        coverLetter: form.coverLetter,
        bidAmount: Number(form.bidAmount),
        duration: form.duration,
        milestones: form.milestones,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      navigate('/freelancer/proposals');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'proposals');
    } finally {
      setSubmitting(false);
    }
  };

  const addMilestone = () => {
    setForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { id: Math.random().toString(36).substr(2, 9), title: '', amount: '' }]
    }));
  };

  const removeMilestone = (id: string) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const improveCoverLetter = async () => {
    if (!form.coverLetter || !job) return;
    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are an elite freelancer. Improve the following cover letter to be more persuasive, professional, and highlight relevant expertise for this job.
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Current Draft: ${form.coverLetter}
      
      Only return the improved letter. No preamble.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) setForm(prev => ({ ...prev, coverLetter: text }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>;

  return (
    <div className="bg-gray-50 min-h-screen py-20 pb-40">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Job Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Submit Proposal</h1>
                  <p className="text-gray-500 font-medium">Draft your winning proposal for this project.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Cover Letter</label>
                    <button 
                      type="button"
                      onClick={improveCoverLetter}
                      disabled={aiLoading || !form.coverLetter}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
                    >
                      {aiLoading ? <Sparkles className="h-3 w-3 animate-pulse" /> : <Sparkles className="h-3 w-3" />}
                      AI Refine
                    </button>
                  </div>
                  <textarea 
                    required
                    rows={12}
                    placeholder="Tell the client why you're the perfect fit for this role..."
                    value={form.coverLetter}
                    onChange={e => setForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 transition-all leading-relaxed"
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Project Milestones</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Break down your deliverables</p>
                    </div>
                    <button 
                      type="button"
                      onClick={addMilestone}
                      className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.milestones.map((m, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={m.id} 
                        className="flex gap-4 items-start bg-gray-50 p-6 rounded-3xl border border-gray-100"
                      >
                        <div className="flex-1 space-y-4">
                          <input 
                            type="text"
                            placeholder="Milestone title (e.g. Initial Research & Wireframes)"
                            value={m.title}
                            onChange={e => updateMilestone(m.id, 'title', e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-300"
                          />
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                              type="number"
                              placeholder="Amount"
                              value={m.amount}
                              onChange={e => updateMilestone(m.id, 'amount', e.target.value)}
                              className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeMilestone(m.id)}
                          className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ))}
                    {form.milestones.length === 0 && (
                      <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-sm font-medium text-gray-400 italic">No milestones defined. Recommended for larger projects.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 border-t border-gray-50 flex gap-4">
                  <div className="flex-1">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? 'Transmitting...' : 'Submit Proposal'}
                      <Send className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] rounded-full -mr-16 -mt-16" />
               <h3 className="text-xl font-black mb-8">Bid Summary</h3>
               <div className="space-y-8">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bid Amount (USD)</label>
                   <div className="relative">
                     <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                     <input 
                       type="number"
                       value={form.bidAmount}
                       onChange={e => setForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                       className="w-full bg-white/10 border border-white/10 rounded-3xl px-16 py-6 text-3xl font-black focus:outline-none focus:ring-4 focus:ring-white/5 transition-all text-center"
                       placeholder="0"
                     />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Duration</label>
                   <select 
                     value={form.duration}
                     onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                     className="w-full bg-white/10 border border-white/10 rounded-3xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-white/5 transition-all"
                   >
                     <option value="Less than 1 month">Less than 1 month</option>
                     <option value="1 to 3 months">1 to 3 months</option>
                     <option value="3 to 6 months">3 to 6 months</option>
                     <option value="More than 6 months">More than 6 months</option>
                   </select>
                 </div>
               </div>

               <div className="mt-10 pt-10 border-t border-white/10 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-400 font-medium tracking-tight">Service Fee (10%)</span>
                   <span className="font-bold text-red-400">-${(Number(form.bidAmount) * 0.1).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-lg">
                   <span className="text-white font-black tracking-tight">You'll Receive</span>
                   <span className="font-black text-emerald-400">${(Number(form.bidAmount) * 0.9).toFixed(2)}</span>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
               <h4 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-4 mb-4">Job Quick Glimpse</h4>
               <div className="space-y-4">
                 <div className="flex gap-4">
                   <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                     <Briefcase className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Fixed Budget</p>
                     <p className="font-black text-gray-900 tracking-tight leading-tight">${job.budget}</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                     <Clock className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Category</p>
                     <p className="font-black text-gray-900 tracking-tight leading-tight">{job.category}</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
