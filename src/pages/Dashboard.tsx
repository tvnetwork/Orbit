import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Job, Proposal } from '../types';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  FileText,
  User as UserIcon,
  RefreshCw,
  CheckCircle,
  Orbit as BrandIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const analyticsData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        label: days[d.getDay()],
        date: d.toDateString(),
        value: 0
      };
    });

    const items = profile?.role === 'client' ? proposals : proposals.filter(p => p.status === 'accepted');
    
    items.forEach(item => {
      if (!item.createdAt) return;
      const createdAt = (item.createdAt as any).toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt);
      const dateStr = createdAt.toDateString();
      const dayData = last7Days.find(d => d.date === dateStr);
      if (dayData) {
        if (profile?.role === 'freelancer') {
          dayData.value += (item as Proposal).bidAmount;
        } else {
          dayData.value += 1;
        }
      }
    });

    return last7Days.map(d => ({ name: d.label, value: d.value }));
  }, [proposals, profile]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  } as const;

  useEffect(() => {
    async function fetchData() {
      if (!user || !profile) return;
      try {
        if (profile.role === 'client') {
          const q = query(
            collection(db, 'jobs'), 
            where('clientId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const snap = await getDocs(q);
          const jobsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
          setActiveJobs(jobsData);

          // Clients: Fetch active/recent proposals for their jobs
          if (jobsData.length > 0) {
            const jobIds = jobsData.map(j => j.id);
            const proposalsSnap = await getDocs(query(
              collection(db, 'proposals'),
              where('jobId', 'in', jobIds),
              orderBy('createdAt', 'desc'),
              limit(10)
            ));
            setProposals(proposalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal)));
          }
        } else {
          // Freelancer: fetch proposals from all jobs
          const proposalsSnap = await getDocs(query(
            collection(db, 'proposals'),
            where('freelancerId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          ));
          const proposalsData = proposalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
          setProposals(proposalsData);
          
          // Also fetch jobs associated with these proposals to show details
          const jobIds = [...new Set(proposalsData.map(d => d.jobId))];
          if (jobIds.length > 0) {
            // Batch fetch jobs (max 10 in 'in' query)
            const jobsSnap = await getDocs(query(
              collection(db, 'jobs'),
              where('__name__', 'in', jobIds.slice(0, 10))
            ));
            setActiveJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, profile]);

  if (loading) return (
    <div className="p-12 h-[80vh] flex items-center justify-center">
      <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
    </div>
  );

  const pendingProposalsCount = proposals.filter(p => p.status === 'pending').length;
  const earnings = profile?.role === 'freelancer' 
    ? proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.bidAmount, 0)
    : activeJobs.filter(j => j.status === 'in_progress' || j.status === 'completed').reduce((sum, j) => sum + j.budget, 0);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 space-y-12"
      >
        
        {/* Welcome Header */}
        <motion.div 
          variants={itemVariants}
          className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
        >
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{t('dashboard.welcome')}, {user?.displayName?.split(' ')[0]}!</h1>
            <p className="text-indigo-100 max-w-lg text-sm md:text-base">
              {activeJobs.length === 1 
                ? t('dashboard.welcomeBackSubtitleSingular', { count: activeJobs.length, pendingCount: pendingProposalsCount })
                : t('dashboard.welcomeBackSubtitlePlural', { count: activeJobs.length, pendingCount: pendingProposalsCount })
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={profile?.role === 'client' ? '/post-job' : '/jobs'} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                  {profile?.role === 'client' ? t('dashboard.postNewProject') : t('dashboard.findNewProjects')} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 h-80 w-80 bg-indigo-500/20 rounded-full blur-3xl border border-white/10" 
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: t('dashboard.activeProjects'), value: activeJobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: t('dashboard.pendingProposals'), value: pendingProposalsCount, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: profile?.role === 'freelancer' ? t('dashboard.earnings') : t('dashboard.totalSpent'), value: `$${earnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: t('dashboard.networkScore'), value: 'Live', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants} 
              whileHover={{ y: -5 }}
              className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 group transition-all hover:shadow-xl hover:shadow-indigo-500/5 text-center sm:text-left"
            >
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.activityOverview')}</h2>
              <p className="text-sm text-gray-500">{t('dashboard.engagementTrend')}</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold text-xs uppercase font-mono">
              <BrandIcon className="h-4 w-4" />
              {t('dashboard.liveInsights')}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  tickFormatter={(val) => profile?.role === 'freelancer' ? `$${val}` : val}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  formatter={(value) => [profile?.role === 'freelancer' ? `$${value}` : value, profile?.role === 'freelancer' ? t('dashboard.earnings') : 'Proposals Received']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tables Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Work / Proposals */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.role === 'client' ? t('dashboard.myProjects') : t('dashboard.myApplications')}
              </h2>
              <Link to="/jobs" className="text-sm text-indigo-600 font-bold hover:underline transition-colors font-mono uppercase tracking-tighter">{t('dashboard.viewAll')}</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {profile?.role === 'client' ? (
                activeJobs.length > 0 ? activeJobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{job.title}</p>
                        <p className="text-xs text-gray-400 font-mono italic">{formatDate(job.createdAt)} • ${job.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${job.status === 'open' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {job.status}
                    </motion.span>
                  </Link>
                )) : (
                  <div className="p-12 text-center text-gray-400 text-sm italic py-20">{t('dashboard.noJobs')}</div>
                )
              ) : (
                proposals.length > 0 ? proposals.map(proposal => {
                  const correlatedJob = activeJobs.find(j => j.id === proposal.jobId);
                  return (
                    <Link key={proposal.id} to={`/jobs/${proposal.jobId}`} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{correlatedJob?.title || 'Loading Project...'}</p>
                          <p className="text-xs text-gray-400 font-mono tracking-tight italic">Bid: ${proposal.bidAmount} • {formatDate(proposal.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                          proposal.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {proposal.status}
                        </span>
                        {proposal.status === 'accepted' && (
                          <span className="text-[10px] text-emerald-600 font-bold animate-pulse flex items-center gap-1 leading-none">
                            <span className="h-1 w-1 bg-emerald-600 rounded-full" />
                            {t('dashboard.activeProject')}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="p-12 text-center text-gray-400 text-sm italic py-20">{t('dashboard.noProposals')}</div>
                )
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8 font-sans">
              {profile?.role === 'client' ? t('dashboard.recentProposals') : t('dashboard.recentNotifications')}
            </h2>
            <div className="space-y-8">
              {profile?.role === 'client' ? (
                proposals.slice(0, 5).map((p, idx) => {
                  const job = activeJobs.find(j => j.id === p.jobId);
                  return (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 relative"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          {t('dashboard.newProposalFor')} <span className="font-bold">"{job?.title}"</span> {t('dashboard.proposalFrom')} <span className="text-indigo-600 font-bold uppercase tracking-tighter text-[10px]">User {p.freelancerId.slice(0, 5)}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono italic">{t('jobs.budget')}: ${p.bidAmount} • {formatDate(p.createdAt)}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                proposals.filter(p => p.status === 'accepted').slice(0, 3).map((p, idx) => {
                const job = activeJobs.find(j => j.id === p.jobId);
                return (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 relative"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        {t('dashboard.proposalAccepted', { title: job?.title })} <span className="text-emerald-600 font-bold uppercase tracking-tighter text-xs">{t('dashboard.acceptedStatus')}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono italic">{t('dashboard.waitingInMessages')}</p>
                    </div>
                  </motion.div>
                );
              }))}
              {proposals.length === 0 && activeJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <BrandIcon className="h-12 w-12 mb-4 animate-spin" />
                  <p className="text-sm font-medium">{t('dashboard.lookingForUpdates')}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
