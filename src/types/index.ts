export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  displayName: string;
}

export interface UserStats {
  total: number;
  active: number;
  dormant: number;
  banned: number;
}

export interface VideoStats {
  total: number;
  pending: number;
  approved: number;
}

export interface WalletStats {
  totalCoins: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}
