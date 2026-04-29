import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const EARNINGS_DATA = [
  { name: 'Mon', amount: 400 },
  { name: 'Tue', amount: 700 },
  { name: 'Wed', amount: 600 },
  { name: 'Thu', amount: 800 },
  { name: 'Fri', amount: 1200 },
  { name: 'Sat', amount: 1100 },
  { name: 'Sun', amount: 1300 },
];

export default function FreelancerDashboard() {
  const { user, profile } = useAuth();
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch active contracts
    const contractsQ = query(
      collection(db, 'contracts'),
      where('freelancerId', '==', user.uid),
      where('status', '==', 'active')
    );

    const proposalsQ = query(
      collection(db, 'proposals'),
      where('freelancerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubContracts = onSnapshot(contractsQ, (snap) => {
      setActiveContracts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProposals = onSnapshot(proposalsQ, (snap) => {
      setProposals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubContracts();
      unsubProposals();
    };
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Freelancer Command Center</h1>
            <p className="text-gray-500 mt-1 font-medium">Monitoring your elite business performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/wallet" className="bg-white border border-gray-100 p-4 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all pr-8">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Balance</p>
                <p className="text-xl font-black text-gray-900">$12,450.00</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Contracts', value: activeContracts.length, icon: Briefcase, color: 'indigo' },
            { label: 'Pending Bids', value: '12', icon: Clock, color: 'orange' },
            { label: 'Profile Views', value: '1,240', icon: TrendingUp, color: 'purple' },
            { label: 'Success Rate', value: '98%', icon: Award, color: 'emerald' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
            >
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 leading-none">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Chart */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Earnings Flow</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500">Weekly</button>
                  <button className="px-4 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600">Monthly</button>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={EARNINGS_DATA}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Contracts List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Ongoing Engagements</h3>
                <Link to="/freelancer/contracts" className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {activeContracts.length > 0 ? activeContracts.map(contract => (
                  <Link 
                    key={contract.id}
                    to={`/contract/${contract.id}`} 
                    className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 leading-tight">Elite UI/UX for Fintech App</h4>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Next Milestone: Portfolio Review</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">${contract.totalAmount}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        In Progress
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="bg-white p-12 text-center rounded-[3rem] border border-gray-100 italic text-gray-400 font-medium">
                    No active contracts yet. Start bidding to win elite projects.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/jobs" className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                  <span className="font-bold">Browse Elite Jobs</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/profile" className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                  <span className="font-bold">Optimize Profile</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/wallet" className="flex items-center justify-between p-5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all border border-indigo-500">
                  <span className="font-bold underline underline-offset-4 decoration-2">Withdraw Funds</span>
                  <DollarSign className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Pipeline Tracker</h3>
              <div className="space-y-8">
                {proposals.length > 0 ? proposals.map((proposal, i) => (
                  <div key={proposal.id} className="relative pl-8">
                    {i !== proposals.length - 1 && <div className="absolute left-[3px] top-6 bottom-0 w-0.5 bg-gray-100" />}
                    <div className={cn(
                      "absolute left-0 top-1.5 h-2 w-2 rounded-full",
                      proposal.status === 'hired' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : 
                      proposal.status === 'rejected' ? "bg-red-400" : "bg-indigo-400"
                    )} />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {new Date(proposal.createdAt?.toDate()).toLocaleDateString()}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          proposal.status === 'hired' ? "bg-emerald-100 text-emerald-600" :
                          proposal.status === 'rejected' ? "bg-red-50 text-red-600" :
                          "bg-indigo-50 text-indigo-600"
                        )}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">Applied for React Specialist Position</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 font-medium italic">No recent proposals.</p>
                )}
              </div>
              <Link to="/freelancer/proposals" className="w-full mt-10 py-4 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all block text-center">
                View Full Pipeline
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
