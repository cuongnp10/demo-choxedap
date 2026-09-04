import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return '—';
    
    let date: Date;
    if (typeof dateString === 'string') {
        const utcDateString = (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.split('-').length > 3)) 
            ? dateString 
            : (dateString.includes('T') ? `${dateString}Z` : dateString);
        date = new Date(utcDateString);
    } else {
        date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('vi-VN');
}

export function formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '—';
    
    let date: Date;
    if (typeof dateString === 'string') {
        const utcDateString = (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.split('-').length > 3)) 
            ? dateString 
            : (dateString.includes('T') ? `${dateString}Z` : dateString);
        date = new Date(utcDateString);
    } else {
        date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN');
}
