import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Create Request - Institution - Co-opConnect",
};

export default async function CreateInstitutionRequestPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const institutionId = (session.user as any).institutionId;
  if (!institutionId) redirect("/login");

  const locations = await prisma.organizationLocation.findMany({
    where: { institutionId },
    orderBy: { name: "asc" },
  });

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  async function createRequest(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const institutionId = (session.user as any).institutionId;
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const locationId = formData.get("locationId") as string;
    const categoryId = formData.get("categoryId") as string;
    const priority = formData.get("priority") as string;

    const request = await prisma.institutionServiceRequest.create({
      data: {
        institutionId,
        title,
        description,
        locationId,
        categoryId,
        priority: priority || "NORMAL",
        status: "OPEN",
      }
    });

    redirect(`/institution/services`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Service Request</h2>
        <p className="text-muted-foreground">Request maintenance or services for your institution.</p>
      </div>

      <Card>
        <form action={createRequest}>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Category</label>
              <select name="categoryId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <select name="locationId" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">Select a location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input name="title" required placeholder="Brief description of the issue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" required placeholder="Detailed explanation..." rows={4} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select name="priority" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Create Request & Find Workers</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
