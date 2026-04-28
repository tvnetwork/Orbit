import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
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
  Target
} from 'lucide-react';
import { UserRole } from '../types';

export default function Profile() {
  const { user, profile, updateRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName,
        bio: form.bio,
        skills: form.skills,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
        >
          {/* Cover Area */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-16 left-12 h-32 w-32 rounded-3xl border-4 border-white bg-gray-100 overflow-hidden shadow-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-full w-full p-6 text-gray-400" />
              )}
            </div>
          </div>

          <div className="pt-20 px-12 pb-12 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile?.displayName}</h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" /> {user?.email}
                  </p>
                </div>
                
                {/* Role Switcher */}
                <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1 w-fit border border-gray-100 relative">
                  {(['freelancer', 'client'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleSwitchRole(role)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all z-10 ${
                        profile?.role === role 
                          ? 'text-gray-900' 
                          : 'text-gray-400 hover:text-gray-600 outline-none'
                      }`}
                    >
                      {role === 'freelancer' ? <Zap className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                      <span className="capitalize">{role}</span>
                      {profile?.role === role && (
                        <motion.div 
                          layoutId="role-bg"
                          className="absolute inset-0 bg-white rounded-xl shadow-sm -z-0 border border-gray-200/50"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 min-w-[140px] justify-center"
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
                      <CheckCircle className="h-4 w-4" /> Saved!
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="save"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                <div className="group space-y-2">
                  <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <UserIcon className="h-3 w-3" /> Display Name
                  </label>
                  <input 
                    type="text" 
                    value={form.displayName}
                    onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="group space-y-2">
                  <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <Briefcase className="h-3 w-3" /> Bio & Experience
                  </label>
                  <textarea 
                    rows={6}
                    value={form.bio}
                    onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell your story..."
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm leading-relaxed"
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="group space-y-4">
                  <label className="text-xs font-bold text-gray-400 group-focus-within:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <Code className="h-3 w-3" /> Skills & Expertise
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Add a skill (Press Enter)"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={addSkill}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    />
                    <Plus className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {form.skills.map(skill => (
                        <motion.span 
                          key={skill} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 group/tag cursor-default border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {form.skills.length === 0 && <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 space-y-2">
                   <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                     <MapPin className="h-4 w-4" /> Global Settings
                   </h4>
                   <p className="text-xs text-orange-700 leading-relaxed">
                     Your profile is currently visible to everyone in the Orbit network. You can change your visibility in the privacy center.
                   </p>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
