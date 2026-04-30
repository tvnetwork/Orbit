import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Globe, 
  Eye, 
  Cloud, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Camera,
  Upload,
  Lock,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { useTranslation } from 'react-i18next';

const TABS = (t: any) => [
  { id: 'profile', label: t('settings.tabProfile'), icon: User },
  { id: 'notifications', label: t('settings.tabAlerts'), icon: Bell },
  { id: 'security', label: t('settings.tabSecurity'), icon: Shield },
  { id: 'kyc', label: t('settings.tabVerification'), icon: Key },
];

export default function Settings() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const tabs = TABS(t);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    timezone: profile?.timezone || 'UTC-5',
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName,
        bio: form.bio,
        location: form.location,
        timezone: form.timezone,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!user) return;
    setKycSubmitting(true);
    try {
      const kycId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'kyc', kycId), {
        userId: user.uid,
        type: 'passport',
        status: 'pending',
        submittedAt: serverTimestamp()
      });
      // Update user verification status
      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setKycSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('settings.title')}</h1>
          <p className="text-gray-500 mt-1 font-medium italic">{t('settings.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Nav Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all text-left",
                  activeTab === tab.id 
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-200" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
            
            <div className="pt-8 mt-8 border-t border-gray-100">
               <button className="w-full flex items-center gap-4 px-6 py-4 text-red-400 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all">
                 <Trash2 className="h-4 w-4" />
                 {t('settings.deleteAccount')}
               </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 min-h-[600px]"
            >
              {activeTab === 'profile' && (
                <div className="space-y-12">
                  <div className="flex items-center gap-10">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-gray-50 shadow-inner group-hover:opacity-80 transition-all">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="h-full w-full p-8 text-gray-300" />
                        )}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg border-2 border-white hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('settings.identityAvatar')}</h3>
                      <p className="text-gray-400 text-sm font-medium mt-1">{t('settings.avatarDesc')}</p>
                      <button className="mt-4 text-sm font-black text-indigo-600 hover:underline underline-offset-4 decoration-2">{t('settings.removePhoto')}</button>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('settings.fullName')}</label>
                       <input 
                        type="text"
                        value={form.displayName}
                        onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('settings.emailAddress')}</label>
                       <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                         <input 
                          disabled
                          type="email"
                          value={user?.email || ''}
                          className="w-full bg-gray-100 border border-transparent rounded-2xl px-14 py-4 font-bold text-gray-400 cursor-not-allowed"
                         />
                       </div>
                    </div>
                    <div className="col-span-full space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('settings.bioHeadline')}</label>
                       <textarea 
                        rows={4}
                        value={form.bio}
                        onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder={t('settings.bioPlaceholder')}
                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                       />
                    </div>
                    <div className="col-span-full flex justify-end">
                      <button 
                        disabled={isSaving}
                        className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-100"
                      >
                        {isSaving ? <Cloud className="h-4 w-4 animate-bounce" /> : <CheckCircle2 className="h-4 w-4" />}
                        {t('settings.persistChanges')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'kyc' && (
                <div className="space-y-12">
                   <div>
                     <h3 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings.financialShield')}</h3>
                     <p className="text-gray-500 mt-1 font-medium">{t('settings.kycDesc')}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className={cn(
                       "p-8 rounded-[2.5rem] border-2 space-y-6 transition-all",
                       profile?.verificationStatus === 'verified' ? "bg-emerald-50 border-emerald-100" :
                       profile?.verificationStatus === 'pending' ? "bg-orange-50 border-orange-100" :
                       "bg-gray-50 border-gray-100"
                     )}>
                        <div className="flex justify-between items-start">
                          <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center",
                            profile?.verificationStatus === 'verified' ? "bg-emerald-500 text-white" : "bg-white text-gray-400"
                          )}>
                            <Key className="h-7 w-7" />
                          </div>
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            profile?.verificationStatus === 'verified' ? "bg-emerald-100 text-emerald-600" : "bg-white text-gray-400"
                          )}>
                            {profile?.verificationStatus || 'unverified'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{t('settings.identityDocument')}</h4>
                          <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed">{t('settings.kycNote')}</p>
                        </div>
                        
                        {profile?.verificationStatus === 'none' && (
                          <button 
                            onClick={handleKycSubmit}
                            disabled={kycSubmitting}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                          >
                             {kycSubmitting ? t('settings.processing') : t('settings.uploadId')}
                             <Upload className="h-4 w-4" />
                          </button>
                        )}
                        {profile?.verificationStatus === 'pending' && (
                          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl text-xs font-bold text-orange-600 italic">
                             <AlertCircle className="h-4 w-4" />
                             {t('settings.humanReview')}
                          </div>
                        )}
                     </div>

                     <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
                        <div className="space-y-4 relative">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                          <h4 className="text-xl font-black tracking-tight leading-tight">{t('settings.verificationBenefits')}</h4>
                          <ul className="space-y-3 text-sm text-gray-400 font-medium font-sans">
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                              {t('settings.benefit1')}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                              {t('settings.benefit2')}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                              {t('settings.benefit3')}
                            </li>
                          </ul>
                        </div>
                        <div className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('settings.poweredBy')}</div>
                     </div>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12">
                   <div>
                     <h3 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings.shieldAccess')}</h3>
                     <p className="text-gray-500 mt-1 font-medium">{t('settings.securityDesc')}</p>
                   </div>

                   <div className="space-y-6">
                      <div className="p-8 bg-gray-50 rounded-[2.5rem] flex items-center justify-between border border-gray-100 group hover:bg-white hover:border-indigo-100 transition-all">
                         <div className="flex items-center gap-6">
                           <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm transition-colors group-hover:text-indigo-600">
                             <Lock className="h-6 w-6" />
                           </div>
                           <div>
                             <h4 className="font-black text-gray-900 tracking-tight leading-tight">{t('settings.masterPassword')}</h4>
                             <p className="text-xs text-gray-500 font-medium mt-1">{t('settings.rotationNote')}</p>
                           </div>
                         </div>
                         <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">{t('settings.update')}</button>
                      </div>

                      <div className="p-8 bg-black rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                         <div className="flex items-center gap-6 relative">
                           <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                             <Smartphone className="h-6 w-6" />
                           </div>
                           <div>
                             <h4 className="font-black text-white tracking-tight leading-tight">{t('settings.twoFactor')}</h4>
                             <p className="text-xs text-gray-500 font-medium mt-1">{t('settings.biometricNote')}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                           <div className="h-6 w-12 bg-emerald-500 rounded-full relative">
                             <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[3rem] space-y-6">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-indigo-600" />
                        <h4 className="text-lg font-black text-indigo-900 tracking-tight">{t('settings.loginSessions')}</h4>
                      </div>
                      <div className="space-y-4">
                        {[
                          { device: 'Elite MacBook Pro', location: 'London, UK', active: true },
                          { device: 'iPhone 15 Ultra', location: 'London, UK', active: false }
                        ].map((sess, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-3 border-b border-indigo-100 last:border-0">
                            <div>
                              <p className="font-black text-indigo-900 tracking-tight leading-tight">{sess.device}</p>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{sess.location} • {sess.active ? t('settings.activeNow') : '3h ago'}</p>
                            </div>
                            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settings.logout')}</button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-12">
                   <div>
                     <h3 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings.signalFeed')}</h3>
                     <p className="text-gray-500 mt-1 font-medium italic">{t('settings.notificationsDesc')}</p>
                   </div>

                   <div className="space-y-8">
                     {[
                       { id: 'jobs', title: t('settings.optJobs'), desc: t('settings.optJobsDesc') },
                       { id: 'messages', title: t('settings.optMessages'), desc: t('settings.optMessagesDesc') },
                       { id: 'wallet', title: t('settings.optWallet'), desc: t('settings.optWalletDesc') },
                       { id: 'community', title: t('settings.optCommunity'), desc: t('settings.optCommunityDesc') }
                     ].map(opt => (
                       <div key={opt.id} className="flex items-center justify-between group">
                         <div className="space-y-1">
                           <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{opt.title}</h4>
                           <p className="text-xs text-gray-400 font-medium">{opt.desc}</p>
                         </div>
                         <div className="flex gap-4">
                            <button className="h-10 w-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-gray-300">
                               <Mail className="h-4 w-4" />
                            </button>
                            <button className="h-10 w-10 flex items-center justify-center bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200">
                               <Smartphone className="h-4 w-4" />
                            </button>
                         </div>
                       </div>
                     ))}
                   </div>

                   <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{t('settings.silenceMode')}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{t('settings.silenceModeDesc')}</p>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
