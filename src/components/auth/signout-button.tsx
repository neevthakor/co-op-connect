'use client';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button onClick={() => signOut()} className={className}>
      <LogOut className="w-4 h-4" />
      <span>Sign Out</span>
    </button>
  );
}
