"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Technical Quality",
  "Punctuality",
  "Communication",
  "Professionalism",
  "Price Transparency"
];

interface RatingInputProps {
  bookingId?: string;
  categories?: string[];
  onSubmit?: (data: { ratings: Record<string, number>, review: string }) => void;
  className?: string;
}

export function RatingInput({ bookingId, categories = DEFAULT_CATEGORIES, onSubmit, className }: RatingInputProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: 5 }), {})
  );
  const [hoveredRating, setHoveredRating] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (category: string, score: number) => {
    setRatings(prev => ({ ...prev, [category]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (onSubmit) {
      onSubmit({ ratings, review });
    } else if (bookingId) {
      try {
        await fetch(`/api/bookings/${bookingId}/rating`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technicalQuality: ratings["Technical Quality"] || 5,
            punctuality: ratings["Punctuality"] || 5,
            communication: ratings["Communication"] || 5,
            professionalism: ratings["Professionalism"] || 5,
            priceTransparency: ratings["Price Transparency"] || 5,
            review,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-center">
        <p className="text-sm font-bold text-green-800">Thank you for rating your service!</p>
        <p className="text-xs text-green-600 mt-1">Your feedback supports fair cooperative worker evaluations.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4 bg-white p-5 rounded-xl border shadow-xs", className)}>
      <h4 className="font-bold text-base text-gray-900">Rate Service Quality</h4>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">{category}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredRating[category] || ratings[category]);
                return (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [category]: star }))}
                    onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [category]: 0 }))}
                    onClick={() => handleRate(category, star)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-amber-500 fill-amber-500" : "text-gray-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-medium text-gray-700">Write a Review (Optional)</label>
        <Textarea
          placeholder="How was your experience with the cooperative worker?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="text-xs h-20"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white text-xs font-semibold">
        {isSubmitting ? "Submitting..." : "Submit Rating & Review"}
      </Button>
    </form>
  );
}
