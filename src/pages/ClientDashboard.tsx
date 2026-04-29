import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search, 
  MoreHorizontal,
  ChevronRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function ClientDashboard() {
  const [user] = useAuthState(auth);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeSpending: 0,
    pendingApprovals: 0,
    openJobs: 0
  });

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'jobs'),
        where('clientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setJobs(fetchedJobs);
        
        // Calculate basic stats
        const open = fetchedJobs.filter(j => j.status === 'open').length;
        const spending = fetchedJobs.reduce((acc, j) => acc + (j.status === 'in_progress' ? j.budget : 0), 0);
        
        setStats({
          activeSpending: spending,
          pendingApprovals: 2, // Mocking pending approvals for now
          openJobs: open
        });
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user]);

  const cards = [
    { label: 'Active Spending', value: `$${stats.activeSpending.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Open Jobs', value: stats.openJobs, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Client Dashboard</h1>
            <p className="text-gray-500 font-medium font-sans mt-1 text-lg">Manage your projects and elite talent partners.</p>
          </div>
          <Link 
            to="/client/post-job"
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus className="h-5 w-5" />
            Post a New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
            >
              <div className={cn("inline-flex p-4 rounded-2xl mb-6", card.bg)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">{card.value}</div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">Current Job Postings</h2>
                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {jobs.map((job) => (
                  <Link 
                    key={job.id} 
                    to={`/client/job/${job.id}/applicants`}
                    className="flex items-center justify-between p-6 rounded-2xl border border-gray-50 hover:border-indigo-100 hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                        {job.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            job.status === 'open' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                          )}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900">${job.budget}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Price</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}

                {jobs.length === 0 && !loading && (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-bold mb-4">You haven't posted any jobs yet.</p>
                    <Link to="/client/post-job" className="text-indigo-600 font-bold hover:underline">Start your first project</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-lg font-black mb-6">Quick Insights</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">2 Proposals need your review</p>
                    <p className="text-xs text-gray-400 mt-1">New applications for "Senior React Designer"</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Milestone #1 Approved</p>
                    <p className="text-xs text-gray-400 mt-1">Payment for "Backend API" released</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Talent */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6">Top Talent Picks</h3>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100" />
                    <div>
                      <div className="text-sm font-black text-gray-900">Expert Talent {i}</div>
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Full-Stack Dev</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/freelancers" className="w-full mt-8 block text-center py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-100 transition-all border border-gray-100">
                Browse More Elite Talent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
