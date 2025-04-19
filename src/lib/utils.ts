import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const confidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-success-500';
  if (confidence >= 60) return 'text-primary-500';
  if (confidence >= 40) return 'text-warning-500';
  return 'text-error-500';
};

export const formatDateFromNow = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
};

export const truncate = (str: string, n: number) => {
  return str.length > n ? str.substr(0, n-1) + '...' : str;
};

export const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success-900/20 text-success-500 border-success-700/30';
    case 'active':
      return 'bg-primary-900/20 text-primary-500 border-primary-700/30';
    case 'pending':
      return 'bg-warning-900/20 text-warning-500 border-warning-700/30';
    case 'failed':
      return 'bg-error-900/20 text-error-500 border-error-700/30';
    default:
      return 'bg-gray-900/20 text-gray-500 border-gray-700/30';
  }
};