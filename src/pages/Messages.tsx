import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  getDocs,
  getDoc,
  serverTimestamp,
  doc,
  updateDoc,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Chat, Message, CommunityMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  User as UserIcon,
  MessageSquare as MessageSquareIcon,
  Users,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { cn, formatTime } from '../lib/utils';

import ReactMarkdown from 'react-markdown';

export default function Messages() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [resolvedProfiles, setResolvedProfiles] = useState<Record<string, any>>({});
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCommunity = selectedChatId === 'community';
  const selectedChat = isCommunity ? { id: 'community', participantIds: [] } : chats.find(c => c.id === selectedChatId);

  // Fetch Chats
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedChats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(fetchedChats);
      
      // Auto-select chat if targetUserId is provided
      if (targetUserId && !selectedChatId) {
        const existingChat = fetchedChats.find(c => c.participantIds.includes(targetUserId));
        if (existingChat) {
          setSelectedChatId(existingChat.id);
        } else {
          // Create new chat
          const startNewChat = async () => {
            setLoading(true);
            try {
              const newChatRef = await addDoc(collection(db, 'chats'), {
                participantIds: [user.uid, targetUserId],
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                lastMessage: '',
                lastSenderId: ''
              });
              setSelectedChatId(newChatRef.id);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, 'chats');
            } finally {
              setLoading(false);
            }
          };
          startNewChat();
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chats'));
    return unsubscribe;
  }, [user, targetUserId]);

  // Resolve profiles for chats
  useEffect(() => {
    const fetchMissingProfiles = async () => {
      const missingIds = new Set<string>();
      chats.forEach(chat => {
        chat.participantIds.forEach(id => {
          if (id !== user?.uid && !resolvedProfiles[id]) {
            missingIds.add(id);
          }
        });
      });

      if (missingIds.size > 0) {
        const profiles: Record<string, any> = { ...resolvedProfiles };
        await Promise.all(
          Array.from(missingIds).map(async (id) => {
            const docSnap = await getDoc(doc(db, 'users', id));
            if (docSnap.exists()) {
              profiles[id] = { id: docSnap.id, ...docSnap.data() };
            }
          })
        );
        setResolvedProfiles(profiles);
      }
    };

    fetchMissingProfiles();
  }, [chats, user?.uid]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Messages
  useEffect(() => {
    if (!selectedChatId) return;
    
    let q;
    if (isCommunity) {
      q = query(
        collection(db, 'community_messages'),
        orderBy('createdAt', 'asc'),
        limit(100)
      );
    } else {
      q = query(
        collection(db, `chats/${selectedChatId}/messages`),
        orderBy('createdAt', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, isCommunity ? 'community_messages' : `chats/${selectedChatId}/messages`));
    
    return unsubscribe;
  }, [selectedChatId, isCommunity]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChatId || !newMessage.trim()) return;
    const text = newMessage;
    setNewMessage('');

    try {
      if (isCommunity) {
        await addDoc(collection(db, 'community_messages'), {
          senderId: user.uid,
          senderName: profile?.displayName || 'Anonymous',
          senderPhoto: profile?.photoURL || user.photoURL || null,
          text,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, `chats/${selectedChatId}/messages`), {
          chatId: selectedChatId,
          senderId: user.uid,
          text,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'chats', selectedChatId), {
          lastMessage: text,
          lastSenderId: user.uid,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, isCommunity ? 'community_messages' : `chats/${selectedChatId}/messages`);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] bg-white md:h-[calc(100vh-64px)] md:overflow-hidden">
      
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col shrink-0 transition-all duration-300",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold mb-4">{t('messages.title')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('messages.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('messages.yourInbox')}</p>
          </div>

          <div className="divide-y divide-gray-50">
            {chats.map(chat => {
              const otherAuthorId = chat.participantIds.find(id => id !== user?.uid);
              const otherProfile = otherAuthorId ? resolvedProfiles[otherAuthorId] : null;
              
              return (
                <button 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full p-6 text-left flex gap-4 transition-all hover:bg-indigo-50/30",
                    selectedChatId === chat.id ? "bg-indigo-50" : ""
                  )}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {otherProfile?.photoURL ? (
                      <img src={otherProfile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 truncate">
                        {otherProfile?.displayName || `${t('messages.userId')}: ${otherAuthorId?.slice(0, 8)}`}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{chat.updatedAt ? formatTime(chat.updatedAt) : ''}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage || t('messages.noMessages')}</p>
                  </div>
                </button>
              )
            })}
            {chats.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm italic">
                {t('messages.noChats')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-50/30 transition-all duration-300",
        !selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="p-2 -ml-2 text-gray-400 hover:text-gray-900 md:hidden"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 overflow-hidden",
                  isCommunity ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {isCommunity ? (
                    <Globe className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    resolvedProfiles[selectedChat?.participantIds?.find(id => id !== user?.uid) || '']?.photoURL ? (
                      <img src={resolvedProfiles[selectedChat?.participantIds?.find(id => id !== user?.uid) || '']?.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 md:h-6 md:w-6" />
                    )
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm md:text-base">
                    {isCommunity ? t('messages.communityForum') : (resolvedProfiles[selectedChat?.participantIds?.find(id => id !== user?.uid) || '']?.displayName || `${t('messages.userId')}: ${selectedChat?.participantIds?.find(id => id !== user?.uid)?.slice(0, 8)}`)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2 w-2 rounded-full", isCommunity ? "bg-emerald-500" : "bg-emerald-500")} />
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", isCommunity ? "text-emerald-600" : "text-emerald-600")}>
                      {isCommunity ? t('messages.onlineMembers') : t('messages.online')}
                    </p>
                  </div>
                </div>
              </div>
            <div className="flex items-center gap-1 md:gap-2">
                {!isCommunity && (
                  <>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hidden sm:block">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hidden sm:block">
                      <Video className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(showMenu === 'chat' ? null : 'chat')}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  <AnimatePresence>
                    {showMenu === 'chat' && (
                      <motion.div 
                        ref={menuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        {!isCommunity && (
                          <button 
                            onClick={() => {
                              const otherId = selectedChat?.participantIds?.find(id => id !== user?.uid);
                              if (otherId) window.location.href = `/profile/${otherId}`;
                              setShowMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <UserIcon className="h-4 w-4" /> View Profile
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            // Implement clear chat logic if needed
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Search className="h-4 w-4" /> Search History
                        </button>
                        <div className="h-px bg-gray-50 my-1" />
                        <button 
                          onClick={() => {
                            // Implement report/block logic
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" /> Report Discussion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 space-y-5 overflow-y-auto p-4 md:space-y-8 md:p-8">
              {messages.map((msg: any, i) => {
                const isMine = msg.senderId === user?.uid;
                const showAvatar = isCommunity && !isMine;
                
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
                    {showAvatar && (
                      <div className="h-10 w-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 shadow-sm">
                        {msg.senderPhoto ? (
                          <img src={msg.senderPhoto} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="h-full w-full p-2 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div className={cn(
                      "flex flex-col",
                      isMine ? "items-end" : "items-start"
                    )}>
                      {!isMine && isCommunity && (
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                          {msg.senderName}
                        </p>
                      )}
                      <div className={cn(
                        "max-w-[85vw] px-4 py-3 rounded-[1.5rem] shadow-sm sm:max-w-md sm:px-6 sm:py-4 sm:rounded-[2rem]",
                        isMine 
                          ? "bg-indigo-600 text-white rounded-br-none" 
                          : "bg-white border border-gray-100 text-gray-900 rounded-bl-none"
                      )}>
                        <div className="markdown-container text-sm leading-relaxed">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 mx-2">
                        {msg.createdAt ? formatTime(msg.createdAt) : ''}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSendMessage} className="mx-auto flex max-w-5xl gap-3 sm:gap-4">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={isCommunity ? "Share something with the community..." : t('messages.messagePlaceholder')}
                    className="w-full rounded-[1.5rem] border border-gray-100 bg-gray-50 px-5 py-4 text-sm shadow-inner outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 sm:px-8 sm:py-5 sm:rounded-[2rem]"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-[1.5rem] px-5 font-bold transition-all shadow-xl disabled:opacity-50 disabled:shadow-none sm:gap-3 sm:rounded-[2rem] sm:px-10",
                    isCommunity ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                  )}
                >
                  <span className="hidden sm:inline">{t('messages.send')}</span>
                  <Send className="h-5 w-5" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-24 w-24 bg-indigo-50 text-indigo-200 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
              <MessageSquareIcon className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('messages.yourInbox')}</h2>
            <p className="text-gray-500 max-w-sm mt-4 leading-relaxed">{t('messages.selectConversation')}</p>
            
            <button 
              onClick={() => setSelectedChatId('community')}
              className="mt-8 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center gap-3"
            >
              <Globe className="h-5 w-5" />
              Join Community Discussion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
