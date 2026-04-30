import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  Globe, 
  Github, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  Mail, 
  MessageSquare,
  Award,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Zap,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, limit, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';

export default function FreelancerProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHireModal, setShowHireModal] = useState(false);
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [offerDetails, setOfferDetails] = useState('');
  const [hiring, setHiring] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      const unsubProfile = onSnapshot(doc(db, 'users', id), (docSnap) => {
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${id}`);
      });

      const q = query(
        collection(db, 'reviews'),
        where('freelancerId', '==', id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const unsubReviews = onSnapshot(q, (snap) => {
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      return () => {
        unsubProfile();
        unsubReviews();
      };
    }
  }, [id]);

  useEffect(() => {
    if (user?.uid && showHireModal) {
      const q = query(
        collection(db, 'jobs'),
        where('clientId', '==', user.uid),
        where('status', '==', 'open')
      );
      const unsubscribe = onSnapshot(q, (snap) => {
        setClientJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user, showHireModal]);

  const handleChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?user=${profile.id}`);
  };

  const handleHire = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowHireModal(true);
  };

  const submitHireRequest = async () => {
    if (!selectedJobId || !user) return;
    setHiring(true);
    try {
      // Create a "client-initiated" proposal
      await addDoc(collection(db, 'proposals'), {
        jobId: selectedJobId,
        freelancerId: profile.id,
        clientId: user.uid, // Add clientId for easier filtering
        coverLetter: offerDetails || `I would like to hire you for this job based on your profile expertise.`,
        bidAmount: profile.hourlyRate || 50, // Default bid
        status: 'pending',
        type: 'offer', // New field to distinguish
        createdAt: serverTimestamp()
      });
      setHireSuccess(true);
      setTimeout(() => {
        setShowHireModal(false);
        setHireSuccess(false);
        setSelectedJobId('');
        setOfferDetails('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'proposals');
    } finally {
      setHiring(false);
    }
  };

  const submitReview = async () => {
    if (!user || !profile) return;
    setSubmittingReview(true);
    try {
      // Fetch current user's profile to get their name and photo for the review
      const currentUserSnap = await getDoc(doc(db, 'users', user.uid));
      const currentUserData = currentUserSnap.data();

      await addDoc(collection(db, 'reviews'), {
        freelancerId: profile.id,
        clientId: user.uid,
        clientName: currentUserData?.displayName || 'Anonymous Client',
        clientPhoto: currentUserData?.photoURL || null,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: serverTimestamp()
      });
      
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>;

  if (!profile) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-500 font-bold">{t('common.profileNotFound') || 'Profile not found.'}</p>
  </div>;

  const stats = [
    { label: t('profile.successRate'), value: '100%', icon: Zap, color: 'text-orange-500' },
    { label: t('profile.jobsCompleted'), value: profile.completedJobs || 0, icon: Briefcase, color: 'text-blue-500' },
    { label: t('profile.rating'), value: `${profile.rating || '5.0'}/5`, icon: Star, color: 'text-indigo-500' },
    { label: t('profile.verified'), value: profile.verificationStatus === 'verified' ? t('common.yes') : t('common.no'), icon: ShieldCheck, color: 'text-emerald-500' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Cover Backdrop */}
      <div className="h-64 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-80" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-2xl transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info Sidebar */}
          <aside className="lg:w-96 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <img 
                  src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random&size=200`} 
                  alt={profile.displayName}
                  className="h-48 w-48 rounded-full object-cover border-8 border-white relative"
                  referrerPolicy="no-referrer"
                />
                {profile.verificationStatus === 'verified' && (
                  <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.displayName}</h1>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm">{profile.professionalTitle || 'Elite Professional'}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={handleHire}
                  className="bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {t('profile.hireNow')}
                </button>
                <button 
                  onClick={handleChat}
                  className="bg-gray-50 text-gray-900 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  {t('profile.chat')}
                </button>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 w-full space-y-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <MapPin className="h-5 w-5" />
                    <span>{profile.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Clock className="h-5 w-5" />
                    <span>{profile.timezone || 'Global'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 py-2 justify-center">
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Globe className="h-5 w-5 text-gray-700" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Github className="h-5 w-5 text-gray-700" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Briefcase className="h-5 w-5 text-gray-700" />
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Zap className="h-5 w-5 text-gray-700" />
                    </a>
                  )}
                  <a href={`mailto:${profile.email}`} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Mail className="h-5 w-5 text-gray-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center">{t('profile.performanceSnapshot')}</h3>
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center space-y-1">
                    <div className="flex justify-center mb-2">
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 space-y-8">
            {/* Bio Card */}
            <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em] mb-6">
                <Star className="h-4 w-4" />
                {t('profile.aboutProfessional')}
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
                {t('profile.aboutSubtitle')}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed font-sans">
                {profile.bio || t('profile.aboutBioEmpty')}
              </p>

              <div className="mt-12 pt-12 border-t border-gray-50">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{t('profile.verifiedExpertise')}</h4>
                <div className="flex flex-wrap gap-3">
                  {profile.skills?.map((skill: string) => (
                    <div key={skill} className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 group hover:bg-indigo-600 transition-all duration-300">
                      <Zap className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                      <span className="text-sm font-bold text-indigo-900 group-hover:text-white">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Portfolio Grid */}
            <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em]">
                  <Globe className="h-4 w-4" />
                  {t('profile.verifiedPortfolio')}
                </div>
                <div className="text-xs font-bold text-gray-400">{t('profile.showingProjects', { count: profile.portfolio?.length || 0 })}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.portfolio?.map((project: any, i: number) => (
                  <motion.a 
                    key={project.id || i}
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -8 }}
                    className="group space-y-4 block"
                  >
                    <div className="aspect-[16/10] bg-gray-100 rounded-[2rem] overflow-hidden relative border border-gray-50 shadow-sm">
                      <img 
                        src={project.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'} 
                        className={cn(
                          "h-full w-full object-cover transition-all duration-500",
                          !project.imageUrl && "grayscale group-hover:grayscale-0"
                        )}
                        alt={project.title}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                          <ExternalLink className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{project.title}</h4>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-all" />
                      </div>
                      <p className="text-sm text-gray-500 font-sans line-clamp-2">{project.description}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
              
              {(!profile.portfolio || profile.portfolio.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                  <p className="text-gray-400 font-bold">{t('profile.noPortfolioShowcase')}</p>
                </div>
              )}
            </section>

            {/* Testimonials */}
            <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em]">
                  <Award className="h-4 w-4" />
                  {t('profile.clientFeedback')}
                </div>
                {user && user.uid !== profile.id && (
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    {showReviewForm ? t('profile.cancel') : t('profile.leaveReview')}
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-12 bg-gray-50 rounded-[2rem] p-8 border border-indigo-100 overflow-hidden"
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-4">{t('profile.rateExperienceWith', { name: profile.displayName })}</h4>
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button 
                          key={n} 
                          onClick={() => setReviewRating(n)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={cn(
                              "h-8 w-8 transition-colors", 
                              n <= reviewRating ? "text-orange-400 fill-orange-400" : "text-gray-300"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on the quality of work, communication, and speed..."
                      className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700 mb-6"
                    />
                    <button 
                      onClick={submitReview}
                      disabled={submittingReview || !reviewComment.trim()}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? t('profile.postingReview') : t('profile.postReview')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-8">
                {reviews.filter(r => r.visible !== false || user?.uid === profile.id).map((review) => (
                  <div key={review.id} className={cn(
                    "bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative",
                    review.visible === false && "opacity-60"
                  )}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={review.clientPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.clientName || 'C')}&background=random`}
                          className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-gray-900">{review.clientName || 'Client'}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star 
                                key={n} 
                                className={cn(
                                  "h-3 w-3", 
                                  n <= review.rating ? "text-orange-400 fill-orange-400" : "text-gray-300"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.createdAt?.toDate().toLocaleDateString()}</p>
                        {user?.uid === profile.id && (
                          <button 
                            onClick={async () => {
                              await updateDoc(doc(db, 'reviews', review.id), {
                                visible: review.visible === false
                              });
                            }}
                            className={cn(
                              "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors",
                              review.visible === false ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
                            )}
                          >
                            {review.visible === false ? <><Eye className="h-3 w-3" /> Show on Profile</> : <><EyeOff className="h-3 w-3" /> Hide from Profile</>}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative">
                    <p className="text-sm text-gray-500 italic text-center">{t('profile.noReviewsYet')}</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showHireModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !hiring && setShowHireModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl relative shrink-0 overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('profile.hireFreelancer', { name: profile.displayName })}</h3>
                    <p className="text-gray-500 font-medium">{t('profile.offerDirectDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setShowHireModal(false)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {hireSuccess ? (
                  <div className="py-12 text-center space-y-6">
                    <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{t('profile.offerSent')}</h4>
                      <p className="text-gray-500 mt-2">{t('profile.offerSentDesc')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('profile.selectJob')}</label>
                      <select 
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-900"
                      >
                        <option value="">{t('profile.chooseJob')}</option>
                        {clientJobs.map(job => (
                          <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                      </select>
                      {clientJobs.length === 0 && (
                        <p className="text-xs text-orange-500 font-bold">{t('profile.noOpenJobs')} <a href="/post-job" className="underline">{t('profile.postJobFirst')}</a></p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('profile.offerDetails')}</label>
                      <textarea 
                        rows={4}
                        value={offerDetails}
                        onChange={(e) => setOfferDetails(e.target.value)}
                        placeholder={t('profile.offerDetailsPlaceholder')}
                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <button 
                      onClick={submitHireRequest}
                      disabled={!selectedJobId || hiring}
                      className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {hiring ? t('profile.sendingOffer') : t('profile.sendWorkOffer')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
