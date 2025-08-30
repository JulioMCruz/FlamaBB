// user types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  reputation: number;
  verificationLevel: VerificationLevel;
  createdAt: Date;
  updatedAt: Date;
}

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  BASIC = 'basic',
  VERIFIED = 'verified',
  PREMIUM = 'premium'
}

// experience types
export interface Experience {
  id: string;
  title: string;
  description: string;
  hostId: string;
  venue: string;
  venueType: string;
  city: string;
  date: Date;
  minContribution: number;
  maxParticipants: number;
  currentParticipants: number;
  status: ExperienceStatus;
  includedItems: string[];
  checkinPercentage: number;
  midExperiencePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExperienceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  FULL = 'full',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// pool types
export interface Pool {
  id: string;
  experienceId: string;
  totalAmount: number;
  targetAmount: number;
  contributions: Contribution[];
  status: PoolStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contribution {
  id: string;
  poolId: string;
  userId: string;
  amount: number;
  transactionHash: string;
  status: ContributionStatus;
  createdAt: Date;
}

export enum PoolStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  DISBURSED = 'disbursed',
  REFUNDED = 'refunded'
}

export enum ContributionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// blockchain types
export interface WalletInfo {
  address: string;
  balance: number;
  network: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: Date;
}

// verification types
export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  data: any;
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export enum VerificationType {
  POAP = 'poap',
  ZK_PASSPORT = 'zk_passport',
  SOCIAL_PROOF = 'social_proof',
  REPUTATION = 'reputation'
}

// api response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// websocket event types
export interface SocketEvents {
  'join-experience': string;
  'check-in': CheckInData;
  'pool-update': PoolUpdateData;
  'user-checked-in': CheckInData;
  'pool-updated': PoolUpdateData;
}

export interface CheckInData {
  experienceId: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

export interface PoolUpdateData {
  experienceId: string;
  poolId: string;
  totalAmount: number;
  participantCount: number;
  timestamp: Date;
}
