import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Job, Proposal, UserProfile } from '../types';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
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
  Orbit as BrandIcon,
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../lib/utils';

import ReactMarkdown from 'react-markdown';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<UserProfile | null>(null);
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

          // Fetch client profile
          const clientSnap = await getDoc(doc(db, 'users', jobData.clientId));
          if (clientSnap.exists()) {
            setClientProfile(clientSnap.data() as UserProfile);
          }

          // Fetch assigned freelancer profile if exists
          if (jobData.assignedFreelancerId) {
            const freelancerSnap = await getDoc(doc(db, 'users', jobData.assignedFreelancerId));
            if (freelancerSnap.exists()) {
              setFreelancerProfile(freelancerSnap.data() as UserProfile);
            }
          }

          // Fetch proposals if client or if freelancer has applied
          const proposalsSnap = await getDocs(query(
            collection(db, 'proposals'), 
            where('jobId', '==', id)
          ));
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
      await addDoc(collection(db, 'proposals'), {
        jobId: id,
        freelancerId: user.uid,
        bidAmount: Number(proposalForm.bidAmount),
        coverLetter: proposalForm.coverLetter,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setHasApplied(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'proposals');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalAction = async (proposalId: string, status: 'accepted' | 'rejected') => {
    if (!id || !job) return;
    try {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) return;

      await updateDoc(doc(db, 'proposals', proposalId), { status });
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
      
      if (status === 'accepted') {
        const updateData: any = { 
          status: 'in_progress',
          assignedFreelancerId: proposal.freelancerId,
          acceptedProposalId: proposalId,
          updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, 'jobs', id), updateData);
        setJob(prev => prev ? { ...prev, ...updateData } : null);

        // Auto-create chat if it doesn't exist
        const chatParticipants = [job.clientId, proposal.freelancerId].sort();
        const chatQuery = query(
          collection(db, 'chats'),
          where('participantIds', '==', chatParticipants)
        );
        const chatSnap = await getDocs(chatQuery);
        
        let chatId;
        if (chatSnap.empty) {
          const newChat = await addDoc(collection(db, 'chats'), {
            participantIds: chatParticipants,
            updatedAt: serverTimestamp(),
            lastMessage: 'Proposal accepted - Start the conversation!',
            lastSenderId: job.clientId
          });
          chatId = newChat.id;
        } else {
          chatId = chatSnap.docs[0].id;
        }
        
        navigate(`/messages?chatId=${chatId}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${id}/proposals/${proposalId}`);
    }
  };

  if (loading) return <div className="p-12 text-center">{t('jobs.loadingDetails')}</div>;
  if (!job) return <div className="p-12 text-center text-red-500">{t('jobs.notFound')}</div>;

  const isClient = user?.uid === job.clientId;
  const isDeadlinePassed = job.deadline ? new Date() > new Date(job.deadline) : false;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5"
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
                  <p className="text-xs text-gray-500 font-bold uppercase">{t('jobs.budget')}</p>
                  <p className="text-lg font-bold">${job.budget.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">{t('jobs.budgetType')}</p>
                  <p className="text-lg font-bold capitalize">{job.type === 'fixed' ? t('jobs.filterFixed') : t('jobs.filterHourly')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">{t('jobs.posted')}</p>
                  <p className="text-lg font-bold">{formatDate(job.createdAt)}</p>
                </div>
              </div>
              {job.duration && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">{t('jobs.duration')}</p>
                    <p className="text-lg font-bold">{job.duration}</p>
                  </div>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-xl text-red-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">{t('jobs.deadline')}</p>
                    <p className={`text-lg font-bold ${isDeadlinePassed ? 'text-red-600' : ''}`}>{formatDate(job.deadline)}</p>
                  </div>
                </div>
              )}
            </div>
 
            <div className="prose prose-indigo max-w-none">
              <h3 className="text-xl font-bold mb-4">{t('jobs.description')}</h3>
              <div className="text-gray-600 leading-relaxed markdown-container">
                <ReactMarkdown>{job.description}</ReactMarkdown>
              </div>
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
                {t('jobs.proposalsCount', { count: proposals.length })}
              </h2>
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
                    <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('jobs.noProposalsYet')}</p>
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
                            <Link to={`/profile/${proposal.freelancerId}`} className="font-bold hover:text-indigo-600 transition-colors">{t('jobs.freelancerId')}: {proposal.freelancerId.slice(0, 8)}...</Link>
                            <p className="text-sm text-emerald-600 font-bold">{t('jobs.budget')}: ${proposal.bidAmount}</p>
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
                      <div className="text-gray-600 text-sm italic markdown-container">
                        <ReactMarkdown>{proposal.coverLetter}</ReactMarkdown>
                      </div>
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
                  <h3 className="text-xl font-bold">{t('jobs.applicationSent')}</h3>
                  <p className="text-gray-500 text-sm">{t('jobs.applicationSentDesc')}</p>
                  
                  {proposals.find(p => p.freelancerId === user?.uid)?.status === 'accepted' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        const chatParticipants = [job.clientId, user!.uid].sort();
                        const chatQuery = query(
                          collection(db, 'chats'),
                          where('participantIds', '==', chatParticipants)
                        );
                        const chatSnap = await getDocs(chatQuery);
                        if (!chatSnap.empty) {
                          navigate(`/messages?chatId=${chatSnap.docs[0].id}`);
                        }
                      }}
                      className="w-full mt-4 bg-emerald-600 text-white p-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {t('jobs.chatWithClient')}
                    </motion.button>
                  )}
                </div>
              ) : (job.status !== 'open' || isDeadlinePassed) ? (
                <div className="text-center py-10 space-y-4">
                  <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                  <h3 className="text-xl font-bold">{isDeadlinePassed ? t('jobs.deadlinePassed') : t('jobs.projectClosed')}</h3>
                  <p className="text-gray-500 text-sm">
                    {isDeadlinePassed 
                      ? t('jobs.deadlinePassedDesc') 
                      : t('jobs.projectClosedDesc')}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6">{t('jobs.submitProposal')}</h3>
                  <form onSubmit={handleSubmitProposal} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">{t('jobs.yourBid')}</label>
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
                      <label className="text-xs font-bold text-gray-500 uppercase">{t('jobs.coverLetter')}</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder={t('jobs.coverLetterPlaceholder')}
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
                      {submitting ? <BrandIcon className="h-5 w-5 animate-pulse" /> : <Send className="h-4 w-4" />}
                      {t('jobs.sendProposal')}
                    </button>
                    <p className="text-[10px] text-center text-gray-400">{t('jobs.serviceFeeNote')}</p>
                  </form>
                </>
              )}
            </motion.div>
          )}
 
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:space-y-8">
            {isClient && freelancerProfile ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('jobs.assignedFreelancer')}</h4>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden">
                    {freelancerProfile.photoURL ? (
                      <img src={freelancerProfile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <Link to={`/profile/${freelancerProfile.uid}`} className="font-bold text-gray-900 leading-none mb-1 hover:text-indigo-600 transition-colors block">{freelancerProfile.displayName || 'Expert Freelancer'}</Link>
                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {freelancerProfile.uid.slice(0, 16)}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{t('jobs.memberSince')}</p>
                  <div className="flex items-center text-emerald-600 gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span className="font-bold text-gray-900 text-sm">
                      {formatDate(freelancerProfile.createdAt)}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const chatParticipants = [job.clientId, job.assignedFreelancerId!].sort();
                    const chatQuery = query(
                      collection(db, 'chats'),
                      where('participantIds', '==', chatParticipants)
                    );
                    const chatSnap = await getDocs(chatQuery);
                    if (!chatSnap.empty) {
                      navigate(`/messages?chatId=${chatSnap.docs[0].id}`);
                    }
                  }}
                  className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <BrandIcon className="h-5 w-5" />
                  {t('jobs.openWorkroom')}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('jobs.aboutClient')}</h4>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 overflow-hidden">
                    {clientProfile?.photoURL ? (
                      <img src={clientProfile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-none mb-1">{clientProfile?.displayName || 'Elite Client'}</p>
                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {job.clientId.slice(0, 16)}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{t('jobs.memberSince')}</p>
                  <div className="flex items-center text-indigo-600 gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span className="font-bold text-gray-900 text-sm">
                      {formatDate(clientProfile?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
 
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('jobs.verificationStatus')}</p>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-bold">{t('jobs.paymentVerified')}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <BrandIcon className="h-4 w-4" />
                <span className="text-sm font-bold">{t('jobs.identityConfirmed')}</span>
              </div>
            </div>
 
            <button className="w-full py-4 text-sm font-bold text-gray-500 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
              {t('jobs.viewHistory')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


