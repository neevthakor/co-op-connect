import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { icons } from "lucide-react";

type ServiceCardService = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  basePrice: number;
  priceRange?: string;
};

export function ServiceCard({ service, href, className }: { service: ServiceCardService; href?: string; className?: string }) {
  const iconName = service.icon || "Wrench";
  const IconComponent = icons[iconName as keyof typeof icons] || icons.Wrench;
  const targetHref = href || `/customer/book?category=${service.id}`;

  return (
    <div className={cn("block h-full group", className)}>
      <Card className="flex flex-col h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card border-border/80 overflow-hidden relative">
        <Link href={targetHref} className="flex-grow flex flex-col">
          <CardHeader className="pb-2">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <IconComponent className="h-5 w-5" />
            </div>
            <CardTitle className="line-clamp-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-grow">
            {service.description && (
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                {service.description}
              </p>
            )}
            <p className="text-xs font-medium text-muted-foreground">
              From <span className="text-primary font-bold text-sm">{formatCurrency(service.basePrice || 250)}</span>
            </p>
          </CardContent>
        </Link>
        <div className="p-3 pt-0 mt-auto bg-card border-t border-border/40 relative z-10">
          <Link 
            href={`${targetHref}&emergency=true`} 
            className="flex items-center justify-between group/em border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/40 px-3 py-2 rounded-lg transition-colors mt-2"
          >
            <span className="text-[11px] font-bold text-destructive flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              NEED IT NOW
            </span>
            <span className="text-[10px] text-destructive/80 group-hover/em:text-destructive font-semibold">Priority &rarr;</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
