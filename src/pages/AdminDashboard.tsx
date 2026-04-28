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
  MoreVertical
} from 'lucide-react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Job } from '../types';
import { formatDate } from '../lib/utils';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const jobsSnap = await getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')));
        
        setUsers(usersSnap.docs.map(d => ({ ...d.data(), uid: d.id }) as UserProfile));
        setJobs(jobsSnap.docs.map(d => ({ ...d.data(), id: d.id }) as Job));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', id));
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `jobs/${id}`);
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
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.description.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Control</h1>
            </div>
            <p className="text-gray-500">Manage the Orbit ecosystem and maintain platform integrity.</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {(['users', 'jobs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
              <p className="text-2xl font-black text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Jobs</p>
              <p className="text-2xl font-black text-gray-900">{jobs.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Open Reports</p>
              <p className="text-2xl font-black text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">
              <Filter className="h-4 w-4" /> Filter Log
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
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
                        <select 
                          value={user.role} 
                          onChange={(e) => handleUpdateUserRole(user.uid, e.target.value)}
                          className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="freelancer">Freelancer</option>
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
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
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Project</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Budget</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{job.description}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-900">${job.budget.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{job.type}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'open' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
