import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Shield, ShieldCheck, ClipboardList, Activity, LayoutDashboard, LogOut } from 'lucide-react';
import { SignOutButton } from '@/components/auth/signout-button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 md:min-h-screen border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Platform Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <div className="pt-4 pb-1 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Management
          </div>
          <Link href="/admin/workers" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <ShieldCheck className="w-4 h-4" /> Worker Verification
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <ClipboardList className="w-4 h-4" /> Bookings & Jobs
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
           <SignOutButton className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 transition-colors" />
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

