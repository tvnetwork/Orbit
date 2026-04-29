import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Job } from '../types';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatDate } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export default function Jobs() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'hourly'>('all');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const q = query(
          collection(db, 'jobs'), 
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'jobs');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  } as const;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{t('jobs.marketplaceTitle')}</h1>
            <p className="text-gray-500 text-base md:text-lg">{t('jobs.marketplaceSubtitle')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative flex-1 sm:w-80 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder={t('jobs.searchPlaceholder')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
              />
            </div>
            <div className="flex bg-white p-1 md:p-1.5 rounded-2xl border border-gray-100 shadow-sm relative w-full sm:w-auto overflow-x-auto">
              {(['all', 'fixed', 'hourly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "relative px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold capitalize transition-all z-10 flex-1 whitespace-nowrap",
                    filterType === type ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {t(`jobs.filter${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                  {filterType === type && (
                    <motion.div 
                      layoutId="filter-bg"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 bg-white rounded-[2.5rem] border border-gray-50 animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredJobs.map((job) => (
              <motion.div 
                key={job.id}
                variants={itemVariants}
                layout
                whileHover={{ y: -8 }}
                className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">{job.category || 'Technical'}</span>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest",
                        job.type === 'fixed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {job.type === 'fixed' ? t('jobs.milestoneBased') : t('jobs.hourlyEngagement')}
                      </span>
                    </div>
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
                    </Link>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 45, scale: 1.1 }}
                  >
                    <Link 
                      to={`/jobs/${job.id}`}
                      className="inline-flex p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <ArrowUpRight className="h-6 w-6" />
                    </Link>
                  </motion.div>
                </div>

                <p className="text-gray-500 line-clamp-2 mb-10 text-lg leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('jobs.budget')}</p>
                        <p className="font-bold text-gray-900">${job.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('jobs.posted')}</p>
                        <p className="font-bold text-gray-900">{formatDate(job.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to={`/jobs/${job.id}`} 
                    className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-indigo-600 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50"
                  >
                    {t('jobs.viewProject')} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('jobs.noProjectsFound')}</h3>
            <p className="text-gray-500 mt-2">{t('jobs.noProjectsSubtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
