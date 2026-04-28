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
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const analyticsData = [
  { name: 'Mon', earnings: 400 },
  { name: 'Tue', earnings: 1200 },
  { name: 'Wed', earnings: 900 },
  { name: 'Thu', earnings: 1600 },
  { name: 'Fri', earnings: 2100 },
  { name: 'Sat', earnings: 1800 },
  { name: 'Sun', earnings: 2400 },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

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
          setActiveJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
        } else {
          // Freelancer: fetch proposals
          const q = query(
            collection(db, 'jobs'), 
            where('status', 'in', ['open', 'in_progress']),
            limit(10)
          );
          // Simplified fetch
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
          className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
        >
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-bold">Good morning, {user?.displayName?.split(' ')[0]}!</h1>
            <p className="text-indigo-100 max-w-lg">You have {activeJobs.length} active projects and 12 unread messages. Let's make today productive.</p>
            <div className="flex gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={profile?.role === 'client' ? '/post-job' : '/jobs'} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2">
                  {profile?.role === 'client' ? 'Post New Project' : 'Find New Projects'} <ArrowRight className="h-4 w-4" />
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
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Projects', value: activeJobs.length || '0', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Proposals', value: '7', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Earnings (MTD)', value: '$8,450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Growth Score', value: '94%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants} 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group transition-all hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
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
              <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
              <p className="text-sm text-gray-500">Net revenue growth over the last 7 sessions.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold text-xs">
              <TrendingUp className="h-4 w-4" />
              +12.5% vs last week
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
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
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
          {/* Active Work */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
              <Link to="/jobs" className="text-sm text-indigo-600 font-bold hover:underline transition-colors">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {activeJobs.length > 0 ? activeJobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{job.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(job.createdAt)} • ${job.budget.toLocaleString()}</p>
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
                <div className="p-12 text-center text-gray-400 text-sm italic">No recent projects to show.</div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Recent Activity</h2>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 relative"
                >
                  {i < 3 && <div className="absolute left-6 top-10 bottom-0 w-px bg-gray-100" />}
                  <div className="h-12 w-12 rounded-full border-2 border-gray-50 flex items-center justify-center bg-white z-10 shrink-0">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">Project "{['Logo Design', 'Web App', 'Copywriting'][i-1]}"</span> has a new proposal from <span className="text-indigo-600 font-medium">Alex Rivera</span>
                    </p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
