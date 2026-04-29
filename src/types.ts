export type UserRole = 'freelancer' | 'client' | 'admin';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  professionalTitle?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  hourlyRate?: number;
  timezone?: string;
  languages?: string[];
  portfolio?: PortfolioItem[];
  verificationStatus?: 'none' | 'pending' | 'verified';
  completedJobs?: number;
  rating?: number;
  createdAt: any;
}

export interface Job {
  id: string;
  clientId: string;
  assignedFreelancerId?: string;
  acceptedProposalId?: string;
  title: string;
  description: string;
  deadline?: string; // ISO string for proposal submission deadline
  duration?: string; // Expected work duration (e.g., "3 weeks")
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

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: any;
}
