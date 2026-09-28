"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const changeLocale = (newLocale: string) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const labels: Record<string, string> = {
    en: "English",
    hi: "हिंदी",
    gu: "ગુજરાતી"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Globe className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium">{labels[locale] || "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale("en")} className="cursor-pointer">
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale("hi")} className="cursor-pointer">
          हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale("gu")} className="cursor-pointer">
          ગુજરાતી (Gujarati)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
