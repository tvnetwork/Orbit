import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from './components/PageTransition';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
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

// Context
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
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

const Navbar = () => {
  const { user, profile, loading, login, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const navLinks = [
    { to: "/jobs", label: t('nav.marketplace'), show: true, icon: Search },
    { to: "/freelancers", label: t('nav.talent'), show: true, icon: Users },
    { to: "/groups", label: "Groups", show: true, icon: Users },
    { to: "/community", label: t('common.community'), show: true, icon: Globe },
    { to: "/client/dashboard", label: "Client Hub", show: profile?.role === 'client', icon: LayoutDashboard },
    { to: "/freelancer/dashboard", label: "Dashboard", show: profile?.role === 'freelancer', icon: LayoutDashboard },
    { to: "/admin", label: t('nav.admin'), show: profile?.role === 'admin' || user?.email === 'oladoyeheritage445@gmail.com', icon: Lock },
  ];

  const bottomLinks = [
    { to: "/", icon: BrandIcon, label: 'Home' },
    { to: "/jobs", icon: Search, label: 'Jobs' },
    ...(profile?.role === 'client' ? [{ to: "/client/dashboard", icon: LayoutDashboard, label: 'Hub' }] : []),
    ...(profile?.role === 'freelancer' ? [{ to: "/freelancer/dashboard", icon: LayoutDashboard, label: 'Dash' }] : []),
    { to: "/messages", icon: MessageSquare, label: 'Inbox' },
    { to: "/wallet", icon: DollarSign, label: 'Wallet' },
    { to: user ? "/profile" : "/login", icon: user ? UserIcon : LogOut, label: user ? 'Profile' : 'Login' }
  ];

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="p-1.5 md:p-2 bg-indigo-600 rounded-lg md:rounded-xl shadow-lg shadow-indigo-100"
              >
                <BrandIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-gray-900">{t('common.brandName')}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(link => link.show).map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className="relative px-4 py-2 group"
              >
                <span className={`text-sm font-bold transition-colors duration-200 ${
                  location.pathname === link.to ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-900'
                }`}>
                  {link.label}
                </span>
                {location.pathname === link.to && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-9 w-9 rounded-full bg-gray-400 overflow-hidden border border-gray-200 group-hover:border-indigo-300 transition-colors ring-2 ring-transparent group-hover:ring-indigo-50 shadow-sm"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="h-full w-full p-1.5 text-white" />
                    )}
                  </motion.div>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout} 
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors hidden sm:block"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50"
                disabled={loading}
              >
                {t('common.login')}
              </motion.button>
            )}
          </div>
        </div>
      </div>




      {/* Modern Floating Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around p-2 pointer-events-auto ring-1 ring-black/5"
        >
          {bottomLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                  isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon className={cn("h-6 w-6 transition-transform duration-300", isActive && "scale-110")} />
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600"
                  />
                )}
              </Link>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
};

// Pages (Stubs for now)
const ApplicantBoard = React.lazy(() => import('./pages/ApplicantBoard'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const FreelancerDashboard = React.lazy(() => import('./pages/FreelancerDashboard'));
const FreelancerProposals = React.lazy(() => import('./pages/FreelancerProposals'));
const SubmitProposal = React.lazy(() => import('./pages/SubmitProposal'));
const ContractRoom = React.lazy(() => import('./pages/ContractRoom'));
const Wallet = React.lazy(() => import('./pages/Wallet'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Groups = React.lazy(() => import('./pages/Groups'));
const Freelancers = React.lazy(() => import('./pages/Freelancers'));
const FreelancerProfile = React.lazy(() => import('./pages/FreelancerProfile'));
const Home = React.lazy(() => import('./pages/Home'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'));
const PostJob = React.lazy(() => import('./pages/PostJob'));
const JobDetails = React.lazy(() => import('./pages/JobDetails'));
const Messages = React.lazy(() => import('./pages/Messages'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
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
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user, but wait for them to pick a role
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await auth.signOut();
  };

  const updateRole = async (role: UserRole) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, { role });
      setProfile(prev => prev ? { ...prev, role } : null);
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
        role,
        verificationStatus: 'none',
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
  };

  const authValue = { user, profile, loading, login, logout, updateRole };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <BrandIcon className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium font-sans">{t('common.launching')}</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Navbar />
          <main className="flex-grow pb-24 md:pb-0">
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <BrandIcon className="h-8 w-8 text-indigo-600 animate-spin opacity-20" />
                  <p className="text-sm font-medium text-gray-400">{t('common.loading')}</p>
                </div>
              </div>
            }>
              <AnimatedRoutes />
            </React.Suspense>
          </main>
          <React.Suspense fallback={null}>
            <Footer />
          </React.Suspense>
          {/* Role Selection Modal for new users */}
          {user && !profile && !loading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">{t('common.welcome')}</h2>
                  <p className="text-gray-500">{t('role.selectTitle')}</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => updateRole('freelancer')}
                    className="flex items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="p-3 bg-indigo-100 rounded-xl mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t('role.freelancer')}</p>
                      <p className="text-sm text-gray-500">{t('role.freelancerDesc')}</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => updateRole('client')}
                    className="flex items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="p-3 bg-emerald-100 rounded-xl mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t('role.client')}</p>
                      <p className="text-sm text-gray-500">{t('role.clientDesc')}</p>
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
