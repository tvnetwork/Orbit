import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Job, Proposal, UserProfile } from '../types';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Clock, 
  User as UserIcon, 
  Send, 
  CheckCircle,
  XCircle,
  Briefcase,
  Calendar,
  AlertTriangle,
  Star as StarIcon,
  Orbit
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalForm, setProposalForm] = useState({ bidAmount: '', coverLetter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const jobSnap = await getDoc(doc(db, 'jobs', id));
        if (jobSnap.exists()) {
          const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;
          setJob(jobData);

          // Fetch proposals if client or if freelancer has applied
          const proposalsSnap = await getDocs(query(collection(db, `jobs/${id}/proposals`)));
          const proposalsData = proposalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
          setProposals(proposalsData);

          if (user) {
            setHasApplied(proposalsData.some(p => p.freelancerId === user.uid));
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `jobs/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || profile?.role !== 'freelancer') return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, `jobs/${id}/proposals`), {
        jobId: id,
        freelancerId: user.uid,
        bidAmount: Number(proposalForm.bidAmount),
        coverLetter: proposalForm.coverLetter,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setHasApplied(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `jobs/${id}/proposals`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalAction = async (proposalId: string, status: 'accepted' | 'rejected') => {
    if (!id) return;
    try {
      await updateDoc(doc(db, `jobs/${id}/proposals`, proposalId), { status });
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
      
      if (status === 'accepted') {
        await updateDoc(doc(db, 'jobs', id), { status: 'in_progress' });
        setJob(prev => prev ? { ...prev, status: 'in_progress' } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${id}/proposals/${proposalId}`);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading project details...</div>;
  if (!job) return <div className="p-12 text-center text-red-500">Project not found.</div>;

  const isClient = user?.uid === job.clientId;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">{job.category}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-wider">{job.status}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{job.title}</h1>
            
            <div className="flex flex-wrap gap-8 py-8 border-y border-gray-50 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Budget</p>
                  <p className="text-lg font-bold">${job.budget.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Type</p>
                  <p className="text-lg font-bold capitalize">{job.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Posted</p>
                  <p className="text-lg font-bold">{formatDate(job.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-indigo max-w-none">
              <h3 className="text-xl font-bold mb-4">Project Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          </motion.div>

          {/* Proposals Section (for Client) */}
          {isClient && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-2">
                Proposals <span className="text-sm font-normal text-gray-400">({proposals.length})</span>
              </h2>
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
                    <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No proposals yet. Your perfect match is on their way!</p>
                  </div>
                ) : (
                  proposals.map(proposal => (
                    <div key={proposal.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold">Freelancer ID: {proposal.freelancerId.slice(0, 8)}...</p>
                            <p className="text-sm text-emerald-600 font-bold">Bid: ${proposal.bidAmount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {proposal.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleProposalAction(proposal.id, 'rejected')}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <XCircle className="h-6 w-6" />
                              </button>
                              <button 
                                onClick={() => handleProposalAction(proposal.id, 'accepted')}
                                className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                              >
                                <CheckCircle className="h-6 w-6" />
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {proposal.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic">"{proposal.coverLetter}"</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Proposals/Actions */}
        <div className="space-y-8">
          {/* Submission Form (for Freelancer) */}
          {!isClient && profile?.role === 'freelancer' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 sticky top-24"
            >
              {hasApplied ? (
                <div className="text-center py-10 space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Application Sent</h3>
                  <p className="text-gray-500 text-sm">The client will review your proposal. You'll be notified of any updates.</p>
                </div>
              ) : job.status !== 'open' ? (
                <div className="text-center py-10 space-y-4">
                  <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                  <h3 className="text-xl font-bold">Project Closed</h3>
                  <p className="text-gray-500 text-sm">This project is no longer accepting proposals.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6">Submit Proposal</h3>
                  <form onSubmit={handleSubmitProposal} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Your Bid ($)</label>
                      <input 
                        required
                        type="number" 
                        placeholder={job.budget.toString()}
                        value={proposalForm.bidAmount}
                        onChange={e => setProposalForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Cover Letter</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Why are you the best fit for this project?"
                        value={proposalForm.coverLetter}
                        onChange={e => setProposalForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Orbit className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Proposal
                    </button>
                    <p className="text-[10px] text-center text-gray-400">Orbit charges a 5% service fee on successful payments.</p>
                  </form>
                </>
              )}
            </motion.div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">About the Client</h4>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none mb-1">Elite Partner</p>
                  <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {job.clientId.slice(0, 16)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Rating</p>
                <div className="flex items-center text-yellow-500 gap-1 mt-0.5">
                  <StarIcon className="h-3 w-3 fill-current" />
                  <span className="font-bold text-gray-900 text-sm">4.9/5</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Hires</p>
                <p className="font-bold text-gray-900 text-sm">24 projects</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Status</p>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-bold">Payment Verified</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Orbit className="h-4 w-4" />
                <span className="text-sm font-bold">Identity Confirmed</span>
              </div>
            </div>

            <button className="w-full py-4 text-sm font-bold text-gray-500 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


