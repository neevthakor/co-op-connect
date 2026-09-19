'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AvatarWithAuth({ src, alt, fallback, workerId, className }: { src?: string | null, alt: string, fallback: string, workerId: string, className?: string }) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) return;
    
    if (src.startsWith('http') || src.startsWith('data:')) {
      setUrl(src);
    } else {
      // It's a private path, fetch the signed URL
      fetch(`/api/workers/${workerId}/photo`)
        .then(res => res.json())
        .then(data => {
          if (data.url) setUrl(data.url);
        })
        .catch(console.error);
    }
  }, [src, workerId]);

  return (
    <Avatar className={className}>
      <AvatarImage src={url} alt={alt} />
      <AvatarFallback className="font-bold text-foreground bg-secondary">{fallback}</AvatarFallback>
    </Avatar>
  );
}
