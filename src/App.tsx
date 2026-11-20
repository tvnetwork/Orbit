import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import TranslationPrompt from './components/TranslationPrompt';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from './components/PageTransition';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeToggle from './components/ThemeToggle';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LayoutDashboard,
  LogOut,
  Orbit as BrandIcon,
  Lock,
  Users,
  DollarSign,
  Globe,
  FileText
} from 'lucide-react';
import { cn } from './lib/utils';
import AuthModal from './components/AuthModal';
import EcosystemAppLauncher from './components/EcosystemAppLauncher';
import { 
  handleKontyraSSOCallback, 
  initiateKontyraSSO, 
  getStoredKontyraSession, 
  clearStoredKontyraSession, 
  ensureFirebaseAuth,
  KontyraSSOUser,
  KONTYRA_STORAGE_KEY
} from './lib/kontyraSso';

// Context
interface AuthContextType {
  user: FirebaseUser | KontyraSSOUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => void;
  loginWithGoogleAuth: () => Promise<void>;
  loginWithKontyra: () => void;
  logout: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Layout Component
const Footer = React.lazy(() => import('./components/Footer'));

const isNavActive = (pathname: string, to: string) =>
  to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

const Navbar = () => {
  const { user, profile, loading, login, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Update lastActive on navigation
  useEffect(() => {
    if (user && auth.currentUser) {
      const docRef = doc(db, 'users', user.uid);
      updateDoc(docRef, { lastActive: serverTimestamp() }).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogin = () => {
    login();
  };

  const navLinks = [
    { to: "/jobs", label: t('nav.marketplace'), show: true, icon: Search },
    { to: "/freelancers", label: t('nav.talent'), show: true, icon: Users },
    { to: "/groups", label: t('nav.groups'), show: true, icon: Users },
    { to: "/community", label: t('common.community'), show: true, icon: Globe },
    { to: "/client/dashboard", label: t('nav.clientHub'), show: profile?.role === 'client', icon: LayoutDashboard },
    { to: "/freelancer/dashboard", label: t('nav.dashboard'), show: profile?.role === 'freelancer', icon: LayoutDashboard },
    { to: "/admin", label: t('nav.admin'), show: profile?.role === 'admin' || user?.email === 'oladoyeheritage445@gmail.com', icon: Lock },
  ];

  const mobilePrimaryLink =
    profile?.role === 'client'
      ? { to: "/client/dashboard", icon: LayoutDashboard, label: t('nav.clientHub') }
      : profile?.role === 'freelancer'
        ? { to: "/freelancer/dashboard", icon: LayoutDashboard, label: t('nav.dashboard') }
        : { to: "/groups", icon: Users, label: t('nav.groups') };

  const mobileSocialLink = user
    ? { to: "/messages", icon: MessageSquare, label: t('nav.messages', { defaultValue: 'Messages' }) }
    : { to: "/community", icon: Globe, label: t('common.community') };

  const bottomLinks = [
    { to: "/", icon: BrandIcon, label: t('nav.home', { defaultValue: 'Home' }) },
    { to: "/jobs", icon: Search, label: t('nav.marketplace') },
    mobilePrimaryLink,
    mobileSocialLink,
    { 
      to: user ? "/profile" : "#", 
      onClick: user ? undefined : handleLogin, 
      icon: user ? UserIcon : LogOut, 
      label: user ? t('profile.title') : t('common.login') 
    }
  ];

  return (
    <>
      <nav className="border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500/20 flex items-center justify-center text-white dark:text-indigo-400 shadow-sm shadow-indigo-500/20 border border-indigo-600/20 dark:border-indigo-500/30 group-hover:scale-105 transition-transform">
                <BrandIcon className="h-4 w-4" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                <span>{t('common.brandName')}</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(link => link.show).map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className="relative px-3.5 py-2 group rounded-lg"
              >
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}>
                  {link.label}
                </span>
                {location.pathname === link.to && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            <EcosystemAppLauncher />
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-9 w-9 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 group-hover:border-indigo-400 transition-colors ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-indigo-950 shadow-sm"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="h-full w-full p-1.5 text-slate-600 dark:text-slate-300" />
                    )}
                  </motion.div>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout} 
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors hidden sm:block"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
                disabled={loading}
              >
                {t('common.login')}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Modern Floating Bottom Navigation */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex w-full max-w-md items-stretch justify-between gap-1 rounded-[2rem] border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 p-2 shadow-xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-2xl pointer-events-auto ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors duration-200"
        >
          {bottomLinks.map((link) => {
            const isActive = isNavActive(location.pathname, link.to);
            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2.5 text-center transition-all duration-300 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <link.icon className="h-5 w-5 transition-transform duration-300" />
                  <span className="max-w-full truncate text-[11px] font-semibold leading-none">
                    {link.label}
                  </span>
                </button>
              );
            }
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2.5 text-center transition-all duration-300",
                  isActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 -z-10 rounded-[1.35rem] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/40"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                <span className={cn("max-w-full truncate text-[11px] font-semibold leading-none", isActive && "text-indigo-600 dark:text-indigo-400")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </>
  );
};

// Pages
import ApplicantBoard from './pages/ApplicantBoard';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import FreelancerProposals from './pages/FreelancerProposals';
import FreelancerContracts from './pages/FreelancerContracts';
import SubmitProposal from './pages/SubmitProposal';
import ContractRoom from './pages/ContractRoom';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Groups from './pages/Groups';
import Freelancers from './pages/Freelancers';
import FreelancerProfile from './pages/FreelancerProfile';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
const About = React.lazy(() => import('./pages/About'));
const TrustSafety = React.lazy(() => import('./pages/TrustSafety'));
const Careers = React.lazy(() => import('./pages/Careers'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const Community = React.lazy(() => import('./pages/Community'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="w-full">
        <Routes location={location}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/freelancers" element={<PageTransition><Freelancers /></PageTransition>} />
          <Route path="/freelancer/:id" element={<PageTransition><FreelancerProfile /></PageTransition>} />
          <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
          <Route path="/jobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/client/dashboard" element={<PageTransition><ClientDashboard /></PageTransition>} />
          <Route path="/client/job/:id/applicants" element={<PageTransition><ApplicantBoard /></PageTransition>} />
          <Route path="/freelancer/dashboard" element={<PageTransition><FreelancerDashboard /></PageTransition>} />
          <Route path="/freelancer/proposals" element={<PageTransition><FreelancerProposals /></PageTransition>} />
          <Route path="/freelancer/contracts" element={<PageTransition><FreelancerContracts /></PageTransition>} />
          <Route path="/jobs/:id/apply" element={<PageTransition><SubmitProposal /></PageTransition>} />
          <Route path="/contract/:id" element={<PageTransition><ContractRoom /></PageTransition>} />
          <Route path="/wallet" element={<PageTransition><Wallet /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/groups" element={<PageTransition><Groups /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/profile/:uid" element={<PageTransition><PublicProfile /></PageTransition>} />
          <Route path="/post-job" element={<PageTransition><PostJob /></PageTransition>} />
          <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/trust-safety" element={<PageTransition><TrustSafety /></PageTransition>} />
          <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
          <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
          <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/login" element={<LoginRedirect />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const LoginRedirect = () => {
  useEffect(() => {
    initiateKontyraSSO('vyntajobs');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <BrandIcon className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Redirecting to Kontyra Identity SSO...</p>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | KontyraSSOUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { t } = useTranslation();

  // Listen to profile whenever user changes and resolve existing accounts by email
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let unsubProfile: (() => void) | undefined;
    let isCancelled = false;

    async function bindProfile() {
      if (!user) return;
      let targetUid = user.uid;

      // Extract effective email from user, Firebase token claims, or stored SSO session
      let effectiveEmail = user.email || '';
      if (!effectiveEmail && 'getIdTokenResult' in user) {
        try {
          const res = await (user as FirebaseUser).getIdTokenResult();
          effectiveEmail = (res.claims.email as string) || '';
        } catch {}
      }
      if (!effectiveEmail) {
        const stored = getStoredKontyraSession();
        if (stored?.email) effectiveEmail = stored.email;
      }

      // 1. Search for existing canonical user account by email to bind existing client/admin/freelancer roles
      if (effectiveEmail) {
        try {
          const normEmail = effectiveEmail.toLowerCase().trim();
          const emailQ = query(
            collection(db, 'users'),
            where('email', '==', normEmail)
          );
          const querySnap = await getDocs(emailQ);
          let candidateDocs = [...querySnap.docs];

          if (effectiveEmail.trim() !== normEmail) {
            const rawQ = query(
              collection(db, 'users'),
              where('email', '==', effectiveEmail.trim())
            );
            const rawSnap = await getDocs(rawQ);
            for (const d of rawSnap.docs) {
              if (!candidateDocs.some(existing => existing.id === d.id)) {
                candidateDocs.push(d);
              }
            }
          }

          if (candidateDocs.length > 0) {
            candidateDocs.sort((a, b) => {
              const aData = a.data() as UserProfile;
              const bData = b.data() as UserProfile;
              const score = (p: UserProfile, id: string) => {
                let s = 0;
                if (p.role === 'admin') s += 200;
                if (p.role === 'client') s += 100;
                if (p.completedJobs && p.completedJobs > 0) s += 20;
                if (p.skills && p.skills.length > 0) s += 15;
                if (p.hourlyRate) s += 10;
                if (!id.startsWith('kontyra_') && !id.startsWith('usr_')) s += 50;
                return s;
              };
              return score(bData, b.id) - score(aData, a.id);
            });

            const bestDoc = candidateDocs[0];
            targetUid = bestDoc.id;
            console.log(`Recognized existing account for email ${effectiveEmail} under canonical UID: ${targetUid}`);

            // If current session UID was a temporary SSO placeholder, update it to canonical UID
            if (user.uid !== targetUid) {
              const updatedSession = { ...user, uid: targetUid };
              setUser(updatedSession as any);
              try {
                localStorage.setItem(KONTYRA_STORAGE_KEY, JSON.stringify(updatedSession));
              } catch {}
            }
          }
        } catch (e) {
          console.warn("Could not query existing profile by email:", e);
        }
      }

      if (isCancelled) return;

      const targetDocRef = doc(db, 'users', targetUid);
      if (auth.currentUser) {
        updateDoc(targetDocRef, { lastActive: serverTimestamp() }).catch(() => {});
      }

      unsubProfile = onSnapshot(targetDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile listen error:", error);
        setLoading(false);
      });
    }

    bindProfile();

    return () => {
      isCancelled = true;
      if (unsubProfile) unsubProfile();
    };
  }, [user?.uid, user?.email]);

  // Handle SSO callback and Firebase auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 1. Check for incoming Kontyra SSO callback in URL
        const ssoUser = await handleKontyraSSOCallback();
        if (ssoUser && isMounted) {
          setUser(ssoUser);
          setLoading(false);
          return;
        }

        // 2. Check for stored Kontyra session
        const storedSso = getStoredKontyraSession();
        if (storedSso && isMounted) {
          if (!auth.currentUser) {
            setUser(storedSso);
            setLoading(false);
            ensureFirebaseAuth().catch(() => {});
          }
        }
      } catch (err) {
        console.warn("SSO Init Error:", err);
      }

      // 3. Listen to Firebase auth state
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;
        if (fbUser) {
          setUser(fbUser);
        } else {
          const currentSso = getStoredKontyraSession();
          if (currentSso) {
            setUser(currentSso);
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return unsubscribe;
    }

    let unsub: (() => void) | undefined;
    initAuth().then((u) => { unsub = u; });

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  const login = () => {
    setIsAuthModalOpen(true);
  };

  const loginWithGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const loginWithKontyra = () => {
    setIsAuthModalOpen(false);
    initiateKontyraSSO('vyntajobs');
  };

  const logout = async () => {
    clearStoredKontyraSession();
    setUser(null);
    setProfile(null);
    await auth.signOut();
  };

  const updateRole = async (role: UserRole) => {
    if (!user) return;
    const targetUid = profile?.uid || user.uid;
    const docRef = doc(db, 'users', targetUid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { role });
        setProfile(prev => prev ? { ...prev, role } : null);
      } else {
        const newProfile: UserProfile = {
          uid: targetUid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
          role,
          verificationStatus: 'none',
          rating: 5.0,
          completedJobs: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn("Could not update role in Firestore:", err);
      // Optimistic fallback so role toggle works seamlessly
      setProfile(prev => prev ? { ...prev, role } : null);
    }
  };

  const authValue = { 
    user, 
    profile, 
    loading, 
    login, 
    loginWithGoogleAuth, 
    loginWithKontyra, 
    logout, 
    updateRole 
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-4">
        <BrandIcon className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium font-sans">{t('common.launching')}</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">
          <Navbar />
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onGoogleLogin={loginWithGoogleAuth} 
            loading={loading} 
          />
          <main className="flex-grow pb-24 md:pb-0">
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <BrandIcon className="h-8 w-8 text-indigo-600 animate-spin opacity-20" />
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t('common.loading')}</p>
                </div>
              </div>
            }>
              <AnimatedRoutes />
            </React.Suspense>
          </main>
          <React.Suspense fallback={null}>
            <Footer />
          </React.Suspense>
          <TranslationPrompt />
          {/* Role Selection Modal for new users */}
          {user && !profile && !loading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('common.welcome')}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{t('role.selectTitle')}</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => updateRole('freelancer')}
                    className="flex items-center p-6 border-2 border-gray-100 dark:border-slate-700 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="p-3 bg-indigo-100 rounded-xl mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{t('role.freelancer')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('role.freelancerDesc')}</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => updateRole('client')}
                    className="flex items-center p-6 border-2 border-gray-100 dark:border-slate-700 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="p-3 bg-emerald-100 rounded-xl mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{t('role.client')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('role.clientDesc')}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
