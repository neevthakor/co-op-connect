import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelperProps {
  id: string;
  name: string;
  avatar?: string;
  role: "APPRENTICE" | "HELPER";
  mentor: {
    id: string;
    name: string;
  };
  trade: string;
  hoursLogged: number;
}

export function HelperCard({ helper, className }: { helper: HelperProps; className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row gap-4 p-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={helper.avatar} alt={helper.name} />
          <AvatarFallback>{helper.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{helper.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs font-normal">
              <GraduationCap className="h-3 w-3 mr-1" />
              {helper.role}
            </Badge>
            <span className="text-xs text-muted-foreground">{helper.trade}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Mentor
            </span>
            <Link href={`/worker/${helper.mentor.id}`} className="font-medium hover:underline text-primary">
              {helper.mentor.name}
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Training Hours</span>
            <span className="font-medium">{helper.hoursLogged} hrs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
