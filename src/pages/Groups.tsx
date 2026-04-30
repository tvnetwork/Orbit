import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  Zap, 
  Globe,
  Sparkles,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  where,
  setDoc,
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Groups() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [joinedCohortIds, setJoinedCohortIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [counts, setCounts] = useState({ talent: 0, messages: 0 });
  const [newCohort, setNewCohort] = useState({
    name: '',
    description: '',
    color: 'indigo'
  });

  useEffect(() => {
    // Real-time listener for talent count
    const talentQ = query(collection(db, 'users'), where('role', '==', 'freelancer'), limit(500));
    const unsubTalent = onSnapshot(talentQ, (snap) => {
      setCounts(prev => ({ ...prev, talent: snap.size }));
    });

    // Real-time listener for message count
    const msgQ = query(collection(db, 'community_messages'), limit(500));
    const unsubMsg = onSnapshot(msgQ, (snap) => {
      setCounts(prev => ({ ...prev, messages: snap.size }));
    });

    return () => {
      unsubTalent();
      unsubMsg();
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'cohorts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCohorts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    if (user) {
      const joinedQ = query(collection(db, `users/${user.uid}/joined_cohorts`));
      const unsubJoined = onSnapshot(joinedQ, (snap) => {
        setJoinedCohortIds(new Set(snap.docs.map(doc => doc.id)));
      });
      return () => {
        unsubscribe();
        unsubJoined();
      };
    }

    return unsubscribe;
  }, [user]);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCohort.name) return;

    try {
      await addDoc(collection(db, 'cohorts'), {
        ...newCohort,
        creatorId: user.uid,
        membersCount: 1,
        featured: false,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewCohort({ name: '', description: '', color: 'indigo' });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleJoin = async (cohortId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/joined_cohorts`;
    if (joinedCohortIds.has(cohortId)) {
      await deleteDoc(doc(db, path, cohortId));
    } else {
      await setDoc(doc(db, path, cohortId), { joinedAt: serverTimestamp() });
    }
  };

  const filteredCohorts = cohorts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">{t('groups.title')}</h1>
            <p className="text-xl font-medium text-gray-400 italic">{t('groups.subtitle')}</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="group relative px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center gap-3 relative">
               <Plus className="h-5 w-5" />
               {t('groups.newGroup')}
             </div>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           {[
             { label: t('groups.activeMasters'), value: counts.talent > 0 ? `${counts.talent}+` : '0', icon: Users, color: 'indigo' },
             { label: t('groups.verifiedDomains'), value: 'Live', icon: Globe, color: 'emerald' },
             { label: t('groups.networkInsights'), value: counts.messages > 0 ? `${counts.messages} Insights` : 'No Links', icon: Zap, color: 'orange' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input 
              type="text"
              placeholder={t('groups.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
             />
           </div>
           <div className="flex items-center gap-2">
             <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{t('groups.allCohorts')}</button>
             <button className="px-6 py-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">{t('groups.featuredOnly')}</button>
           </div>
        </div>

        {/* Cohorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence>
             {filteredCohorts.map((cohort, i) => (
               <motion.div
                 layout
                 key={cohort.id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 className="group bg-white rounded-[3rem] p-1 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative"
               >
                 <div className="p-10 space-y-8">
                   <div className="flex justify-between items-start">
                      <div className={cn(
                        "h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all group-hover:scale-110",
                        `bg-${cohort.color || 'indigo'}-50 text-${cohort.color || 'indigo'}-600 shadow-lg shadow-${cohort.color || 'indigo'}-500/5`
                      )}>
                        <Users className="h-8 w-8" />
                      </div>
                      {cohort.featured && (
                        <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-100">
                          <Star className="h-5 w-5 fill-yellow-600" />
                        </div>
                      )}
                   </div>

                   <div className="space-y-3">
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                       {cohort.name}
                     </h3>
                     <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
                       {cohort.description}
                     </p>
                   </div>

                   <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(n => (
                          <div key={n} className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                            U
                          </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cohort.membersCount || 0} {t('groups.domainLeads')}</span>
                   </div>

                   <div className="flex gap-3">
                      <Link 
                        to={`/community?cohort=${cohort.id}`} 
                        className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all text-center flex items-center justify-center gap-2"
                      >
                        {t('groups.openForge')}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      <button 
                        onClick={() => toggleJoin(cohort.id)}
                        className={cn(
                          "px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                          joinedCohortIds.has(cohort.id) 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                        )}
                      >
                        {joinedCohortIds.has(cohort.id) ? (
                          <>
                            <Zap className="h-4 w-4 fill-emerald-600" />
                            {t('groups.joined')}
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            {t('groups.join')}
                          </>
                        )}
                      </button>
                   </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Create Modal Overlay */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreating(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative z-10 border border-gray-100"
              >
                 <div className="flex items-center gap-4 mb-10">
                   <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                     <Users className="h-6 w-6" />
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('groups.createTitle')}</h2>
                     <p className="text-gray-500 font-medium italic">{t('groups.createSubtitle')}</p>
                   </div>
                 </div>

                 <form onSubmit={handleCreateCohort} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('groups.domainName')}</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Fintech React Architects"
                        value={newCohort.name}
                        onChange={e => setNewCohort(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('groups.mission')}</label>
                       <textarea 
                        required
                        rows={4}
                        placeholder="Define what makes this cohort elite..."
                        value={newCohort.description}
                        onChange={e => setNewCohort(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                       />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        className="px-8 py-4 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-900"
                      >
                        {t('groups.discard')}
                      </button>
                      <button 
                        type="submit"
                        className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-100"
                      >
                        {t('groups.finalize')}
                      </button>
                    </div>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
