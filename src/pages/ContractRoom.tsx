import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MoreVertical,
  Paperclip,
  ArrowRight,
  Plus
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

export default function ContractRoom() {
  const { id: contractId } = useParams();
  const { user, profile } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contractId) return;

    // Fetch Contract Details
    const contractUnsub = onSnapshot(doc(db, 'contracts', contractId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const otherPartyId = data.clientId === user?.uid ? data.freelancerId : data.clientId;
        const otherPartySnap = await getDoc(doc(db, 'users', otherPartyId));
        setContract({ 
          id: snap.id, 
          ...data, 
          otherParty: otherPartySnap.exists() ? otherPartySnap.data() : null 
        });
      }
      setLoading(false);
    });

    // Fetch Messages
    const messagesQ = query(
      collection(db, 'contracts', contractId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const messagesUnsub = onSnapshot(messagesQ, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Milestones
    const milestonesUnsub = onSnapshot(collection(db, 'contracts', contractId, 'milestones'), (snap) => {
      setMilestones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      contractUnsub();
      messagesUnsub();
      milestonesUnsub();
    };
  }, [contractId, user]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !contractId) return;

    try {
      await addDoc(collection(db, 'contracts', contractId, 'messages'), {
        senderId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `contracts/${contractId}/messages`);
    }
  };

  const fundMilestone = async (milestoneId: string) => {
    if (profile?.role !== 'client') return;
    try {
      await updateDoc(doc(db, 'contracts', contractId!, 'milestones', milestoneId), {
        status: 'funded'
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <header className="z-10 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 lg:flex-nowrap lg:items-center lg:px-8 lg:py-5 flex-shrink-0">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-6">
          <Link to={profile?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-400" />
          </Link>
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="relative">
              <img 
                src={contract?.otherParty?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(contract?.otherParty?.displayName || 'User')}`} 
                className="h-12 w-12 rounded-2xl border-2 border-indigo-50" 
                alt=""
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black leading-tight tracking-tight text-gray-900 sm:text-xl">
                {contract?.otherParty?.displayName || 'Project Partner'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                <ShieldCheck className="h-3 w-3" />
                Vynta Secure Escrow Active
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:justify-end sm:gap-4 lg:w-auto lg:gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Contract Value</p>
            <p className="text-xl font-black text-gray-900 leading-none tracking-tight">${contract?.totalAmount}</p>
          </div>
          {profile?.role === 'freelancer' && !contract?.reviewRequested && (
            <button 
              onClick={async () => {
                 if (!contractId) return;
                 await updateDoc(doc(db, 'contracts', contractId), { reviewRequested: true });
                 await addDoc(collection(db, 'contracts', contractId, 'messages'), {
                   senderId: user!.uid,
                   text: "🔴 [SYSTEM] Freelancer has requested a review for this project.",
                   isSystem: true,
                   createdAt: serverTimestamp()
                 });
              }}
              className="rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-100 sm:px-4 sm:text-xs"
            >
              Request Review
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <MoreVertical className="h-6 w-6 text-gray-400" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  ref={menuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      if (contract?.jobId) window.location.href = `/jobs/${contract.jobId}`;
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-gray-400" /> View Job Original
                  </button>
                  <button 
                    onClick={() => {
                      const otherId = contract?.clientId === user?.uid ? contract?.freelancerId : contract?.clientId;
                      if (otherId) window.location.href = `/profile/${otherId}`;
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-gray-400" /> Partner Certificate
                  </button>
                  <div className="h-px bg-gray-50 my-1" />
                  <button 
                    onClick={() => {
                      // Logic for cancel
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4" /> Raise Dispute / Help
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-12 lg:overflow-hidden">
        {/* Left: Chat Side */}
        <div className="col-span-12 flex min-h-[60vh] flex-col overflow-hidden border-b border-gray-100 bg-white lg:col-span-7 lg:h-full lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-center">
            <AlertCircle className="h-4 w-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Always communicate within the secure workspace for contract protection.</span>
          </div>
          
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:space-y-8 lg:p-12">
            {messages.map((msg, i) => {
              const isMine = msg.senderId === user?.uid;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={cn(
                    "flex max-w-[88%] flex-col sm:max-w-[80%]",
                    isMine ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 text-sm font-medium leading-relaxed shadow-sm sm:p-5 lg:p-6",
                    isMine 
                      ? "bg-indigo-600 text-white rounded-[2.5rem] rounded-tr-none" 
                      : "bg-gray-50 text-gray-900 border border-gray-100 rounded-[2.5rem] rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2 px-2">
                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </motion.div>
              );
            })}
            <div className="h-10" />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 bg-white p-4 sm:p-6 lg:p-8">
            <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-[2rem] border border-gray-100 bg-gray-50 p-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-indigo-50 sm:gap-4 sm:rounded-[2.5rem]">
              <button type="button" className="p-4 text-gray-400 hover:text-indigo-600 transition-colors">
                <Paperclip className="h-6 w-6" />
              </button>
              <input 
                type="text"
                placeholder="Type a secure message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-gray-400 px-2"
              />
              <button 
                type="submit"
                className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Operational Side */}
        <div className="flex flex-col bg-gray-50/50 lg:col-span-5 lg:h-full lg:overflow-hidden">
          <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-6 lg:space-y-12 lg:p-12">
            
            {/* Escrow Status Card */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 blur-[60px] rounded-full -mr-16 -mt-16" />
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                   <Clock className="h-5 w-5 text-indigo-400" />
                   Project Pipeline
                 </h3>
                 <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Active Engagement</span>
               </div>
               
               <div className="space-y-6">
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Escrowed</p>
                     <p className="text-2xl font-black">${contract?.totalAmount}</p>
                   </div>
                   <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Paid to Date</p>
                     <p className="text-2xl font-black text-emerald-100">$0.00</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Milestones Area */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Milestones</h3>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Financial Roadmapping</p>
                 </div>
                 {profile?.role === 'client' && (
                   <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                     <Plus className="h-5 w-5 text-gray-400" />
                   </button>
                 )}
               </div>

               <div className="space-y-4">
                 {milestones.length > 0 ? milestones.map((m, i) => (
                   <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black",
                            m.status === 'released' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                          )}>
                            {m.status === 'released' ? <CheckCircle2 className="h-6 w-6" /> : i + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-gray-900 leading-tight">{m.title}</h4>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">${m.amount}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          m.status === 'funded' ? "bg-blue-50 text-blue-600" :
                          m.status === 'released' ? "bg-emerald-50 text-emerald-600" :
                          "bg-gray-50 text-gray-400"
                        )}>
                          {m.status}
                        </span>
                      </div>

                      {profile?.role === 'client' && m.status === 'pending' && (
                        <button 
                          onClick={() => fundMilestone(m.id)}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                          Fund This Milestone
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}

                      {profile?.role === 'freelancer' && m.status === 'funded' && (
                        <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                          Submit Work for Review
                        </button>
                      )}
                   </div>
                 )) : (
                   <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center">
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-loose">No roadmap defined for this contract.</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Quick Actions / Help */}
            <div className="bg-gray-100/50 p-8 rounded-[2.5rem] border border-gray-200/50 flex items-center gap-6">
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                 <FileText className="h-6 w-6 text-gray-400" />
               </div>
               <div>
                 <h4 className="font-black text-gray-900 tracking-tight leading-tight">Contract Management</h4>
                 <p className="text-xs text-gray-500 font-medium mt-1">Need help with milestones or disputes? Contact elite support.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
