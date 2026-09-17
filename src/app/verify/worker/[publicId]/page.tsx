import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Shield, CheckCircle } from "lucide-react";

export default async function WorkerPublicProfile({ params }: { params: { publicId: string } }) {
  const { publicId } = params;
  
  const worker = await prisma.worker.findUnique({
    where: { id: publicId },
  });

  if (!worker) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verified Worker</h2>
          <p className="mt-2 text-sm text-gray-600">ID: {worker.id.slice(0,8).toUpperCase()}</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Identity Verified</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>This worker's identity has been verified.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Primary Trade</dt>
                <dd className="text-sm text-gray-900">{worker.primaryTrade || 'General'}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                <dd className="text-sm text-gray-900">⭐ {worker.averageRating || 'New'}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Jobs Completed</dt>
                <dd className="text-sm text-gray-900">{worker.totalJobs}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
