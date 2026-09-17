'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface WorkerQRCardProps {
  worker: {
    id: string;
    publicId?: string | null;
    user: { name: string; avatar?: string | null };
    primaryTrade?: string | null;
    verificationStatus: string;
    verificationMethod?: string | null;
  };
}

export function WorkerQRCard({ worker }: WorkerQRCardProps) {
  const isVerified = worker.verificationStatus === 'VERIFIED';
  
  // Use publicId if available, fallback to internal ID
  const verifyId = worker.publicId || worker.id;
  const verifyUrl = `/verify/worker/${verifyId}`;

  return (
    <Card className="max-w-sm w-full mx-auto overflow-hidden shadow-md">
      <div className={`h-2 ${isVerified ? 'bg-green-500' : 'bg-amber-500'}`} />
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
          {worker.user.avatar ? (
            <img src={worker.user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            worker.user.name[0]
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-lg">{worker.user.name}</h3>
          <p className="text-sm text-muted-foreground">{worker.primaryTrade || 'Worker'}</p>
        </div>

        <Badge variant={isVerified ? 'default' : 'secondary'} className={isVerified ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
          {isVerified ? (
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {worker.verificationMethod === 'DIGILOCKER' ? 'Identity Verified (MOCK)' : 'Admin Verified'}</span>
          ) : (
            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Verification Pending</span>
          )}
        </Badge>

        <div className="pt-4 pb-2">
          <div className="bg-white p-3 border-2 border-dashed rounded-lg inline-block relative group cursor-pointer">
            <Link href={verifyUrl} target="_blank">
              {/* Fallback QR representation */}
              <QrCode className="w-24 h-24 text-gray-800" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <span className="text-white text-xs font-bold px-2 text-center">Click to Open Verification Page</span>
              </div>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Scan to verify identity</p>
        </div>
      </CardContent>
    </Card>
  );
}
