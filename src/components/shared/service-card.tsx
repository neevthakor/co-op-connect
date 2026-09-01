import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

export function ServiceCard({ service, href, className }: { service: any; href?: string; className?: string }) {
  const iconName = service.icon || "Wrench";
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Wrench;
  const targetHref = href || `/customer/book?category=${service.id}`;

  return (
    <Link href={targetHref} className="block h-full">
      <Card className={cn("h-full transition-all hover:border-primary/40 hover:shadow-md bg-white border", className)}>
        <CardHeader className="pb-2">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconComponent className="h-5 w-5" />
          </div>
          <CardTitle className="line-clamp-1 text-base font-bold text-gray-900">{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {service.description && (
            <p className="mb-3 line-clamp-2 text-xs text-gray-500">
              {service.description}
            </p>
          )}
          <p className="text-xs font-medium text-gray-700">
            From <span className="text-primary font-bold text-sm">{formatCurrency(service.basePrice || 250)}</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
