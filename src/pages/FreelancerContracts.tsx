import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function FreelancerContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'contracts'),
      where('freelancerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setContracts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredContracts = contracts.filter(c => filter === 'all' || c.status === filter);

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
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Active Engagements</h1>
            <p className="text-gray-500 mt-1 font-medium italic">Monitor your contractual flow and milestone releases.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-900">
               {contracts.filter(c => c.status === 'active').length} Active
             </div>
             <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 text-sm font-bold">
               {contracts.length} Total
             </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
             {['all', 'active', 'completed', 'disputed'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   filter === f 
                     ? "bg-gray-900 text-white shadow-xl shadow-gray-200" 
                     : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                 )}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, i) => (
              <motion.div
                layout
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 flex items-center gap-6">
                    <div className="h-16 w-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">
                        {contract.jobTitle || 'Active Engagement'}
                      </h3>
                      <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">
                        Started {new Date(contract.createdAt?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 text-center lg:text-left border-l border-gray-50 lg:pl-10">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                     <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">${contract.totalAmount}</p>
                  </div>

                  <div className="lg:col-span-3 flex justify-center lg:justify-start">
                    <div className={cn(
                      "px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest",
                      contract.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                      contract.status === 'completed' ? "bg-blue-50 text-blue-600" :
                      "bg-gray-50 text-gray-400"
                    )}>
                      {contract.status === 'active' ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      {contract.status}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end">
                     <Link 
                      to={`/contract/${contract.id}`} 
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                     >
                       Enter Room
                     </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredContracts.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
               <div className="max-w-xs mx-auto space-y-6">
                 <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                   <AlertCircle className="h-12 w-12" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">No Contracts Found</h3>
                 <p className="text-gray-400 font-medium text-sm">You haven't initiated any professional engagements in this category yet.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
