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
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ComingSoonOverlay from '../components/ComingSoonOverlay';

const CASH_FLOW_DATA = [
  { name: 'Jan', in: 4000, out: 2400 },
  { name: 'Feb', in: 3000, out: 1398 },
  { name: 'Mar', in: 2000, out: 9800 },
  { name: 'Apr', in: 2780, out: 3908 },
  { name: 'May', in: 1890, out: 4800 },
  { name: 'Jun', in: 2390, out: 3800 },
];

export default function Wallet() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [escrow, setEscrow] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const txUnsubscribe = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      
      // Calculate balance from ALL user transactions
      const fullQ = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      onSnapshot(fullQ, (fullSnap) => {
        const total = fullSnap.docs.reduce((acc, doc) => {
            const data = doc.data();
            if (data.type === 'deposit' || data.type === 'payment_received') return acc + (data.amount || 0);
            if (data.type === 'withdrawal' || data.type === 'payment_sent') return acc - (data.amount || 0);
            return acc;
        }, 0);
        setBalance(total);
      });
      
      setLoading(false);
    });

    // Calculate Escrow from contracts
    const contractsQ = query(
        collection(db, 'contracts'),
        where('status', '==', 'active')
    );
    // Note: We need to filter by user being either client or freelancer
    // For simplicity, we'll check both
    const escrowUnsubscribe = onSnapshot(contractsQ, (snap) => {
        const totalEscrow = snap.docs.reduce((acc, doc) => {
            const data = doc.data();
            if (data.clientId === user.uid || data.freelancerId === user.uid) {
                const remaining = (data.totalAmount || 0) - (data.amountPaid || 0);
                return acc + remaining;
            }
            return acc;
        }, 0);
        setEscrow(totalEscrow);
    });

    return () => {
        txUnsubscribe();
        escrowUnsubscribe();
    }
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20 pt-10 sm:pt-12 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end md:gap-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{t('wallet.title')}</h1>
            <p className="text-gray-500 mt-1 font-medium italic">{t('wallet.subtitle')}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
             <button className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-gray-200 transition-all hover:bg-black sm:px-8">
               <ArrowUpRight className="h-4 w-4" /> {t('wallet.withdrawFunds')}
             </button>
             <button className="rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:bg-gray-50 sm:self-auto">
               <Download className="h-5 w-5 text-gray-400" />
             </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Balance Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-6 text-white shadow-2xl shadow-indigo-200 sm:p-8 lg:rounded-[3rem] lg:p-10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                 <div className="relative z-10 space-y-8">
                   <div className="flex justify-between items-start">
                     <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                       <WalletIcon className="h-7 w-7 text-white" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full">{t('wallet.primaryWallet')}</span>
                   </div>
                   <div>
                     <p className="text-sm font-black text-white/60 mb-1 uppercase tracking-widest">{t('wallet.availableBalance')}</p>
                     <h3 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                   </div>
                   <div className="flex items-center justify-between pt-8 border-t border-white/10">
                      <div className="flex items-center gap-2 text-indigo-100 font-bold text-xs">
                        <ShieldCheck className="h-4 w-4" />
                        {t('wallet.insuredNote')}
                      </div>
                      <div className="h-8 w-12 bg-white/10 rounded-lg flex items-center justify-center italic font-black text-[8px] tracking-widest">VISA</div>
                   </div>
                 </div>
              </div>

              <div className="space-y-8 rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:rounded-[3rem] lg:p-10 lg:space-y-10">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('wallet.activeEscrow')}</h3>
                   <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                     <Clock className="h-6 w-6" />
                   </div>
                 </div>
                 <div>
                   <p className="text-sm font-black text-gray-400 mb-1 uppercase tracking-widest">{t('wallet.heldInProtection')}</p>
                   <h3 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">${escrow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('wallet.releasingNote')}</span>
                 </div>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:rounded-[3.5rem] lg:p-12">
               <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-12">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('wallet.cashVelocity')}</h3>
                 <div className="flex flex-wrap gap-2">
                   <button className="px-4 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600">{t('wallet.thisMonth')}</button>
                   <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400">{t('wallet.totalYear')}</button>
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
               <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10">
                 <div className="flex items-center gap-3">
                   <div className="h-3 w-3 bg-emerald-500 rounded-full" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('wallet.inflow')}</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-3 w-3 bg-red-400 rounded-full" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('wallet.outflow')}</span>
                 </div>
               </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight px-4">{t('wallet.ledgerHistory')}</h3>
               <div className="space-y-4">
                 {transactions.length > 0 ? transactions.map(tx => (
                   <div key={tx.id} className="group flex flex-col gap-4 rounded-[2rem] border border-gray-100 bg-white p-5 transition-all hover:shadow-lg hover:shadow-indigo-500/5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 sm:rounded-[2.5rem]">
                      <div className="flex items-center gap-4 sm:gap-6">
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
                      <div className="text-left sm:text-right">
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
                     <p className="text-sm font-bold text-gray-400 italic">{t('wallet.noTransactions')}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
             {/* Payment Methods */}
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('wallet.endpoints')}</h3>
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
                <h3 className="text-xl font-black tracking-tight leading-tight">{t('wallet.kycTitle')}</h3>
                <p className="text-sm font-medium text-white/60 leading-relaxed">{t('wallet.kycDesc')}</p>
                <Link 
                  to="/settings" 
                  className="w-full py-4 bg-orange-400 text-gray-900 rounded-2xl font-black text-center text-sm hover:bg-orange-500 transition-all block"
                >
                  {t('wallet.verifyNow')}
                </Link>
             </div>

             {/* Support Help */}
             <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
               <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                 {t('wallet.taxReportNote')}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
