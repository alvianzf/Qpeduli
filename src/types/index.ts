export interface User {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  avatarInitial: string;
  karma: number;
  isKsatria: boolean;
  city: string;
  joinedAt: string;
  bio?: string;
  badges: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  threadCount: number;
  color: string;
}

export interface CampaignUpdate {
  id: string;
  authorId: string;
  date: string;
  title: string;
  content: string;
  imageEmoji?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  date: string;
  content: string;
  karmaGiven?: number;
  isDonor?: boolean;
}

export interface Campaign {
  id: string;
  target: number;
  collected: number;
  donorCount: number;
  deadline: string;
  guarantorId?: string;
  status: 'active' | 'completed' | 'pending-verification';
  disbursed: number;
  milestones: { id: string; label: string; amount: number; released: boolean }[];
}

export interface Thread {
  id: string;
  categoryId: string;
  title: string;
  authorId: string;
  createdAt: string;
  content: string;
  isAksiSosial: boolean;
  campaign?: Campaign;
  updates: CampaignUpdate[];
  comments: Comment[];
  views: number;
  hot?: boolean;
}

export interface FjbItem {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  condition: 'Baru' | 'Seperti Baru' | 'Bekas Layak Pakai';
  category: string;
  emoji: string;
  campaignId: string;
  sold: boolean;
  description: string;
}
