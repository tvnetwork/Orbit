import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Star, 
  MapPin, 
  Clock, 
  Globe, 
  DollarSign, 
  Languages, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  X,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

interface FreelancerProfile {
  id: string;
  displayName: string;
  professionalTitle: string;
  photoURL: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  timezone: string;
  languages: string[];
  skills: string[];
  verificationStatus: string;
  bio: string;
}

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'Figma', 'AWS', 'Solidity', 'Kubernetes', 'TypeScript', 'Docker', 'GraphQL', 'Next.js', 'Tailwind CSS'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Mandarin', 'Russian', 'German', 'French', 'Japanese', 'Arabic'];
const TIMEZONE_OPTIONS = ['PST', 'EST', 'GMT', 'CET', 'IST', 'SGT', 'AEST', 'MSK'];
const CATEGORY_OPTIONS = ['Development', 'Design', 'AI & Data', 'Cybersecurity', 'Web3', 'Marketing'];

export default function Freelancers() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const [talents, setTalents] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTalents = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let q = query(
        collection(db, 'users'),
        where('role', '==', 'freelancer'),
        orderBy('createdAt', 'desc'),
        limit(12)
      );

      if (isLoadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const fetchedTalents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FreelancerProfile));

      if (isLoadMore) {
        setTalents(prev => [...prev, ...fetchedTalents]);
      } else {
        setTalents(fetchedTalents);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 12);
    } catch (error) {
      console.error('Error fetching talents:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setSelectedCategories([]);
    setSelectedTimezones([]);
    setMaxRate(500);
  };

  const filteredTalents = talents.filter(talent => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                         talent.displayName?.toLowerCase().includes(searchLower) ||
                         talent.professionalTitle?.toLowerCase().includes(searchLower) ||
                         talent.bio?.toLowerCase().includes(searchLower) ||
                         talent.skills?.some(s => s.toLowerCase().includes(searchLower));
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(s => talent.skills?.includes(s));
    
    const matchesLanguages = selectedLanguages.length === 0 || 
                            selectedLanguages.some(l => talent.languages?.includes(l));

    const matchesCategories = selectedCategories.length === 0 || 
                             !(talent as any).category || 
                             selectedCategories.includes((talent as any).category);
    
    const matchesTimezones = selectedTimezones.length === 0 || 
                            selectedTimezones.includes(talent.timezone);
    
    const matchesRate = (talent.hourlyRate || 0) <= maxRate;

    return matchesSearch && matchesSkills && matchesLanguages && matchesCategories && matchesTimezones && matchesRate;
  });

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('freelancers.title')}</h1>
              <p className="text-gray-500 font-medium font-sans">{t('freelancers.subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {(selectedSkills.length > 0 || selectedLanguages.length > 0 || selectedCategories.length > 0 || selectedTimezones.length > 0 || searchQuery || maxRate < 500) && (
                <button 
                  onClick={clearFilters}
                  className="text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest px-4 py-2 flex items-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  {t('freelancers.clearFilters')}
                </button>
              )}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100"
              >
                <Filter className="h-4 w-4" />
                {t('freelancers.filters')}
              </button>
            </div>
          </div>

          <div className="mt-10 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder={t('freelancers.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-16 pr-8 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className={cn(
            "lg:w-80 space-y-10 shrink-0",
            !showFilters && "hidden lg:block",
            showFilters && "fixed inset-0 z-50 bg-white p-8 overflow-y-auto lg:relative lg:p-0 lg:bg-transparent"
          )}>
            <div className="flex lg:hidden justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-xl">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> {t('freelancers.professionalArea')}
              </h3>
              <div className="space-y-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all border flex justify-between items-center",
                      selectedCategories.includes(cat)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-200"
                    )}
                  >
                    {cat}
                    {selectedCategories.includes(cat) && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> {t('freelancers.maxRate')}
                </h3>
                <span className="text-sm font-bold text-indigo-600">${maxRate}/hr</span>
              </div>
              <input 
                type="range"
                min="10"
                max="500"
                step="5"
                value={maxRate}
                onChange={(e) => setMaxRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>$10</span>
                <span>$500+</span>
              </div>
            </div>

            {/* Skill Stack */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="h-4 w-4" /> {t('freelancers.skillStack')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(selectedSkills, setSelectedSkills, skill)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedSkills.includes(skill)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                        : "bg-white text-gray-600 border-gray-100 hover:border-indigo-200"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4" /> {t('freelancers.timezone')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {TIMEZONE_OPTIONS.map(tz => (
                  <button 
                    key={tz} 
                    onClick={() => toggleFilter(selectedTimezones, setSelectedTimezones, tz)}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all flex justify-between items-center group",
                      selectedTimezones.includes(tz)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                        : "bg-white text-gray-600 border-gray-100 hover:border-indigo-200"
                    )}
                  >
                    {tz}
                    {selectedTimezones.includes(tz) ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-300 group-hover:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Languages className="h-4 w-4" /> {t('freelancers.languages')}
              </h3>
              <div className="space-y-3">
                {LANGUAGE_OPTIONS.map(lang => (
                  <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                      className={cn(
                        "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center",
                        selectedLanguages.includes(lang) ? "border-indigo-600 bg-indigo-600" : "border-gray-200 group-hover:border-indigo-300"
                      )}
                    >
                      {selectedLanguages.includes(lang) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowFilters(false)}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all"
            >
              {t('freelancers.applyFilters')}
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {filteredTalents.map((talent, i) => (
                  <motion.div
                    key={talent.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative",
                      viewMode === 'list' && "flex flex-col md:flex-row h-full"
                    )}
                  >
                    {/* Top Rated Badge */}
                    {talent.verificationStatus === 'verified' && (
                      <div className="absolute top-6 right-6 z-10">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-1.5">
                          <Award className="h-3 w-3" />
                          {t('freelancers.topRated')}
                        </div>
                      </div>
                    )}

                    {/* Photo Container */}
                    <div className={cn(
                      "relative",
                      viewMode === 'grid' ? "aspect-[4/3] w-full border-b" : "w-full md:w-80 h-full border-r"
                    )}>
                      <img 
                        src={talent.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.displayName)}&background=random`} 
                        alt={talent.displayName}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                      
                      <div className="absolute bottom-6 left-6 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                          <span className="text-xs font-black text-gray-900">{talent.rating || '5.0'}</span>
                          <span className="text-xs font-bold text-gray-600">({talent.completedJobs || 0})</span>
                        </div>
                        <div className="bg-indigo-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black">
                          ${talent.hourlyRate || 50}/hr
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{talent.displayName}</h3>
                            {talent.verificationStatus === 'verified' && <CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                          </div>
                          <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{talent.professionalTitle || 'Elite Freelancer'}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {talent.location || 'Remote'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {talent.timezone || 'Global'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Languages className="h-3.5 w-3.5" />
                            {talent.languages?.slice(0, 2).join(', ') || 'English'}
                          </div>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                          {talent.bio || 'Professional creator and innovator dedicated to excellence.'}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {talent.skills?.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-gray-50">
                        <Link 
                          to={`/freelancer/${talent.id}`}
                          className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-900 hover:text-white hover:shadow-xl hover:shadow-gray-900/10 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          {t('freelancers.viewProfile')}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTalents.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold">{t('freelancers.noResults')}</p>
                </div>
              )}
            </div>

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => fetchTalents(true)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 bg-white border border-gray-100 px-8 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all group disabled:opacity-50"
                >
                  <Zap className={cn("h-5 w-5 text-orange-400 transition-transform", loadingMore && "animate-pulse")} />
                  {loadingMore ? 'Loading...' : t('freelancers.loadMore')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
