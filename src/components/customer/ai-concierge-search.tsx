"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/shared/voice-input";
import { Search, Sparkles } from "lucide-react";

interface AIConciergeSearchProps {
  initialQuery?: string;
  className?: string;
}

export function AIConciergeSearch({ initialQuery = "", className }: AIConciergeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleResult = (text: string) => {
    setQuery(text);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/customer/book?query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/customer/book");
    }
  };

  const quickPrompts = [
    "AC not cooling",
    "Water tap leaking",
    "Switchboard sparking",
    "Bathroom deep cleaning",
  ];

  const handleSelectPrompt = (prompt: string) => {
    setQuery(prompt);
    router.push(`/customer/book?query=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className={className ?? "w-full space-y-2.5"}>
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need help with? (e.g., AC cooling, plumbing, electrical)"
            className="pl-10 pr-12 h-12 rounded-xl bg-card border-border/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 focus-visible:border-primary shadow-xs text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <VoiceInput onResult={handleResult} onTranscription={handleResult} />
          </div>
        </div>
        <Button 
          type="submit" 
          className="h-12 rounded-xl gap-2 px-5 bg-primary hover:bg-primary/90 text-white font-semibold shrink-0 shadow-md shadow-primary/20 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-blue-200" />
          Ask AI Concierge
        </Button>
      </form>
      {/* Quick Prompt Suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-muted-foreground font-medium shrink-0 text-[11px]">Suggestions:</span>
        {quickPrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleSelectPrompt(p)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground text-[11px] transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
