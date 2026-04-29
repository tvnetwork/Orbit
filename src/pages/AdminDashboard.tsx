import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
  Layers
} from 'lucide-react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Job } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

type TabType = 'users' | 'jobs' | 'cohorts' | 'kyc' | 'financials';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const jobsSnap = await getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')));
        const cohortsSnap = await getDocs(query(collection(db, 'cohorts'), orderBy('createdAt', 'desc')));
        const kycSnap = await getDocs(query(collection(db, 'kyc'), where('status', '==', 'pending')));
        
        setUsers(usersSnap.docs.map(d => ({ ...d.data(), uid: d.id }) as UserProfile));
        setJobs(jobsSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Job));
        setCohorts(cohortsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setKycDocs(kycSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin');
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
            {(['users', 'jobs', 'cohorts', 'kyc'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
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
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cohorts</p>
              <p className="text-2xl font-black text-gray-900">{cohorts.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">KYC Pending</p>
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
                placeholder={`Search ${activeTab}...`} 
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
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification</th>
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
                        <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
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
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Project</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Value</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
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
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cohort Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Members</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Feature Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
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
                           <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">Pending Review</span>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                            <p className="font-black text-gray-900">{doc.userId}</p>
                         </div>
                         <div className="pt-6 flex gap-4">
                            <button 
                              onClick={() => approveKyc(doc.id, doc.userId)}
                              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                              Approve
                            </button>
                            <button className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                              Reject
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                     <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto opacity-20" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">All kyc docs cleared.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
