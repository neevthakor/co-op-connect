import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Award, FileCheck, Star, Briefcase, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkerReview } from "@/types/review";

export function TrustPassport({
  worker,
  profileData,
  className,
}: {
  worker?: any;
  profileData?: any;
  className?: string;
}) {
  const w = profileData?.worker || worker;
  if (!w) return null;

  const name = w.user?.name || w.name || "Technician";
  const coopName = w.cooperative?.name || "Gujarat Cooperative Federation";
  const identityVerified = w.verificationStatus === "VERIFIED" || w.identityVerified === true;
  const skills = profileData?.skills || w.skills || [];
  const certifications = profileData?.certifications || w.certifications || [];
  const skillVerified = skills.length > 0 && skills.some((s: any) => s.verified);
  const certificationVerified = certifications.length > 0 && certifications.some((c: any) => c.verified);
  const cooperativeMember = !!w.cooperativeId || !!w.cooperative;
  const experience = w.experience || 0;
  const rating = profileData?.averageRating ?? (w.averageRating > 0 ? w.averageRating : null);
  const totalRatings = profileData?.totalRatingsCount ?? w.ratings?.length ?? 0;
  const jobs = profileData?.completedJobsCount ?? w.totalJobs ?? 0;
  const reviews: WorkerReview[] = profileData?.recentReviews || w.ratings || [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Verification Indicators */}
      <Card className="border-primary/20 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Co-opConnect Trust Passport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2
                className={cn("h-6 w-6 mb-1.5", identityVerified ? "text-green-600" : "text-gray-300")}
              />
              <span className="text-xs font-medium text-gray-700">Identity Verified</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2
                className={cn("h-6 w-6 mb-1.5", skillVerified ? "text-green-600" : "text-gray-300")}
              />
              <span className="text-xs font-medium text-gray-700">Skill Verified</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2
                className={cn(
                  "h-6 w-6 mb-1.5",
                  certificationVerified ? "text-green-600" : "text-gray-300"
                )}
              />
              <span className="text-xs font-medium text-gray-700">Certifications Checked</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2
                className={cn("h-6 w-6 mb-1.5", cooperativeMember ? "text-green-600" : "text-gray-300")}
              />
              <span className="text-xs font-medium text-gray-700">Co-op Member</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="h-4 w-4 text-gray-400" />
                {w.primaryTrade || "Technician"} • {coopName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900">
                  {rating !== null ? (
                    <>
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      {Number(rating).toFixed(1)}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground font-normal">No reviews yet</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">
                  {totalRatings > 0 ? `${totalRatings} review${totalRatings > 1 ? 's' : ''}` : "Rating"}
                </span>
              </div>
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <p className="text-sm font-bold text-gray-900">{jobs}</p>
                <span className="text-[10px] text-gray-500">Jobs Done</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <p className="text-sm font-bold text-gray-900">{experience > 0 ? `${experience} yrs` : 'New'}</p>
                <span className="text-[10px] text-gray-500">Experience</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Verified Skills & Proficiency ({skills.length})
            </h3>
            {skills.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg border">
                No verified trade skills registered yet.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {skills.map((s: any, idx: number) => {
                  const skillName = s.skill?.name || s.name || "Trade Skill";
                  const prof = s.proficiencyLevel || "INTERMEDIATE";
                  const isItemVerified = s.verified;
                  return (
                    <div
                      key={s.id || idx}
                      className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{skillName}</p>
                        <p className={cn("text-xs font-medium mt-0.5", isItemVerified ? "text-green-600" : "text-amber-600")}>
                          {isItemVerified ? "✓ Cooperative Verified" : "• Pending Verification"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold bg-white">
                        {prof}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Certifications & Training ({certifications.length})
            </h3>
            {certifications.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg border">
                No formal certifications uploaded.
              </p>
            ) : (
              <div className="space-y-2">
                {certifications.map((c: any, idx: number) => {
                  const certName = c.certification?.name || c.name || "Certification";
                  const issuer =
                    c.certification?.issuingAuthority || c.issuer || "Gujarat State Skill Mission";
                  const isCertVerified = c.verified;
                  return (
                    <div
                      key={c.id || idx}
                      className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{certName}</p>
                        <p className="text-xs text-gray-500">Issued by: {issuer}</p>
                      </div>
                      <Badge
                        className={
                          isCertVerified
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {isCertVerified ? "Verified" : "Pending Review"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Verified Customer Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg border">
                No customer reviews yet.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const customerName = r.customer?.name || (r.customer as any)?.user?.name || "Customer";
                  const ratingScore = typeof r.rating === 'number' ? r.rating : (r as any).overall || 5;
                  const commentText = r.comment || (r as any).review || null;
                  const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : '';

                  return (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-lg border space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{customerName}</span>
                          {r.serviceCategory && (
                            <span className="text-gray-500">({r.serviceCategory})</span>
                          )}
                        </div>
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {ratingScore.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-700">
                        {commentText ? commentText : <span className="italic text-gray-400">No written review</span>}
                      </p>
                      {dateStr && (
                        <p className="text-[10px] text-gray-400">{dateStr}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
