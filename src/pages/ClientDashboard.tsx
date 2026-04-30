import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
  AlertCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import ComingSoonOverlay from '../components/ComingSoonOverlay';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [topTalent, setTopTalent] = useState<any[]>([]);
  const [recentProposals, setRecentProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    activeSpending: 0,
    pendingApprovals: 0,
    openJobs: 0
  });

  useEffect(() => {
    // Fetch top talent
    const talentQ = query(
      collection(db, 'users'),
      where('role', '==', 'freelancer'),
      where('verificationStatus', '==', 'verified'),
      limit(3)
    );
    getDocs(talentQ).then(snap => {
      setTopTalent(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'jobs'),
        where('clientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Fetch freelancer profiles for assigned jobs
        const jobsWithFreelancers = await Promise.all(jobsData.map(async (job) => {
          if (job.assignedFreelancerId) {
            const userSnap = await getDoc(doc(db, 'users', job.assignedFreelancerId));
            return { ...job, assignedFreelancer: userSnap.exists() ? userSnap.data() : null };
          }
          return job;
        }));

        setJobs(jobsWithFreelancers);
        
        // Calculate basic stats
        const open = jobsWithFreelancers.filter(j => j.status === 'open').length;
        const spending = jobsWithFreelancers.reduce((acc, j) => acc + (j.status === 'in_progress' ? (j.budget || 0) : 0), 0);
        
        // Fetch proposals for these jobs to count pending ones
        const jobIds = jobsWithFreelancers.map(j => j.id);
        if (jobIds.length > 0) {
          const proposalsQ = query(
            collection(db, 'proposals'),
            where('jobId', 'in', jobIds.slice(0, 10)), // Firestore limits 'in' to 10 items
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          
          onSnapshot(proposalsQ, (pSnap) => {
            setRecentProposals(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setStats(prev => ({
              ...prev,
              activeSpending: spending,
              pendingApprovals: pSnap.size,
              openJobs: open
            }));
          });
        } else {
          setStats({
            activeSpending: spending,
            pendingApprovals: 0,
            openJobs: open
          });
        }
        
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cards = [
    { label: t('dashboard.activeSpending'), value: `$${stats.activeSpending.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('dashboard.pendingApprovals'), value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('dashboard.openJobs'), value: stats.openJobs, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('dashboard.clientTitle')}</h1>
            <p className="text-gray-500 font-medium font-sans mt-1 text-lg">{t('dashboard.clientSubtitle')}</p>
          </div>
          <Link 
            to="/post-job"
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus className="h-5 w-5" />
            {t('dashboard.postNewProject')}
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
              className={cn(
                "bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden"
              )}
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
                <h2 className="text-2xl font-black text-gray-900">{t('dashboard.myProjects')}</h2>
                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                  {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {jobs.map((job) => (
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-50 hover:border-indigo-100 hover:bg-gray-50 transition-all group">
                      <Link 
                        to={`/client/job/${job.id}/applicants`}
                        className="flex items-center gap-6 flex-1 min-w-0"
                      >
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                          {job.assignedFreelancer ? (
                            <img src={job.assignedFreelancer.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.assignedFreelancer.displayName)}`} className="h-full w-full object-cover" alt="" />
                          ) : (
                            job.title.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            {job.assignedFreelancer ? (
                               <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                 <CheckCircle2 className="h-3.5 w-3.5" /> Assigned to {job.assignedFreelancer.displayName}
                               </span>
                            ) : (
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                <Clock className="h-3.5 w-3.5" /> {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                              job.status === 'open' ? "bg-emerald-50 text-emerald-600" : 
                              job.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                              "bg-gray-100 text-gray-500"
                            )}>
                              {job.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-gray-900">${job.budget}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Price</div>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMenuId(activeMenuId === job.id ? null : job.id);
                            }}
                            className="p-3 hover:bg-white rounded-xl text-gray-300 hover:text-gray-900 transition-all"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          <AnimatePresence>
                            {activeMenuId === job.id && (
                              <motion.div 
                                ref={menuRef}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden text-left"
                              >
                                <Link 
                                  to={`/jobs/${job.id}`}
                                  className="w-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" /> View Public
                                </Link>
                                <button className="w-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                  <Edit className="h-4 w-4" /> Edit Job
                                </button>
                                <div className="h-px bg-gray-50 my-1" />
                                <button className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" /> Close Posting
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                ))}

                {jobs.length === 0 && !loading && (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-bold mb-4">{t('dashboard.noJobsPosted')}</p>
                    <Link to="/post-job" className="text-indigo-600 font-bold hover:underline">{t('dashboard.startFirstProject')}</Link>
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
                {recentProposals.map(proposal => (
                  <Link key={proposal.id} to={`/client/job/${proposal.jobId}/applicants`} className="flex items-start gap-4 hover:bg-white/5 p-2 rounded-xl transition-all">
                    <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[180px]">New proposal for "{proposal.jobTitle || 'Job'}"</p>
                      <p className="text-xs text-gray-400 mt-1">Review application from elite talent</p>
                    </div>
                  </Link>
                ))}
                {recentProposals.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No new insights yet.</p>
                )}
              </div>
            </div>

            {/* Recommended Talent */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6">{t('dashboard.topTalent')}</h3>
              <div className="space-y-6">
                {topTalent.map(talent => (
                  <Link key={talent.id} to={`/freelancer/${talent.id}`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-xl transition-all">
                    <img 
                      src={talent.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.displayName || 'T')}`} 
                      className="h-12 w-12 rounded-full border-2 border-indigo-50 object-cover" 
                      alt=""
                    />
                    <div>
                      <div className="text-sm font-black text-gray-900 truncate max-w-[150px]">{talent.displayName}</div>
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{talent.professionalTitle || 'Elite Expert'}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/freelancers" className="w-full mt-8 block text-center py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-100 transition-all border border-gray-100">
                {t('dashboard.browseTalent')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
