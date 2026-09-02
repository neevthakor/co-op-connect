import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function generatePin(): string {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export function generateBookingId(): string {
  return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `INV-${seq}-${year}`;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REQUESTED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    TRAVELLING: 'bg-amber-100 text-amber-800',
    ARRIVED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    MORE_INFO_REQUIRED: 'bg-amber-100 text-amber-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    BUSY: 'bg-orange-100 text-orange-800',
    OFFLINE: 'bg-gray-100 text-gray-800',
    OPEN: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    DISMISSED: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-green-100 text-green-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    LOW: 'bg-yellow-100 text-yellow-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-red-200 text-red-900',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const BOOKING_STATUSES = [
  'REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
] as const;

export const VERIFICATION_STATUSES = [
  'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'MORE_INFO_REQUIRED'
] as const;

export const AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'OFFLINE'] as const;

export const ROLES = [
  'ADMIN', 'CUSTOMER', 'WORKER', 'HELPER', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN', 'SOCIETY_ADMIN', 'INSTITUTIONAL_CUSTOMER'
] as const;

export type BookingStatus = typeof BOOKING_STATUSES[number];
export type VerificationStatus = typeof VERIFICATION_STATUSES[number];
export type AvailabilityStatus = typeof AVAILABILITY_STATUSES[number];
export type UserRole = typeof ROLES[number];
