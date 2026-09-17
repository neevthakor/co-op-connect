import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { TrustedWorkerButton } from "@/components/customer/trusted-worker-button";

export function WorkerCard({ 
  worker, 
  href, 
  className,
  showTrustedButton = false,
  initialIsTrusted = false,
}: { 
  worker: any; 
  href?: string; 
  className?: string;
  showTrustedButton?: boolean;
  initialIsTrusted?: boolean;
}) {
  const name = worker.user?.name || worker.name || "Worker";
  const avatar = worker.user?.avatar || worker.avatar;
  const coopName = worker.cooperative?.name || "Cooperative Member";
  const trade = worker.primaryTrade || "Technician";
  const rating = worker.averageRating > 0 ? worker.averageRating : null;
  const jobs = worker.totalJobs || 0;
  const isVerified = worker.verificationStatus === "VERIFIED" || worker.isVerified === true;
  const distance = worker.distance;
  const matchScore = worker.matchScore || worker.match_score;

  return (
    <Card className={cn("overflow-hidden flex flex-col bg-card border-border/80 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5", className)}>
      <CardHeader className="flex flex-row gap-4 space-y-0 p-4">
        <Avatar className="h-14 w-14 border border-border">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="font-bold text-foreground bg-secondary">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-base text-foreground">{name}</h3>
              {isVerified && (
                <div title={worker.verificationMethod === 'DIGILOCKER' ? 'DigiLocker Verified' : 'Admin Verified'} className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/20" />
                  {worker.verificationMethod === 'DIGILOCKER' && (
                    <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                      DigiLocker (MOCK)
                    </Badge>
                  )}
                  {worker.verificationMethod === 'ADMIN' && (
                    <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0 h-4 bg-gray-50 text-gray-700 border-gray-200">
                      Admin Verified
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-muted-foreground/70" />
              {trade} • {coopName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2">
            {rating !== null ? (
              <span className="flex items-center text-amber-400 font-bold">
                <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">New Worker</span>
            )}
            <span className="text-muted-foreground">({jobs} job{jobs === 1 ? '' : 's'})</span>
            {distance !== undefined && (
              <span className="text-muted-foreground flex items-center ml-auto">
                <MapPin className="h-3 w-3 mr-0.5" />
                {typeof distance === "number" ? `${distance.toFixed(1)} km` : distance}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {matchScore && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
              {matchScore}% Match
            </Badge>
          )}
          {showTrustedButton && (
            <TrustedWorkerButton 
              workerId={worker.id} 
              initialIsTrusted={initialIsTrusted} 
              size="icon" 
              showText={false}
              variant="ghost"
              className="h-8 w-8 rounded-full border"
            />
          )}
        </div>
      </CardHeader>
      
      <CardFooter className="flex gap-2 p-3 bg-secondary/40 border-t border-border mt-auto">
        <Link href={href || `/customer/workers/${worker.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-border hover:bg-secondary">
            View Trust Passport
          </Button>
        </Link>
        <Link href={`/customer/book?workerId=${worker.id}`} className="flex-1">
          <Button size="sm" className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm">
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
