import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Shield, 
  Search,
  Filter,
  MoreVertical,
  Star,
  FileText,
  DollarSign,
  Layers,
  MessageSquare
} from 'lucide-react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Job } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

type TabType = 'users' | 'jobs' | 'cohorts' | 'kyc' | 'financials' | 'support';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersSnap, jobsSnap, cohortsSnap, kycSnap, supportSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))).catch(e => {
            handleFirestoreError(e, OperationType.LIST, 'users');
            return { docs: [] };
          }),
          getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))).catch(e => {
            handleFirestoreError(e, OperationType.LIST, 'jobs');
            return { docs: [] };
          }),
          getDocs(query(collection(db, 'cohorts'), orderBy('createdAt', 'desc'))).catch(e => {
            handleFirestoreError(e, OperationType.LIST, 'cohorts');
            return { docs: [] };
          }),
          getDocs(query(collection(db, 'kyc'), where('status', '==', 'pending'))).catch(e => {
            handleFirestoreError(e, OperationType.LIST, 'kyc');
            return { docs: [] };
          }),
          getDocs(query(collection(db, 'support_messages'), orderBy('createdAt', 'desc'))).catch(e => {
            handleFirestoreError(e, OperationType.LIST, 'support_messages');
            return { docs: [] };
          })
        ]);
        
        setUsers(usersSnap.docs.map(d => ({ ...d.data(), uid: d.id }) as UserProfile));
        setJobs(jobsSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Job));
        setCohorts(cohortsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setKycDocs(kycSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSupportMessages(supportSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Admin fetching error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return;
    try {
      await deleteDoc(doc(db, 'jobs', id));
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `jobs/${id}`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'support_messages', id));
      setSupportMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCohortFeatured = async (id: string, featured: boolean) => {
    try {
      await updateDoc(doc(db, 'cohorts', id), { featured });
      setCohorts(prev => prev.map(c => c.id === id ? { ...c, featured } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const approveKyc = async (kycId: string, userId: string) => {
    try {
      await updateDoc(doc(db, 'kyc', kycId), { status: 'approved' });
      await updateDoc(doc(db, 'users', userId), { verificationStatus: 'verified' });
      setKycDocs(prev => prev.filter(k => k.id !== kycId));
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, verificationStatus: 'verified' } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (uid: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: role as any } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCohorts = cohorts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSupport = supportMessages.filter(m => 
    (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.message?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Shield className="h-10 w-10 text-indigo-600 opacity-20" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('admin.control')}</h1>
            </div>
            <p className="text-gray-500">{t('admin.subtitle')}</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            {(['users', 'jobs', 'cohorts', 'kyc', 'support', 'financials'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'support' ? t('admin.support') : tab}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('admin.totalUsers')}</p>
              <p className="text-2xl font-black text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('admin.totalJobs')}</p>
              <p className="text-2xl font-black text-gray-900">{jobs.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('admin.cohorts')}</p>
              <p className="text-2xl font-black text-gray-900">{cohorts.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('admin.kycPending')}</p>
              <p className="text-2xl font-black text-gray-900">{kycDocs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder={
                  activeTab === 'users' ? t('admin.searchUsers') :
                  activeTab === 'jobs' ? t('admin.searchJobs') :
                  activeTab === 'cohorts' ? t('admin.searchCohorts') :
                  activeTab === 'kyc' ? t('admin.searchKYC') :
                  activeTab === 'support' ? t('admin.searchSupport') :
                  t('admin.searchUsers')
                } 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.user')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.role')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.verification')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.joined')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(user => (
                    <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="h-10 w-10 rounded-xl" alt="" />
                          <div>
                            <p className="font-bold text-gray-900">{user.displayName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{user.role}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          user.verificationStatus === 'verified' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {user.verificationStatus}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === user.uid ? null : user.uid)}
                            className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <AnimatePresence>
                            {activeMenuId === user.uid && (
                              <motion.div 
                                ref={menuRef}
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left"
                              >
                                <button className="w-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                  <Shield className="h-3.5 w-3.5" /> {t('admin.suspendAccount')}
                                </button>
                                <button className="w-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5" /> {t('admin.viewActivity')}
                                </button>
                                <button 
                                  onClick={() => handleUpdateUserRole(user.uid, user.role === 'client' ? 'freelancer' : 'client')}
                                  className="w-full px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                >
                                  <Users className="h-3.5 w-3.5" /> {t('admin.switchTo', { role: user.role === 'client' ? 'Freelancer' : 'Client' })}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'jobs' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('dashboard.activeProject')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('jobs.budget')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('jobs.status.open')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{job.description}</p>
                      </td>
                      <td className="px-8 py-6 font-black text-gray-900">${job.budget}</td>
                      <td className="px-8 py-6">
                         <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">{job.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-5 w-5" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'cohorts' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.cohortName')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.members')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('admin.featureStatus')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCohorts.map(cohort => (
                    <tr key={cohort.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-900">{cohort.name}</p>
                        <p className="text-xs text-gray-400">{cohort.description}</p>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-600">{cohort.membersCount || 0}</td>
                      <td className="px-8 py-6">
                         <button 
                          onClick={() => toggleCohortFeatured(cohort.id, !cohort.featured)}
                          className={cn(
                           "p-2 rounded-xl transition-all",
                           cohort.featured ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-300"
                         )}>
                            <Star className={cn("h-5 w-5", cohort.featured && "fill-yellow-600")} />
                         </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                            <MoreVertical className="h-5 w-5" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'kyc' && (
              <div className="p-8">
                {kycDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {kycDocs.map(doc => (
                      <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                         <div className="flex justify-between items-start">
                           <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                             <FileText className="h-7 w-7" />
                           </div>
                           <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">{t('admin.pendingReview')}</span>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('messages.userId')}</p>
                            <p className="font-black text-gray-900">{doc.userId}</p>
                         </div>
                         <div className="pt-6 flex gap-4">
                            <button 
                              onClick={() => approveKyc(doc.id, doc.userId)}
                              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                              {t('admin.approve')}
                            </button>
                            <button className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                              {t('admin.reject')}
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                     <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto opacity-20" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('admin.kycCleared')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="p-8">
                {filteredSupport.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredSupport.map(msg => (
                      <div key={msg.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
                         <div className="flex justify-between items-start">
                           <div className={cn(
                             "h-14 w-14 rounded-2xl flex items-center justify-center",
                             msg.type === 'live_chat' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                           )}>
                             {msg.type === 'live_chat' ? <MessageSquare className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                           </div>
                           <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                               msg.status === 'unread' || msg.status === 'active' ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                             )}>
                               {msg.status}
                             </span>
                             <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                         </div>
                         
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{msg.subject || 'No Subject'}</p>
                            <p className="font-black text-gray-900">{msg.email || msg.userEmail}</p>
                            {msg.firstName && <p className="text-xs text-gray-500 font-medium">{msg.firstName} {msg.lastName}</p>}
                         </div>

                         <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed max-h-48 overflow-y-auto">
                            {msg.type === 'live_chat' ? (
                              <div className="space-y-3">
                                {msg.messages?.map((m: any, idx: number) => (
                                  <div key={idx} className={cn("text-xs", m.sender === 'user' ? "text-indigo-600" : "text-gray-400")}>
                                     <span className="font-black mr-2">[{m.sender.toUpperCase()}]:</span> {m.text}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              msg.message
                            )}
                         </div>

                         <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(msg.createdAt)}</p>
                            {msg.type === 'live_chat' && (
                              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Live Transcript</p>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                     <MessageSquare className="h-12 w-12 text-gray-400 mx-auto opacity-20" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('admin.noMessages')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="relative min-h-[600px] flex items-center justify-center p-8">
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100">
                      <DollarSign className="h-10 w-10 animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">{t('admin.platformTreasury')}</h3>
                    <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed mb-8">
                      {t('admin.financialsDesc')}
                    </p>
                    <div className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                      {t('common.comingSoon')}
                    </div>
                 </div>
                 <div className="w-full opacity-20 blur-md pointer-events-none select-none p-12 space-y-12">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="h-40 bg-gray-100 rounded-3xl" />
                       <div className="h-40 bg-gray-100 rounded-3xl" />
                    </div>
                    <div className="h-64 bg-gray-100 rounded-3xl" />
                    <div className="space-y-4">
                       <div className="h-12 bg-gray-100 rounded-xl" />
                       <div className="h-12 bg-gray-100 rounded-xl" />
                       <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
