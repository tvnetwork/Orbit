import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Save, 
  Plus, 
  X,
  Code,
  CheckCircle,
  Briefcase,
  RefreshCw,
  Zap,
  Target,
  Award,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile, updateRole } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    professionalTitle: profile?.professionalTitle || '',
    location: profile?.location || '',
    portfolio: profile?.portfolio || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    projectUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        professionalTitle: profile.professionalTitle || '',
        location: profile.location || '',
        portfolio: profile.portfolio || [],
      });
    }
  }, [profile]);

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!form.skills.includes(newSkill.trim())) {
        setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSwitchRole = async (role: UserRole) => {
    if (!user || role === profile?.role) return;
    setLoading(true);
    try {
      await updateRole(role);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error switching role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName,
        bio: form.bio,
        skills: form.skills,
        professionalTitle: form.professionalTitle,
        location: form.location,
        portfolio: form.portfolio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = () => {
    if (!newPortfolioItem.title) return;
    const item = {
      ...newPortfolioItem,
      id: Math.random().toString(36).substring(7)
    };
    setForm(prev => ({ ...prev, portfolio: [...prev.portfolio, item] }));
    setNewPortfolioItem({ title: '', description: '', projectUrl: '', imageUrl: '' });
    setShowPortfolioModal(false);
  };

  const removePortfolioItem = (id: string) => {
    setForm(prev => ({ ...prev, portfolio: prev.portfolio.filter(item => item.id !== id) }));
  };

  const handleRequestVerification = async () => {
    if (!user || profile?.verificationStatus !== 'none') return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending'
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };


  // Stats array removed as per user request

  return (
    <div className="bg-gray-50/50 min-h-screen py-20 px-4 md:px-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Breadcrumb/Title Area */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{t('profile.userProfile')}</h1>
            <p className="text-gray-500 font-medium">{t('profile.manageIdentity')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex -space-x-2 overflow-hidden px-2">
                {[1,2,3].map(i => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100" />
                ))}
             </div>
             <p className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-widest">{t('profile.globalRanking')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden sticky top-32"
            >
              {/* Cover Area */}
              <div className="h-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
              </div>

              <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6">
                  <div className="h-32 w-32 rounded-3xl border-4 border-white bg-white overflow-hidden shadow-2xl relative group">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="h-full w-full p-8 text-gray-300 bg-gray-50" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <RefreshCw className="text-white h-6 w-6" />
                    </div>
                  </div>
                  {profile?.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg" title="Identity Verified">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{profile?.displayName || 'Set Display Name'}</h2>
                    <p className="font-medium text-indigo-600 text-sm mt-1">{profile?.professionalTitle || 'Set Professional Title'}</p>
                    <p className="text-gray-500 flex items-center gap-2 mt-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-300" /> {user?.email}
                    </p>
                  </div>

                  {/* Stats section removed as per user request */}

                  <div className="pt-6 border-t border-gray-50 space-y-4">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Account Type</p>
                     <div className="bg-gray-50 p-1.5 rounded-[1.5rem] flex gap-1 w-full border border-gray-100 relative shadow-inner">
                        {(['freelancer', 'client'] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => handleSwitchRole(role)}
                            className={cn(
                              "relative flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all z-10",
                              profile?.role === role 
                                ? "text-gray-900" 
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {role === 'freelancer' ? <Zap className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                            <span>{t(`role.${role}`)}</span>
                            {profile?.role === role && (
                              <motion.div 
                                layoutId="role-bg"
                                className="absolute inset-0 bg-white rounded-2xl shadow-md -z-0 border border-gray-200/50"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Section / Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               style={{ width: '100%', maxWidth: '100%' }}
               className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
            >
              <div className="p-8 md:p-12 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-50">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                      {t('profile.generalInfo')}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{t('profile.manageIdentity')}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none lg:min-w-[180px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Progress</span>
                        <span className="text-xs font-black text-indigo-600">80%</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '80%' }}
                          className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                          transition={{ duration: 1.2, ease: "circOut" }}
                        />
                      </div>
                    </div>
                    <div className="h-10 w-px bg-gray-100 hidden sm:block" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Link 
                        to={`/profile/${user?.uid}`}
                        className="bg-gray-50 text-gray-600 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100 text-[10px] uppercase tracking-widest whitespace-nowrap"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        View Public
                      </Link>
                      <motion.button 
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave()}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 text-[10px] uppercase tracking-widest justify-center min-w-[120px]"
                      >
                        <AnimatePresence mode="wait">
                          {saved ? (
                            <motion.div
                              key="saved"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> {t('profile.saved')}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="save"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2"
                            >
                              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              {t('profile.saveChanges')}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group space-y-3">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                      <UserIcon className="h-3 w-3" /> {t('profile.fullName')}
                    </label>
                    <input 
                      type="text" 
                      value={form.displayName}
                      onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-transparent px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300"
                      placeholder={t('profile.fullNamePlaceholder')}
                    />
                  </div>
                  <div className="group space-y-3">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                      <Award className="h-3 w-3" /> Professional Title
                    </label>
                    <input 
                      type="text" 
                      value={form.professionalTitle}
                      onChange={e => setForm(prev => ({ ...prev, professionalTitle: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-transparent px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300"
                      placeholder="e.g. Senior Fullstack Developer"
                    />
                  </div>
                </div>

                <div className="group space-y-3">
                  <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                    <MapPin className="h-3 w-3" /> {t('profile.location')}
                  </label>
                  <input 
                    type="text" 
                    value={form.location}
                    onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-transparent px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300"
                    placeholder={t('profile.locationPlaceholder') || "e.g. London, UK / Remote"}
                  />
                </div>

                <div className="group space-y-3">
                  <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                    <Briefcase className="h-3 w-3" /> Professional Bio & Experience
                  </label>
                  <textarea 
                    rows={8}
                    value={form.bio}
                    onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('profile.bioPlaceholder')}
                    className="w-full bg-gray-50/50 border border-transparent px-8 py-6 rounded-[2rem] focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-base leading-relaxed text-gray-700 shadow-inner"
                  />
                </div>

                <div className="group space-y-6 pt-6">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                      <Code className="h-3 w-3" /> Skillset & Expertise
                    </label>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{form.skills.length} / 15 Skills Used</span>
                  </div>
                  <div className="relative group/input">
                    <input 
                      type="text" 
                      placeholder="Add a new skill (e.g. UI Design)"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={addSkill}
                      className="w-full bg-gray-50/50 border border-gray-100 px-8 py-5 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-400 border border-gray-200 rounded text-[10px] font-black leading-none">ENTER</kbd>
                       <Plus className="h-5 w-5 text-indigo-300 group-focus-within/input:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence mode="popLayout">
                      {form.skills.map(skill => (
                        <motion.div 
                          key={skill} 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="bg-white text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 group/tag cursor-default border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
                        >
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => removeSkill(skill)} 
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {form.skills.length === 0 && (
                      <div className="w-full py-8 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-sm text-gray-400 italic">No skills added yet. Help clients find you by adding your expertise.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Portfolio Section */}
            <motion.div 
               ref={portfolioRef}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-10 md:p-12 mt-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Portfolio & Showcase</h3>
                  <p className="text-sm text-gray-500 mt-1">Display your best work and case studies.</p>
                </div>
                <button 
                  onClick={() => setShowPortfolioModal(true)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.portfolio.map((item) => (
                  <div key={item.id} className="group relative bg-gray-50 rounded-2xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg transition-all">
                    <button 
                      onClick={() => removePortfolioItem(item.id)}
                      className="absolute top-4 right-4 p-1.5 bg-gray-100 text-gray-400 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                    {item.projectUrl && (
                      <a 
                        href={item.projectUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                      >
                        View Project <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
                {form.portfolio.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-sm text-gray-400 italic">No portfolio items added yet. Showcase your skills with real-world examples.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Verification / Security Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 onClick={handleRequestVerification}
                 className={cn(
                   "p-8 rounded-[2.5rem] border flex items-start gap-6 group transition-colors cursor-pointer",
                   profile?.verificationStatus === 'verified' 
                    ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100" 
                    : profile?.verificationStatus === 'pending'
                    ? "bg-amber-50 border-amber-100 cursor-default"
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                 )}
               >
                 <div className={cn(
                   "h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-xl transition-transform group-hover:scale-110",
                   profile?.verificationStatus === 'verified' ? "text-emerald-600" : profile?.verificationStatus === 'pending' ? "text-amber-500" : "text-gray-400"
                 )}>
                    <ShieldCheck className="h-8 w-8" />
                 </div>
                 <div className="space-y-1 flex-1">
                   <h4 className={cn(
                     "font-bold text-lg",
                     profile?.verificationStatus === 'verified' ? "text-emerald-900" : profile?.verificationStatus === 'pending' ? "text-amber-900" : "text-gray-900"
                   )}>
                     {profile?.verificationStatus === 'verified' ? t('profile.identityVerified') : profile?.verificationStatus === 'pending' ? "Verification Pending" : "Request Verification"}
                   </h4>
                   <p className={cn(
                     "text-sm leading-relaxed",
                     profile?.verificationStatus === 'verified' ? "text-emerald-700/70" : profile?.verificationStatus === 'pending' ? "text-amber-700/70" : "text-gray-500"
                   )}>
                     {profile?.verificationStatus === 'verified' 
                      ? t('profile.identityDesc') 
                      : profile?.verificationStatus === 'pending'
                      ? "Our team is currently reviewing your profile and identity documents."
                      : "Upgrade your account to elite status to gain higher visibility and trust."}
                   </p>
                   {profile?.verificationStatus === 'none' && (
                     <p className="text-xs font-bold text-indigo-600 mt-2 flex items-center gap-1 uppercase tracking-widest">
                       {t('profile.upgradeStatus')} <ChevronRight className="h-3 w-3" />
                     </p>
                   )}
                 </div>
               </motion.div>


            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPortfolioModal(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-6 sm:px-10 sm:pt-10 sm:pb-6 flex justify-between items-center sm:items-start border-b border-gray-50 flex-shrink-0">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 leading-none">Add Portfolio Project</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Showcase your achievement</p>
                </div>
                <button onClick={() => setShowPortfolioModal(false)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 space-y-8 min-h-0">
                <div className="space-y-6">
                  <div className="group space-y-2">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                       <Award className="h-3 w-3" /> Project Title
                    </label>
                    <input 
                      type="text" 
                      value={newPortfolioItem.title}
                      onChange={e => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-transparent focus:border-indigo-500 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-medium text-gray-900"
                      placeholder="e.g. Vynta Finance App"
                    />
                  </div>
                  <div className="group space-y-2">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                       <Briefcase className="h-3 w-3" /> Description
                    </label>
                    <textarea 
                      rows={4}
                      value={newPortfolioItem.description}
                      onChange={e => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-transparent focus:border-indigo-500 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-medium text-gray-900 leading-relaxed"
                      placeholder="What did you build and which technologies were used?"
                    />
                  </div>
                  <div className="group space-y-2">
                    <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                       <Zap className="h-3 w-3" /> Project URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      value={newPortfolioItem.projectUrl}
                      onChange={e => setNewPortfolioItem(prev => ({ ...prev, projectUrl: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-transparent focus:border-indigo-500 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-medium text-gray-900"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:px-10 sm:pb-10 sm:pt-6 border-t border-gray-50 flex-shrink-0 bg-white">
                <button 
                  onClick={addPortfolioItem}
                  disabled={!newPortfolioItem.title}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <Plus className="h-5 w-5" /> Add Project
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                  Changes will be saved to your profile
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
