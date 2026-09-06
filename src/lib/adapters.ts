import type { Campaign, CampaignUpdate, Category, Comment, FjbItem, Thread, User } from '../types';

export const userCache: Record<string, User> = {};
export const categoryCache: Record<string, Category> = {};

function badgesFor(role: string, karma: number): string[] {
  const badges: string[] = [];
  if (role === 'KSATRIA_KOMUNITAS') badges.push('Ksatria Komunitas');
  if (role === 'ADMIN') badges.push('Admin Qpeduli');
  if (karma >= 500) badges.push('Donatur Aktif');
  if (karma >= 1500) badges.push('Validator Terpercaya');
  return badges;
}

export function adaptUser(u: any): User {
  const user: User = {
    id: String(u.id),
    name: u.name,
    username: u.username,
    avatarColor: u.avatarColor || '#2563EB',
    avatarInitial: (u.name || '?').charAt(0).toUpperCase(),
    karma: u.karma ?? 0,
    isKsatria: u.role === 'KSATRIA_KOMUNITAS' || u.role === 'ADMIN',
    city: u.city || '',
    joinedAt: u.createdAt || new Date().toISOString(),
    bio: u.bio || undefined,
    badges: badgesFor(u.role, u.karma ?? 0),
  };
  userCache[user.id] = user;
  return user;
}

export function adaptCategory(c: any): Category {
  const category: Category = {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    icon: c.icon || 'Groups',
    threadCount: c.threadCount ?? 0,
    color: c.color || '#2563EB',
  };
  categoryCache[category.id] = category;
  return category;
}

function toNum(v: unknown): number {
  if (v == null) return 0;
  return typeof v === 'number' ? v : parseFloat(String(v));
}

export function adaptComment(c: any): Comment {
  if (c.author) adaptUser(c.author);
  return {
    id: String(c.id),
    authorId: String(c.authorId),
    date: c.createdAt,
    content: c.content,
    karmaGiven: c.karmaGiven || 0,
    isDonor: false,
  };
}

export function adaptUpdate(u: any): CampaignUpdate {
  if (u.author) adaptUser(u.author);
  return {
    id: String(u.id),
    authorId: String(u.authorId),
    date: u.createdAt,
    title: u.title,
    content: u.content,
  };
}

export function adaptCampaign(c: any): Campaign {
  if (c.guarantor) adaptUser(c.guarantor);
  return {
    id: String(c.id),
    target: toNum(c.target),
    collected: toNum(c.collected),
    donorCount: c.donorCount ?? 0,
    deadline: c.deadline,
    guarantorId: c.guarantorId ? String(c.guarantorId) : undefined,
    status: c.status === 'ACTIVE' ? 'active' : c.status === 'COMPLETED' ? 'completed' : 'pending-verification',
    disbursed: toNum(c.disbursed),
    milestones: (c.milestones || []).map((m: any) => ({
      id: String(m.id),
      label: m.label,
      amount: toNum(m.amount),
      released: m.released,
    })),
  };
}

export function adaptThread(t: any): Thread {
  if (t.author) adaptUser(t.author);
  if (t.category) adaptCategory(t.category);
  return {
    id: String(t.id),
    categoryId: String(t.categoryId),
    title: t.title,
    authorId: String(t.authorId),
    createdAt: t.createdAt,
    content: t.content,
    isAksiSosial: t.isAksiSosial,
    campaign: t.campaign ? adaptCampaign(t.campaign) : undefined,
    updates: (t.campaign?.updates || []).map(adaptUpdate),
    comments: (t.comments || []).map(adaptComment),
    views: t.views ?? 0,
    hot: (t.views ?? 0) > 5000,
  };
}

export interface DonationHistoryItem {
  threadTitle: string;
  threadId: string;
  amount: number;
  date: string;
}

export interface UserProfile {
  user: User;
  threads: Thread[];
  donations: DonationHistoryItem[];
}

export function adaptUserProfile(u: any): UserProfile {
  const user = adaptUser(u);
  const threads = (u.threads || []).map(adaptThread);
  const donations: DonationHistoryItem[] = (u.donations || []).map((d: any) => ({
    threadTitle: d.campaign?.thread?.title || 'Kampanye',
    threadId: String(d.campaign?.thread?.id || ''),
    amount: toNum(d.amount),
    date: d.confirmedAt || d.createdAt,
  }));
  return { user, threads, donations };
}

export function adaptFjbItem(f: any): FjbItem {
  if (f.seller) adaptUser(f.seller);
  const conditionMap: Record<string, FjbItem['condition']> = {
    BARU: 'Baru',
    SEPERTI_BARU: 'Seperti Baru',
    BEKAS_LAYAK_PAKAI: 'Bekas Layak Pakai',
  };
  return {
    id: String(f.id),
    title: f.title,
    price: toNum(f.price),
    sellerId: String(f.sellerId),
    condition: conditionMap[f.condition] || 'Bekas Layak Pakai',
    category: f.category,
    emoji: f.emoji || '🎁',
    campaignId: f.campaignId ? String(f.campaignId) : '',
    campaignTitle: f.campaign?.thread?.title,
    sold: f.sold,
    description: f.description || '',
  };
}
