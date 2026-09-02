/**
 * Canonical Review & Rating Types for Co-opConnect
 * 
 * Ensures consistent numeric rating representation, serialized date formatting,
 * and reliable database-driven customer attribution across all portals.
 */

export interface WorkerReview {
  id: string;
  rating: number; // Numeric 1.0 - 5.0
  comment: string | null;
  createdAt: string; // ISO 8601 serialized string
  technicalQuality: number;
  punctuality: number;
  communication: number;
  professionalism: number;
  priceTransparency: number;
  customer: {
    name: string;
    avatar?: string | null;
  };
  serviceCategory?: string | null;
}

export interface WorkerReviewSummary {
  averageRating: number | null;
  totalRatingsCount: number;
  punctualityScore: number | null;
  reviews: WorkerReview[];
}
