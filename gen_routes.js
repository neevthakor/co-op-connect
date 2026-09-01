const fs = require('fs');
const path = require('path');

const writeFiles = (files) => {
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content.trim());
    console.log(`Created ${filePath}`);
  }
};

const pages = {
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
  
  const worker = await prisma.worker.findUnique({
    where: { userId: session.user.id },
    include: { jobs: { where: { status: 'ACTIVE' } } }
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Worker Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Switch id="availability" defaultChecked={worker?.status === 'AVAILABLE'} />
          <Label htmlFor="availability">Currently Available</Label>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Today's Earnings</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">$120.00</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active Jobs</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{worker?.jobs?.length || 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}`,
  'src/app/worker/jobs/page.tsx': `
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function WorkerJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'WORKER') redirect('/login');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Console</h1>
      <Tabs defaultValue="active">
        <TabsList className="w-full justify-between">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <Card><CardHeader><CardTitle>New Requests</CardTitle></CardHeader><CardContent>No new requests.</CardContent></Card>
        </TabsContent>
        <TabsContent value="active">
           <Card><CardHeader><CardTitle>Active Jobs</CardTitle></CardHeader><CardContent>No active jobs.</CardContent></Card>
        </TabsContent>
        <TabsContent value="completed">
           <Card><CardHeader><CardTitle>Completed Jobs</CardTitle></CardHeader><CardContent>No completed jobs.</CardContent></Card>
        </TabsContent>
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
    fetch('/api/bookings/' + params.id)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [params.id]);

  if (!job) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job Execution</h1>
      <Card>
        <CardHeader>
          <CardTitle>Job #{job.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Status: {job.status}</p>
          {job.status === 'ACCEPTED' && <Button className="w-full">NAVIGATE</Button>}
          {job.status === 'TRAVELLING' && <Button className="w-full">ARRIVED</Button>}
          {job.status === 'IN_PROGRESS' && <Button className="w-full">COMPLETE</Button>}
        </CardContent>
      </Card>
    </div>
  );
}`,
  'src/app/api/services/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({ where: { active: true } });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}`,
  'src/app/api/workers/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const workers = await prisma.worker.findMany({
      where: category ? { skills: { some: { categoryId: category } } } : undefined
    });
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}`
};

writeFiles(pages);
