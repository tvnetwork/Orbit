import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Download,
  AlertCircle,
  MoreVertical,
  Wallet as WalletIcon,
  Plus
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CASH_FLOW_DATA = [
  { name: 'Jan', in: 4000, out: 2400 },
  { name: 'Feb', in: 3000, out: 1398 },
  { name: 'Mar', in: 2000, out: 9800 },
  { name: 'Apr', in: 2780, out: 3908 },
  { name: 'May', in: 1890, out: 4800 },
  { name: 'Jun', in: 2390, out: 3800 },
];

export default function Wallet() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Treasury</h1>
            <p className="text-gray-500 mt-1 font-medium italic">Manage your capital, taxes, and elite withdrawals.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-2">
               <ArrowUpRight className="h-4 w-4" /> Withdraw Funds
             </button>
             <button className="bg-white border border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition-all">
               <Download className="h-5 w-5 text-gray-400" />
             </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                 <div className="relative z-10 space-y-8">
                   <div className="flex justify-between items-start">
                     <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                       <WalletIcon className="h-7 w-7 text-white" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full">Primary Wallet</span>
                   </div>
                   <div>
                     <p className="text-sm font-black text-white/60 mb-1 uppercase tracking-widest">Available Balance</p>
                     <h3 className="text-5xl font-black tracking-tight">$12,450.80</h3>
                   </div>
                   <div className="flex items-center justify-between pt-8 border-t border-white/10">
                      <div className="flex items-center gap-2 text-indigo-100 font-bold text-xs">
                        <ShieldCheck className="h-4 w-4" />
                        Fully Insured by Vynta
                      </div>
                      <div className="h-8 w-12 bg-white/10 rounded-lg flex items-center justify-center italic font-black text-[8px] tracking-widest">VISA</div>
                   </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Escrow</h3>
                   <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                     <Clock className="h-6 w-6" />
                   </div>
                 </div>
                 <div>
                   <p className="text-sm font-black text-gray-400 mb-1 uppercase tracking-widest">Held in Protection</p>
                   <h3 className="text-4xl font-black text-gray-900 tracking-tight">$8,200.00</h3>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Releasing in 4-6 Days</span>
                 </div>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-12">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Cash Velocity</h3>
                 <div className="flex gap-2">
                   <button className="px-4 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600">This Month</button>
                   <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400">Total Year</button>
                 </div>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={CASH_FLOW_DATA}>
                     <defs>
                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Tooltip 
                        contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                     />
                     <Area type="monotone" dataKey="in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                     <Area type="monotone" dataKey="out" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
               <div className="mt-8 flex justify-center gap-10">
                 <div className="flex items-center gap-3">
                   <div className="h-3 w-3 bg-emerald-500 rounded-full" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Inflow</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-3 w-3 bg-red-400 rounded-full" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Outflow</span>
                 </div>
               </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight px-4">Ledger History</h3>
               <div className="space-y-4">
                 {transactions.length > 0 ? transactions.map(tx => (
                   <div key={tx.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center",
                          tx.type === 'withdrawal' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {tx.type === 'withdrawal' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 tracking-tight leading-tight">{tx.description || 'System Transaction'}</h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">ID: {tx.id.slice(0, 10).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xl font-black",
                          tx.type === 'withdrawal' ? "text-red-500" : "text-emerald-500"
                        )}>
                          {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount}
                        </p>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                          {new Date(tx.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                   </div>
                 )) : (
                   <div className="bg-white p-12 text-center rounded-[3rem] border-2 border-dashed border-gray-100">
                     <p className="text-sm font-bold text-gray-400 italic">No transactions recorded in the ledger yet.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-28">
             {/* Payment Methods */}
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Endpoints</h3>
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-6 group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all">
                      <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Local Bank</p>
                        <p className="font-black text-gray-900 leading-tight">Chase ****8912</p>
                      </div>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                   </div>
                   <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-6 group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all opacity-60">
                      <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Backup Card</p>
                        <p className="font-black text-gray-900 leading-tight">Amex ****1005</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Verification Banner */}
             <div className="bg-gray-900 p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight leading-tight">KYC Verification Required</h3>
                <p className="text-sm font-medium text-white/60 leading-relaxed">To enable limitless withdrawals, please verify your identity in the settings portal.</p>
                <Link 
                  to="/settings" 
                  className="w-full py-4 bg-orange-400 text-gray-900 rounded-2xl font-black text-center text-sm hover:bg-orange-500 transition-all block"
                >
                  Verify Now
                </Link>
             </div>

             {/* Support Help */}
             <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
               <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                 Need a detailed VAT/Tax report? Export your entire transaction history to CSV or PDF from the dashboard tools.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
