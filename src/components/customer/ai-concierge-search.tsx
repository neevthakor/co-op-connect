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

  return (
    <form onSubmit={handleSubmit} className={className ?? "relative flex items-center w-full gap-2"}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need help with? (e.g., AC not cooling, tap leaking)"
          className="pl-9 pr-12 h-12 rounded-xl"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <VoiceInput onResult={handleResult} onTranscription={handleResult} />
        </div>
      </div>
      <Button type="submit" className="h-12 rounded-xl gap-2 px-6">
        <Sparkles className="h-4 w-4" />
        Ask AI
      </Button>
    </form>
  );
}
