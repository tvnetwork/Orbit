export type UserRole = 'freelancer' | 'client' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  createdAt: any;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  type: 'fixed' | 'hourly';
  category: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt?: any;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: any;
}

export interface Chat {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}
