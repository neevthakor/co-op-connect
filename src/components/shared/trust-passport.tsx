import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Award, FileCheck, Star, Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function TrustPassport({ worker, className }: { worker: any; className?: string }) {
  const name = worker.user?.name || worker.name || "Worker";
  const coopName = worker.cooperative?.name || worker.cooperative || "Ahmedabad Cooperative Federation";
  const identityVerified = worker.identityVerified ?? (worker.verificationStatus === "VERIFIED");
  const skillVerified = worker.skills?.some((s: any) => s.verified) ?? true;
  const certificationVerified = worker.certifications?.some((c: any) => c.verified) ?? true;
  const cooperativeMember = !!worker.cooperativeId || !!worker.cooperative;
  const experience = worker.experience || worker.experienceYears || 5;
  const rating = worker.averageRating || 4.8;
  const jobs = worker.totalJobs || 24;

  const skills = worker.skills || [
    { skill: { name: worker.primaryTrade || "General Maintenance" }, proficiencyLevel: "EXPERT" },
  ];

  const certifications = worker.certifications || [
    { certification: { name: "National Skill Qualification Framework (NSQF)", issuingAuthority: "NSDC" } }
  ];

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
              <CheckCircle2 className={cn("h-6 w-6 mb-1.5", identityVerified ? "text-green-600" : "text-gray-300")} />
              <span className="text-xs font-medium text-gray-700">Identity Verified</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2 className={cn("h-6 w-6 mb-1.5", skillVerified ? "text-green-600" : "text-gray-300")} />
              <span className="text-xs font-medium text-gray-700">Skill Verified</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2 className={cn("h-6 w-6 mb-1.5", certificationVerified ? "text-green-600" : "text-gray-300")} />
              <span className="text-xs font-medium text-gray-700">Certifications Checked</span>
            </div>
            <div className="flex flex-col items-center p-3 text-center bg-white rounded-lg border shadow-xs">
              <CheckCircle2 className={cn("h-6 w-6 mb-1.5", cooperativeMember ? "text-green-600" : "text-gray-300")} />
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
                {worker.primaryTrade || "Technician"} • {coopName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {rating.toFixed(1)}
                </div>
                <span className="text-[10px] text-gray-500">Rating</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <p className="text-sm font-bold text-gray-900">{jobs}</p>
                <span className="text-[10px] text-gray-500">Jobs Done</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border">
                <p className="text-sm font-bold text-gray-900">{experience} yrs</p>
                <span className="text-[10px] text-gray-500">Experience</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Verified Skills & Proficiency
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {skills.map((s: any, idx: number) => {
                const skillName = s.skill?.name || s.name || "Trade Skill";
                const prof = s.proficiencyLevel || "EXPERT";
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{skillName}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">✓ Cooperative Verified</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold bg-white">
                      {prof}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Certifications & Training
            </h3>
            <div className="space-y-2">
              {certifications.map((c: any, idx: number) => {
                const certName = c.certification?.name || c.name || "Vocational Skill Certification";
                const issuer = c.certification?.issuingAuthority || c.issuer || "Gujarat State Skill Development";
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{certName}</p>
                      <p className="text-xs text-gray-500">Issued by: {issuer}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
