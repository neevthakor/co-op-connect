'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Camera, Check } from 'lucide-react';

interface ProfilePhotoEditorProps {
  workerId: string;
  currentPhotoUrl: string | null;
}

export function ProfilePhotoEditor({ workerId, currentPhotoUrl }: ProfilePhotoEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentPhotoUrl) {
      if (currentPhotoUrl.startsWith('http') || currentPhotoUrl.startsWith('data:')) {
        setImageUrl(currentPhotoUrl);
      } else {
        // Fetch signed URL from a new endpoint
        fetch(`/api/workers/${workerId}/photo`)
          .then(res => res.json())
          .then(data => {
            if (data.url) setImageUrl(data.url);
          })
          .catch(() => {});
      }
    }
  }, [currentPhotoUrl, workerId]);

  const handleUpload = async () => {
    if (!photo) return;
    setLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const res = await fetch(`/api/workers/${workerId}/photo`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setMsg('Profile photo updated successfully!');
      setPhoto(null);
      setImageUrl(data.url);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" /> Profile Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
        {msg && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3"/> {msg}</p>}
        
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
            {photo ? (
              <img src={URL.createObjectURL(photo)} alt="Preview" className="object-cover w-full h-full" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground opacity-50" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    setErrorMsg('Photo size must be less than 5MB');
                    return;
                  }
                  if (!file.type.startsWith('image/')) {
                    setErrorMsg('File must be an image');
                    return;
                  }
                  setPhoto(file);
                  setErrorMsg('');
                  setMsg('');
                }
              }}
              disabled={loading}
              className="text-xs"
            />
            {photo && (
              <Button 
                onClick={handleUpload} 
                disabled={loading} 
                className="w-full h-8 text-xs"
              >
                {loading ? <><Loader2 className="w-3 h-3 mr-2 animate-spin"/> Uploading...</> : 'Save Photo'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
