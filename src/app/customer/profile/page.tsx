import { auth, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/shared/stat-card';
import { LogOut, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      customer: { select: { id: true, address: true } },
    },
  });

  if (!user) redirect('/login');

  const customerId = user.customer?.id;

  const [totalBookings, completedBookings] = await Promise.all([
    customerId
      ? prisma.booking.count({ where: { customerId } })
      : 0,
    customerId
      ? prisma.booking.findMany({
          where: { customerId, status: 'COMPLETED' },
          select: { finalPrice: true, estimatedPrice: true },
        })
      : [],
  ]);

  const totalSpent = completedBookings.reduce(
    (sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-2xl mx-auto w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight mb-2">My Profile</h1>
      </header>

      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="text-2xl">{user.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Bookings" value={totalBookings.toString()} />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email || ''} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue={user.phone || ''} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Default Address</Label>
              <Input id="address" defaultValue={user.customer?.address || ''} placeholder="Paldi, Ahmedabad, Gujarat" />
            </div>
            <Button className="w-full mt-4 gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <form action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}>
        <Button variant="destructive" className="w-full gap-2" type="submit">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </div>
  );
}
