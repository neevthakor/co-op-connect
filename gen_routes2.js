const fs = require('fs');
const path = require('path');

const writeFiles = (files) => {
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content.trim() + '\n');
    console.log(`Created ${filePath}`);
  }
};

const pages = {
  // WORKER PAGES
  'src/app/worker/home/page.tsx': `
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default async function WorkerHomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'WORKER') redirect('/login');
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Worker Dashboard</h1>
      <Card>
        <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Switch id="availability" />
          <Label htmlFor="availability">Currently Available</Label>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Today's Earnings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">$0.00</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active Jobs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">0</p></CardContent></Card>
      </div>
    </div>
  );
}`,
  'src/app/worker/jobs/page.tsx': `
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function WorkerJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'WORKER') redirect('/login');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Console</h1>
      <Tabs defaultValue="new">
        <TabsList className="w-full justify-between">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="new"><Card><CardHeader><CardTitle>New Requests</CardTitle></CardHeader><CardContent>No new requests.</CardContent></Card></TabsContent>
        <TabsContent value="accepted"><Card><CardHeader><CardTitle>Accepted Jobs</CardTitle></CardHeader><CardContent>No accepted jobs.</CardContent></Card></TabsContent>
        <TabsContent value="active"><Card><CardHeader><CardTitle>Active Jobs</CardTitle></CardHeader><CardContent>No active jobs.</CardContent></Card></TabsContent>
        <TabsContent value="completed"><Card><CardHeader><CardTitle>Completed Jobs</CardTitle></CardHeader><CardContent>No completed jobs.</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}`,
  'src/app/worker/jobs/[id]/page.tsx': `
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function JobExecutionPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    fetch('/api/bookings/' + params.id).then(res => res.json()).then(data => setJob(data)).catch(() => setJob({ status: 'ACCEPTED', id: params.id }));
  }, [params.id]);

  if (!job) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Execution</h1>
      <Card>
        <CardHeader><CardTitle>Job #{job.id}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Status: {job.status}</p>
          {job.status === 'ACCEPTED' && <Button className="w-full py-6 text-lg">NAVIGATE</Button>}
          {job.status === 'TRAVELLING' && <Button className="w-full py-6 text-lg">ARRIVED</Button>}
          {job.status === 'ARRIVED' && <Button className="w-full py-6 text-lg">ENTER PIN</Button>}
          {job.status === 'IN_PROGRESS' && <Button className="w-full py-6 text-lg">COMPLETE</Button>}
        </CardContent>
      </Card>
    </div>
  );
}`,
  'src/app/worker/calendar/page.tsx': `
export default function CalendarPage() {
  return <div className="p-4">Calendar implementation here...</div>;
}`,
  'src/app/worker/earnings/page.tsx': `
export default function EarningsPage() {
  return <div className="p-4">Earnings ledger here...</div>;
}`,
  'src/app/worker/helpers/page.tsx': `
'use client';
import { Button } from '@/components/ui/button';
export default function HelpersPage() {
  return <div className="p-4 space-y-4">
    <h1 className="text-2xl font-bold">Helpers Management</h1>
    <Button>REQUEST HELPER</Button>
  </div>;
}`,
  'src/app/worker/messages/page.tsx': `
'use client';
export default function MessagesPage() {
  return <div className="p-4">Messages here...</div>;
}`,
  'src/app/worker/notifications/page.tsx': `
export default function NotificationsPage() {
  return <div className="p-4">Notifications here...</div>;
}`,
  'src/app/worker/profile/page.tsx': `
export default function ProfilePage() {
  return <div className="p-4">Profile edit here...</div>;
}`,
  'src/app/worker/register/page.tsx': `
'use client';
import { Button } from '@/components/ui/button';
export default function RegisterPage() {
  return <div className="p-4 space-y-4"><h1 className="text-2xl">Registration</h1><Button>Submit Registration</Button></div>;
}`,

  // API ROUTES
  'src/app/api/services/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  try { return NextResponse.json([]); } 
  catch (error) { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}`,
  'src/app/api/workers/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json([]); }`,
  'src/app/api/workers/[id]/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json({}); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/workers/register/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function POST() { return NextResponse.json({ success: true }); }`,
  'src/app/api/bookings/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({ id: 1, status: 'REQUESTED' }); }`,
  'src/app/api/bookings/[id]/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json({}); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/bookings/[id]/materials/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({}); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/bookings/[id]/rating/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({}); }`,
  'src/app/api/bookings/[id]/complaint/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({}); }`,
  'src/app/api/bookings/[id]/proof/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ url: '/uploads/proof.jpg' }); }`,
  'src/app/api/matching/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }`,
  'src/app/api/matching/helpers/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }`,
  'src/app/api/payments/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ status: 'success' }); }
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/invoices/[id]/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/messages/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({}); }`,
  'src/app/api/notifications/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/ai/concierge/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ parsed: true }); }`,
  'src/app/api/ai/price-estimate/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ min: 10, max: 20 }); }`,
  'src/app/api/customers/trusted/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({}); }
export async function DELETE() { return NextResponse.json({}); }`,
  'src/app/api/search/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }`,
  'src/app/api/admin/verification/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/admin/workers/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }`,
  'src/app/api/admin/demand/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/admin/capacity/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/admin/welfare/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/admin/finance/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({}); }`,
  'src/app/api/admin/voting/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({}); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/teams/route.ts': `
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({}); }
export async function PATCH() { return NextResponse.json({}); }`,
  'src/app/api/upload/route.ts': `
import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ url: '/uploads/file.png' }); }`
};

writeFiles(pages);
