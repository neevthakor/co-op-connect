'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TrustedWorkerButtonProps {
  workerId: string;
  initialIsTrusted?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function TrustedWorkerButton({ 
  workerId, 
  initialIsTrusted = false, 
  className,
  variant = 'outline',
  size = 'default',
  showText = true
}: TrustedWorkerButtonProps) {
  const [isTrusted, setIsTrusted] = useState(initialIsTrusted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsTrusted(initialIsTrusted);
  }, [initialIsTrusted]);

  const toggleTrusted = async () => {
    setLoading(true);
    try {
      if (isTrusted) {
        const res = await fetch(`/api/customers/trusted?workerId=${workerId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove from trusted workers');
        setIsTrusted(false);
        toast.success('Removed from trusted workers');
      } else {
        const res = await fetch('/api/customers/trusted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerId }),
        });
        if (!res.ok) throw new Error('Failed to add to trusted workers');
        setIsTrusted(true);
        toast.success('Added to trusted workers');
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isTrusted ? 'default' : variant}
      size={size}
      className={cn("gap-2 transition-all z-10", isTrusted ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500" : "", className)}
      onClick={(e) => {
        e.preventDefault(); // Prevent linking if inside a Link tag
        e.stopPropagation();
        toggleTrusted();
      }}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", isTrusted ? "fill-current" : "")} />
      )}
      {showText && (isTrusted ? 'Trusted' : 'Add to Trusted')}
    </Button>
  );
}
