export enum SubscriptionStatus {
  EXPIRED = 'SCADUTO',
  EXPIRING_SOON = 'IN SCADENZA', // Within 7 days
  UPCOMING = 'STA PER SCADERE', // Within 30 days
  SAFE = 'ATTIVO', // > 30 days
}

export interface SubscriptionRaw {
  [key: string]: any;
}

export interface Subscription {
  id: string;
  username: string;
  password?: string;
  reference?: string; // Col G (Gigio TV)
  date: Date; // Expiration Date
  cost: number; // Keep cost strictly for potential calculations, though user didn't specify a column, default to 0 if not found
  currency: string;
  status: SubscriptionStatus;
  daysRemaining: number;
}

export interface DashboardStats {
  totalActive: number;
  expiredCount: number;
  urgentCount: number;
  warningCount: number;
}