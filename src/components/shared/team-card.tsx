import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, PieChart } from "lucide-react";
import { cn, formatCurrency, getStatusColor } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: "LEAD" | "SPECIALIST" | "HELPER";
  trade: string;
  revenueShare: number;
}

interface TeamProps {
  id: string;
  name: string;
  status: string;
  members: TeamMember[];
  revenueTotal: number;
}

export function TeamCard({ team, className }: { team: TeamProps; className?: string }) {
  const lead = team.members.find(m => m.role === "LEAD");
  const others = team.members.filter(m => m.role !== "LEAD");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 pb-2 bg-muted/30 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {team.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Team of {team.members.length} • {formatCurrency(team.revenueTotal)} generated
            </p>
          </div>
          <Badge className={getStatusColor(team.status)}>
            {team.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y text-sm">
          {/* Lead Worker */}
          {lead && (
            <div className="p-4 flex items-center gap-3 bg-primary/5">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={lead.avatar} />
                <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{lead.name}</span>
                  <Crown className="h-3 w-3 text-yellow-500" />
                </div>
                <span className="text-xs text-muted-foreground">{lead.trade}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <PieChart className="h-3 w-3" />
                  {lead.revenueShare}%
                </div>
              </div>
            </div>
          )}

          {/* Other Members */}
          {others.map(member => (
            <div key={member.id} className="p-4 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{member.name}</div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  <span>{member.role}</span>
                  <span>•</span>
                  <span>{member.trade}</span>
                </div>
              </div>
              <div className="text-right text-xs font-medium text-muted-foreground">
                {member.revenueShare}% share
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
