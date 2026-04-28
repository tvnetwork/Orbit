import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from './components/PageTransition';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LayoutDashboard,
  LogOut,
  Orbit
} from 'lucide-react';

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

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const navLinks = [
    { to: "/jobs", label: "Browse Jobs", show: true },
    { to: "/post-job", label: "Post a Job", show: profile?.role === 'client' },
    { to: "/dashboard", label: "Dashboard", show: !!user },
    { to: "/messages", label: "Messages", show: !!user },
    { to: "/admin", label: "Admin", show: profile?.role === 'admin' || user?.email === 'oladoyeheritage445@gmail.com' },
  ];

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="p-2 bg-indigo-600 rounded-xl"
            >
              <Orbit className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Orbit</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(link => link.show).map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className="relative px-4 py-2 group"
              >
                <span className={`text-sm font-medium transition-colors duration-200 ${
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-indigo-300 transition-colors ring-2 ring-transparent group-hover:ring-indigo-50"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-full w-full p-1.5 text-gray-400" />
                    )}
                  </motion.div>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout} 
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Pages (Stubs for now)
const Home = React.lazy(() => import('./pages/Home'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
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
          <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
          <Route path="/jobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
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
        <Orbit className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium font-sans">Launching Orbit...</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Navbar />
          <main className="flex-grow">
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <Orbit className="h-8 w-8 text-indigo-600 animate-spin opacity-20" />
                  <p className="text-sm font-medium text-gray-400">Loading Orbit...</p>
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
                  <h2 className="text-3xl font-bold text-gray-900">Welcome to Orbit</h2>
                  <p className="text-gray-500">How would you like to use the platform?</p>
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
                      <p className="font-bold text-gray-900">I'm a Freelancer</p>
                      <p className="text-sm text-gray-500">I want to find work and grow my business.</p>
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
                      <p className="font-bold text-gray-900">I'm a Client</p>
                      <p className="text-sm text-gray-500">I want to hire talent and build amazing things.</p>
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
