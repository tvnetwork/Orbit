import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Star, 
  Clock, 
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Trash2,
  GripVertical
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

const COLUMNS = [
  { id: 'unread', title: 'Unread', color: 'bg-gray-100 text-gray-600' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'bg-blue-50 text-blue-600' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-purple-50 text-purple-600' },
  { id: 'hired', title: 'Hired', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-50 text-red-600' }
];

export default function ApplicantBoard() {
  const { id: jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId) {
      // Fetch Job Details
      getDoc(doc(db, 'jobs', jobId)).then(snap => {
        if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
      });

      // Fetch Proposals
      const q = query(
        collection(db, 'proposals'),
        where('jobId', '==', jobId)
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedProposals = await Promise.all(snapshot.docs.map(async (proposalDoc) => {
          const data = proposalDoc.data();
          // Fetch linked freelancer profile
          const userSnap = await getDoc(doc(db, 'users', data.freelancerId));
          return {
            id: proposalDoc.id,
            ...data,
            freelancer: userSnap.exists() ? userSnap.data() : null
          };
        }));
        setProposals(fetchedProposals);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [jobId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'proposals', proposalId), { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white py-6 shadow-sm sm:py-8 md:py-10">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/client/dashboard" className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{job?.title || 'Job Applicants'}</h1>
              <p className="text-gray-500 font-medium font-sans">Manage proposals and hire the best talent.</p>
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center md:gap-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:w-auto">
              <div className="rounded-xl bg-gray-50 px-4 py-2 text-center text-sm font-bold uppercase tracking-widest text-gray-400">
                {proposals.length} Total Applicants
              </div>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100">
                <Filter className="h-4 w-4" />
                Advanced Sort
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-12">
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x sm:gap-6 md:gap-8 md:pb-8">
          {COLUMNS.map((column) => (
            <div key={column.id} className="w-[300px] shrink-0 snap-start sm:w-[320px] md:w-[350px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-gray-900 tracking-tight">{column.title}</h3>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", column.color)}>
                    {proposals.filter(p => p.status === column.id).length}
                  </span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === column.id ? null : column.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <AnimatePresence>
                    {activeMenuId === column.id && (
                      <motion.div 
                        ref={menuRef}
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        <button className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">Sort by Rating</button>
                        <button className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">Sort by Budget</button>
                        <button className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">Bulk Actions</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="min-h-[420px] space-y-4 sm:min-h-[500px]">
                {proposals
                  .filter(p => p.status === column.id)
                  .filter(p => p.freelancer?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((proposal) => (
                    <motion.div
                      layout
                      key={proposal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={proposal.freelancer?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.freelancer?.displayName)}&background=random`} 
                            className="h-10 w-10 rounded-full border-2 border-gray-50"
                            alt={proposal.freelancer?.displayName}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-black text-gray-900 leading-none">{proposal.freelancer?.displayName}</h4>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                              {proposal.freelancer?.professionalTitle || 'Expert Specialist'}
                            </p>
                          </div>
                        </div>
                        <GripVertical className="h-4 w-4 text-gray-200 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {proposal.coverLetter}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] font-black text-gray-900">
                            <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                            {proposal.freelancer?.rating || '5.0'}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-black text-gray-900">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            ${proposal.bidAmount}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={proposal.status}
                            onChange={(e) => updateProposalStatus(proposal.id, e.target.value)}
                            className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border-none focus:ring-0 cursor-pointer"
                          >
                            {COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quick Actions Hover Overlay */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-gray-100">
                        <Link to={`/freelancer/${proposal.freelancerId}`} className="p-1.5 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg">
                          <Search className="h-3.5 w-3.5" />
                        </Link>
                        <button className="p-1.5 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => updateProposalStatus(proposal.id, 'rejected')}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                {proposals.filter(p => p.status === column.id).length === 0 && (
                  <div className="py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-8">
                      No applicants in this stage.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
