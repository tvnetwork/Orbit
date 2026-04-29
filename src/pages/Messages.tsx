import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chats'));
    return unsubscribe;
  }, [user]);

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
    <div className="bg-white h-[calc(100vh-64px)] flex overflow-hidden relative">
      
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
              return (
                <button 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full p-6 text-left flex gap-4 transition-all hover:bg-indigo-50/30",
                    selectedChatId === chat.id ? "bg-indigo-50" : ""
                  )}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 truncate">{t('messages.userId')}: {otherAuthorId?.slice(0, 8)}</p>
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
            <div className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="p-2 -ml-2 text-gray-400 hover:text-gray-900 md:hidden"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200",
                  isCommunity ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {isCommunity ? <Globe className="h-5 w-5 md:h-6 md:w-6" /> : <UserIcon className="h-5 w-5 md:h-6 md:w-6" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm md:text-base">
                    {isCommunity ? t('messages.communityForum') : `${t('messages.userId')}: ${selectedChat?.participantIds?.find(id => id !== user?.uid)?.slice(0, 8)}`}
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
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
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
                        "max-w-md px-6 py-4 rounded-[2rem] shadow-sm",
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
            <div className="p-8 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-4 max-w-5xl mx-auto">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={isCommunity ? "Share something with the community..." : t('messages.messagePlaceholder')}
                    className="w-full bg-gray-50 border border-gray-100 px-8 py-5 rounded-[2rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "px-10 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:shadow-none",
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

