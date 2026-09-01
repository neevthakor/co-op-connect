import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkerCard({ worker, href, className }: { worker: any; href?: string; className?: string }) {
  const name = worker.user?.name || worker.name || "Worker";
  const avatar = worker.user?.avatar || worker.avatar;
  const coopName = worker.cooperative?.name || worker.cooperative || "Ahmedabad Cooperative";
  const trade = worker.primaryTrade || "Technician";
  const rating = worker.averageRating || 4.8;
  const jobs = worker.totalJobs || 0;
  const isVerified = worker.verificationStatus === "VERIFIED" || worker.isVerified;
  const distance = worker.distance;
  const matchScore = worker.matchScore || worker.match_score;

  return (
    <Card className={cn("overflow-hidden flex flex-col bg-white border hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row gap-4 space-y-0 p-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="font-bold text-gray-700 bg-gray-100">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-gray-900">{name}</h3>
              {isVerified && (
                <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-50" />
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-gray-400" />
              {trade} • {coopName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2">
            <span className="flex items-center text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
              {rating.toFixed(1)}
            </span>
            <span className="text-gray-400">({jobs} jobs)</span>
            {distance !== undefined && (
              <span className="text-gray-500 flex items-center ml-auto">
                <MapPin className="h-3 w-3 mr-0.5" />
                {typeof distance === "number" ? `${distance.toFixed(1)} km` : distance}
              </span>
            )}
          </div>
        </div>
        {matchScore && (
          <div>
            <Badge className="bg-green-100 text-green-800 font-bold text-xs">
              {matchScore}% Match
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardFooter className="flex gap-2 p-3 bg-gray-50/70 border-t mt-auto">
        <Link href={href || `/customer/workers/${worker.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
            View Trust Passport
          </Button>
        </Link>
        <Link href={`/customer/book?workerId=${worker.id}`} className="flex-1">
          <Button size="sm" className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-white">
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
