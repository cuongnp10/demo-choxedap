import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  
  // Ensure the date string is treated as UTC if no timezone is provided
  // Backend returns ISO strings like 2026-04-03T10:00:00 without Z
  const utcDateString = (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.split('-').length > 3)) 
    ? dateString 
    : (dateString.includes('T') ? `${dateString}Z` : dateString);
    
  const date = new Date(utcDateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return "Đang cập nhật";
    
    let date: Date;
    if (typeof dateString === 'string') {
        const utcDateString = (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('-') && dateString.split('-').length > 3)) 
            ? dateString 
            : (dateString.includes('T') ? `${dateString}Z` : dateString);
        date = new Date(utcDateString);
    } else {
        date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return "Đang cập nhật";
    return date.toLocaleDateString("vi-VN");
}
