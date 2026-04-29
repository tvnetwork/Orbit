import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreHorizontal,
  Eye,
  Trash2
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Bids' },
  { id: 'unread', label: 'Pending' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'hired', label: 'Accepted' },
  { id: 'rejected', label: 'Declined' },
];

export default function FreelancerProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'proposals'),
      where('freelancerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedProposals = await Promise.all(snapshot.docs.map(async (pDoc) => {
        const data = pDoc.data();
        const jobSnap = await getDoc(doc(db, 'jobs', data.jobId));
        return {
          id: pDoc.id,
          ...data,
          job: jobSnap.exists() ? jobSnap.data() : null
        };
      }));
      setProposals(fetchedProposals);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredProposals = proposals
    .filter(p => activeFilter === 'all' || p.status === activeFilter)
    .filter(p => p.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bid Registry</h1>
            <p className="text-gray-500 mt-1 font-medium italic">Track your proposals through the acquisition funnel.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-900">
               {proposals.filter(p => p.status === 'hired').length} Won
             </div>
             <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 text-sm font-bold">
               {proposals.length} Total Applications
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeFilter === filter.id 
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-200" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input 
               type="text"
               placeholder="Search registry..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
             />
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredProposals.map((proposal, i) => (
              <motion.div
                layout
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 flex items-center gap-6">
                    <div className="h-16 w-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">
                        {proposal.job?.title || 'Unknown Project'}
                      </h3>
                      <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">
                        Submitted {new Date(proposal.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 text-center lg:text-left border-l border-gray-50 lg:pl-10">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Bid</p>
                     <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">${proposal.bidAmount}</p>
                  </div>

                  <div className="lg:col-span-3 flex justify-center lg:justify-start">
                    <div className={cn(
                      "px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest",
                      proposal.status === 'hired' ? "bg-emerald-50 text-emerald-600" :
                      proposal.status === 'rejected' ? "bg-red-50 text-red-600" :
                      proposal.status === 'shortlisted' ? "bg-blue-50 text-blue-600" :
                      "bg-gray-50 text-gray-400"
                    )}>
                      {proposal.status === 'hired' ? <CheckCircle2 className="h-4 w-4" /> :
                       proposal.status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                      {proposal.status}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end items-center gap-4">
                    {proposal.status === 'hired' ? (
                       <Link 
                        to="/freelancer/dashboard" 
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                       >
                         View Contract
                       </Link>
                    ) : (
                       <button className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                         <Trash2 className="h-5 w-5" />
                       </button>
                    )}
                    <button className="p-4 text-gray-300 hover:text-gray-900 transition-all">
                      <MoreHorizontal className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProposals.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xs mx-auto space-y-6"
               >
                 <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                   <AlertCircle className="h-12 w-12" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Registry Empty</h3>
                 <p className="text-gray-400 font-medium">No bids found matching your current filter criteria.</p>
                 <Link to="/jobs" className="inline-block text-indigo-600 font-black underline underline-offset-8 decoration-2 hover:indigo-700 transition-colors">
                   Find Elite Projects
                 </Link>
               </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
