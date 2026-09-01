import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingCategory {
  name: string;
  score: number;
}

interface RatingDisplayProps {
  rating?: {
    average: number;
    count?: number;
    categories?: RatingCategory[];
  } | number;
  showCategories?: boolean;
  className?: string;
}

export function RatingDisplay({ rating, showCategories = true, className }: RatingDisplayProps) {
  if (rating === undefined) return null;

  const average = typeof rating === 'number' ? rating : rating.average;
  const count = typeof rating === 'object' ? rating.count : undefined;
  const categories = typeof rating === 'object' ? rating.categories : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-5 w-5",
                star <= Math.round(average)
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <span className="font-bold">{average.toFixed(1)}</span>
        {count !== undefined && (
          <span className="text-sm text-muted-foreground">({count} reviews)</span>
        )}
      </div>

      {showCategories && categories && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <span className="text-muted-foreground">{cat.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${(cat.score / 5) * 100}%` }}
                  />
                </div>
                <span className="font-medium w-6 text-right">{cat.score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
