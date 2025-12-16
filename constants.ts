import { SubscriptionStatus } from "./types";

export const URGENT_THRESHOLD_DAYS = 7;
export const WARNING_THRESHOLD_DAYS = 30;

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.EXPIRED]: "text-red-500 border-red-500 shadow-red-500/50 bg-red-950/30",
  [SubscriptionStatus.EXPIRING_SOON]: "text-orange-400 border-orange-400 shadow-orange-400/50 bg-orange-950/30",
  [SubscriptionStatus.UPCOMING]: "text-yellow-300 border-yellow-300 shadow-yellow-300/50 bg-yellow-900/30",
  [SubscriptionStatus.SAFE]: "text-emerald-400 border-emerald-400 shadow-emerald-400/50 bg-emerald-950/30",
};

// Map common Excel headers to our internal keys
export const HEADER_MAPPINGS = {
  name: ['nome', 'name', 'servizio', 'service', 'prodotto', 'abbonamento'],
  date: ['data', 'date', 'scadenza', 'expiration', 'rinnovo', 'next billing'],
  cost: ['costo', 'cost', 'prezzo', 'price', 'importo', 'amount']
};