import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  CheckCircle,
  Briefcase,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function PublicProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!uid) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-indigo-100 rounded-full" />
          <p className="text-gray-400 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-gray-500 font-medium">User profile not found.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
          Go Back
        </button>
      </div>
    );
  }

  // Stats array removed as per user request

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden sticky top-24"
          >
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-800 relative" />
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6">
                <div className="h-32 w-32 rounded-3xl border-4 border-white bg-white overflow-hidden shadow-2xl relative group">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="h-full w-full p-8 text-gray-300 bg-gray-50" />
                  )}
                </div>
                {profile.verificationStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{profile.displayName}</h2>
                  <p className="font-medium text-indigo-600 text-sm mt-1">{profile.professionalTitle || 'Expert Professional'}</p>
                  <p className="text-gray-500 flex items-center gap-2 mt-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-300" /> {profile.location || 'Distributed'}
                  </p>
                </div>

                {/* Stats section removed as per user request */}

                <button 
                  onClick={() => navigate('/messages')}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" /> Contact {profile.displayName.split(' ')[0]}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12"
          >
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('profile.generalInfo')}</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {profile.bio || 'This professional hasn\'t added a bio yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('profile.fullName')} (Skills)</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map(skill => (
                    <span 
                      key={skill}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-gray-400 italic">No skills listed yet.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            ref={portfolioRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Showcase & Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.portfolio?.map((item) => (
                <div key={item.id} className="group bg-gray-50 rounded-2xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg transition-all">
                  <h4 className="font-bold text-gray-900 mb-2 truncate">{item.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
                  {item.projectUrl && (
                    <a 
                      href={item.projectUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Visit Project
                    </a>
                  )}
                </div>
              ))}
              {(!profile.portfolio || profile.portfolio.length === 0) && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-sm text-gray-400 italic">No portfolio items featured yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
