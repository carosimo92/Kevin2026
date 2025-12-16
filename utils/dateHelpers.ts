import { SubscriptionStatus } from "../types";
import { URGENT_THRESHOLD_DAYS, WARNING_THRESHOLD_DAYS } from "../constants";

export const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  // 1. Handle Excel serial date (numbers)
  if (typeof value === 'number') {
    // Excel base date is 1899-12-30. 
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  
  if (typeof value === 'string') {
    const cleanVal = value.trim();

    // 2. Handle ISO Format (YYYY-MM-DD) explicitly first to avoid bad matches with EU regex
    // Matches 2024-05-10 or 2024/05/10
    const isoMatch = cleanVal.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }

    // 3. Handle Italian/European string formats (DD/MM/YYYY)
    // Supports separators: / - . , and spaces
    const euMatch = cleanVal.match(/^(\d{1,2})\s*[\/\-\.,]\s*(\d{1,2})\s*[\/\-\.,]\s*(\d{2,4})/);
    
    if (euMatch) {
      const day = parseInt(euMatch[1], 10);
      const month = parseInt(euMatch[2], 10) - 1; // Month is 0-indexed
      let year = parseInt(euMatch[3], 10);
      
      // Handle 2 digit year (e.g. 24 -> 2024)
      if (year < 100) {
        year += 2000;
      }
      
      // Basic validation to ensure we didn't match garbage
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
         const date = new Date(year, month, day);
         if (!isNaN(date.getTime())) {
           return date;
         }
      }
    }
  }

  // 4. Fallback to standard JS Date parsing
  // Warning: This often defaults to MM/DD/YYYY in many environments for ambiguous strings
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
};

export const getDaysRemaining = (targetDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const determineStatus = (date: Date): SubscriptionStatus => {
  const days = getDaysRemaining(date);

  if (days < 0) return SubscriptionStatus.EXPIRED;
  if (days <= URGENT_THRESHOLD_DAYS) return SubscriptionStatus.EXPIRING_SOON;
  if (days <= WARNING_THRESHOLD_DAYS) return SubscriptionStatus.UPCOMING;
  return SubscriptionStatus.SAFE;
};

export const formatCurrency = (amount: number, currency: string = '€') => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};