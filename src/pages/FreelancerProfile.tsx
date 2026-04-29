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
  ArrowLeft
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>;

  if (!profile) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-500 font-bold">Profile not found.</p>
  </div>;

  const stats = [
    { label: 'Success Rate', value: '100%', icon: Zap, color: 'text-orange-500' },
    { label: 'Jobs Completed', value: profile.completedJobs || 0, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Rating', value: `${profile.rating || '5.0'}/5`, icon: Star, color: 'text-indigo-500' },
    { label: 'Verified', value: profile.verificationStatus === 'verified' ? 'Yes' : 'No', icon: ShieldCheck, color: 'text-emerald-500' }
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
                <button className="bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                  Hire Now
                </button>
                <button className="bg-gray-50 text-gray-900 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
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
                
                <div className="flex items-center gap-4 py-2">
                  <a href={profile.githubUrl || '#'} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Github className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href="#" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Globe className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href={`mailto:${profile.email}`} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Mail className="h-5 w-5 text-gray-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Performance Snapshot</h3>
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
                About Professional
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
                Crafting digital excellence <span className="text-gray-400">through technical precision.</span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed font-sans">
                {profile.bio || 'Professional creator information is being updated. This expert is dedicated to delivering high-quality solutions across various complex technical domains.'}
              </p>

              <div className="mt-12 pt-12 border-t border-gray-50">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Verified Expertise</h4>
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
                  Verified Portfolio
                </div>
                <div className="text-xs font-bold text-gray-400">Showing {profile.portfolio?.length || 0} Projects</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.portfolio?.map((project: any, i: number) => (
                  <motion.div 
                    key={project.id || i}
                    whileHover={{ y: -8 }}
                    className="group space-y-4 cursor-pointer"
                  >
                    <div className="aspect-[16/10] bg-gray-100 rounded-[2rem] overflow-hidden relative border border-gray-50 shadow-sm">
                      <img 
                        src={project.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'} 
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        alt={project.title}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                          <ExternalLink className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2 space-y-1">
                      <h4 className="text-xl font-black text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-500 font-sans">{project.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {(!profile.portfolio || profile.portfolio.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                  <p className="text-gray-400 font-bold">This expert has not showcased portfolio items yet.</p>
                </div>
              )}
            </section>

            {/* Testimonials */}
            <section className="bg-white rounded-[3rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em] mb-12">
                <Award className="h-4 w-4" />
                Client Feedback
              </div>
              
              <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative">
                <div className="absolute -top-6 left-12 h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-serif">“</div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className="h-4 w-4 text-orange-400 fill-orange-400" />)}
                  </div>
                  <p className="text-xl text-gray-700 font-medium italic leading-relaxed">
                    "Exceptional attention to detail and technical prowess. Delivered the project ahead of schedule with zero compromising on quality. A true elite professional."
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="h-12 w-12 rounded-full bg-indigo-200" />
                    <div>
                      <p className="font-bold text-gray-900">David Miller</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-black">CTO, Nexus Corp</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
