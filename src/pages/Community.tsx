import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Users, 
  Award, 
  Trophy, 
  ChevronRight, 
  Zap, 
  Target, 
  Sparkles, 
  Code, 
  Brain, 
  Palette, 
  Globe, 
  CheckCircle2, 
  Plus, 
  X, 
  Star,
  Send,
  User as UserIcon,
  Search,
  Hash
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { cn, formatTime } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  deleteDoc, 
  orderBy, 
  setDoc, 
  getDoc,
  getDocs,
  limit,
  where
} from 'firebase/firestore';
import { useAuth } from '../App';

const ICON_MAP: Record<string, any> = {
  Code, Brain, Palette, Target, Globe, Zap, Sparkles, Award
};

export default function Community() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCohortId = searchParams.get('cohort');
  
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [forumLoading, setForumLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Real-time listener for cat counts
    const jobsQ = query(collection(db, 'jobs'), where('status', '==', 'open'), limit(500));
    const unsubJobs = onSnapshot(jobsQ, (snap) => {
        const categories: Record<string, number> = {};
        snap.forEach(d => {
          const cat = d.data().category;
          if (cat) categories[cat] = (categories[cat] || 0) + 1;
        });
        setCatCounts(categories);
    });
    return unsubJobs;
  }, []);

  // Fetch User Profile
  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      });
    }
  }, [user]);

  // Fetch Featured Cohorts
  useEffect(() => {
    const q = query(collection(db, 'cohorts'), where('featured', '==', true), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCohorts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const [mentors, setMentors] = useState<any[]>([]);

  // Fetch Mentors (just top rated freelancers)
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'freelancer'),
      where('verificationStatus', '==', 'verified'),
      limit(3)
    );
    const unsubMentors = onSnapshot(q, (snap) => {
      setMentors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubMentors;
  }, []);

  // Fetch Forum Messages
  useEffect(() => {
    const collectionName = selectedCohortId ? `cohorts/${selectedCohortId}/messages` : 'community_messages';
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    setForumLoading(true);
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setForumLoading(false);
    });
    return unsubscribe;
  }, [selectedCohortId]);

  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Real-time listener for "online" users (active in last 10 mins)
    const tenMinsAgo = new Date();
    tenMinsAgo.setMinutes(tenMinsAgo.getMinutes() - 10);
    const q = query(collection(db, 'users'), where('lastActive', '>=', tenMinsAgo), limit(100));
    const unsubOnline = onSnapshot(q, (snap) => {
      setOnlineCount(snap.size);
    });
    return unsubOnline;
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    
    const text = newMessage;
    setNewMessage('');

    try {
      const collectionName = selectedCohortId ? `cohorts/${selectedCohortId}/messages` : 'community_messages';
      await addDoc(collection(db, collectionName), {
        senderId: user.uid,
        senderName: profile?.displayName || 'Anonymous',
        senderPhoto: profile?.photoURL || user.photoURL || null,
        text,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-12 gap-10">
        
        {/* Left Sidebar: Navigation & Featured */}
        <div className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 h-fit">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Explore</h3>
             <div className="space-y-2">
                <button 
                  onClick={() => navigate('/community')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                    !selectedCohortId ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"
                  )}
                >
                  <Globe className="h-4 w-4" />
                  Global Forum
                </button>
                <button 
                  onClick={() => navigate('/groups')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-50 transition-all"
                >
                  <Users className="h-4 w-4" />
                  All Cohorts
                </button>
             </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 space-y-6">
             <h3 className="font-black text-lg flex items-center gap-2">
               <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
               Elite Mentors
             </h3>
             <div className="space-y-4">
                {mentors.map(mentor => (
                  <Link key={mentor.id} to={`/freelancer/${mentor.id}`} className="flex items-center gap-3 group">
                    <img 
                      src={mentor.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.displayName || 'M')}`} 
                      className="h-10 w-10 bg-white/20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm" 
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-sm truncate max-w-[120px]">{mentor.displayName}</p>
                      <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest leading-none mt-0.5">{mentor.professionalTitle || 'Lead Expert'}</p>
                    </div>
                  </Link>
                ))}
                {mentors.length === 0 && (
                  <p className="text-xs text-indigo-200 opacity-60">Scanning for domain masters...</p>
                )}
             </div>
          </div>
        </div>

        {/* Center: The Forum Chat */}
        <div className="col-span-12 lg:col-span-6 space-y-6 h-[calc(100vh-140px)] flex flex-col">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  {selectedCohortId ? <Hash className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                </div>
                <div>
                   <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                     {selectedCohortId ? `Cohort Channel` : 'Global Nexus Forum'}
                   </h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                     {selectedCohortId ? 'Exclusive Discussion' : 'Public Domain Intelligence'}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", onlineCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{onlineCount} Domain Masters Online</span>
             </div>
          </div>

          {/* Chat Bubble Area */}
          <div className="flex-1 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
             <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user?.uid;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={cn(
                        "flex gap-4",
                        isMine ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <img 
                        src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}`} 
                        className="h-10 w-10 rounded-xl shadow-sm border border-gray-100 shrink-0 object-cover" 
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                      <div className={cn(
                        "flex flex-col",
                        isMine ? "items-end" : "items-start"
                      )}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mx-1">{msg.senderName}</p>
                        <div className={cn(
                          "max-w-md px-6 py-4 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed",
                          isMine ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-50 text-gray-900 border border-gray-100 rounded-tl-none"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2 mx-2">
                          {msg.createdAt?.toDate ? formatTime(msg.createdAt) : 'Sending...'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
             </div>

             {/* Input */}
             <div className="p-8 border-t border-gray-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                   <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Broadcast to the domain masters..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-300 transition-all shadow-inner"
                      />
                   </div>
                   <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-8 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
                   >
                     <Send className="h-5 w-5" />
                   </button>
                </form>
             </div>
          </div>
        </div>

        {/* Right Sidebar: Trends & Featured Cohorts */}
        <div className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 h-fit">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Active Fields</h3>
             <div className="space-y-6">
                {[
                  { tag: 'nextjs', posts: catCounts['Development'] || '0' },
                  { tag: 'design', posts: catCounts['Design'] || '0' },
                  { tag: 'ai_data', posts: catCounts['AI & Data'] || '0' }
                ].map(trend => (
                  <div key={trend.tag} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">#{trend.tag}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{trend.posts} ACTIVE</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-lg font-black text-gray-900 tracking-tight px-2 flex items-center justify-between">
               <span>Featured Cohorts</span>
               <Link to="/groups" className="text-[10px] text-indigo-600 uppercase tracking-widest">View All</Link>
             </h3>
             <div className="space-y-4">
                {cohorts.map(cohort => (
                  <Link 
                    key={cohort.id} 
                    to={`/community?cohort=${cohort.id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <Users className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-gray-900 text-sm truncate">{cohort.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cohort.membersCount} Members</p>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
