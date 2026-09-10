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
    <Link href={targetHref} className="block h-full group">
      <Card className={cn("h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card border-border/80", className)}>
        <CardHeader className="pb-2">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <IconComponent className="h-5 w-5" />
          </div>
          <CardTitle className="line-clamp-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {service.description && (
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
              {service.description}
            </p>
          )}
          <p className="text-xs font-medium text-muted-foreground">
            From <span className="text-primary font-bold text-sm">{formatCurrency(service.basePrice || 250)}</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
