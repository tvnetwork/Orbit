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
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Chat, Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch Messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, `chats/${selectedChat.id}/messages`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `chats/${selectedChat.id}/messages`));
    return unsubscribe;
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim()) return;
    const text = newMessage;
    setNewMessage('');
    try {
      await addDoc(collection(db, `chats/${selectedChat.id}/messages`), {
        chatId: selectedChat.id,
        senderId: user.uid,
        text,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: text,
        lastSenderId: user.uid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${selectedChat.id}/messages`);
    }
  };

  return (
    <div className="bg-white h-[calc(100vh-64px)] flex overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-80 lg:w-96 border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {chats.map(chat => {
            const otherAuthorId = chat.participantIds.find(id => id !== user?.uid);
            return (
              <button 
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "w-full p-6 text-left flex gap-4 transition-all hover:bg-indigo-50/30",
                  selectedChat?.id === chat.id ? "bg-indigo-50" : ""
                )}
              >
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900 truncate">ID: {otherAuthorId?.slice(0, 8)}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">2m ago</p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
            )
          })}
          {chats.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm italic">
              No active conversations. Start one by contacting a freelancer or client!
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">User ID: {selectedChat.participantIds.find(id => id !== user?.uid)?.slice(0, 8)}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.uid;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={cn(
                      "flex flex-col",
                      isMine ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-md px-6 py-4 rounded-[1.5rem]",
                      isMine ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-100 text-gray-900 rounded-bl-none shadow-sm"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 mx-1">12:30 PM</p>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
              <form onSubmit={handleSendMessage} className="flex gap-4 max-w-5xl mx-auto">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message your collaborator..."
                    className="w-full bg-gray-50 border border-gray-100 px-8 py-5 rounded-[2rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2" />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-10 bg-indigo-600 text-white rounded-[2rem] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="h-5 w-5" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-24 w-24 bg-indigo-50 text-indigo-200 rounded-[2rem] flex items-center justify-center mb-8">
              <MessageSquare className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Inbox</h2>
            <p className="text-gray-500 max-w-sm mt-2">Select a conversation from the sidebar to view messages and collaborate with your teammates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const MessageSquare = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
