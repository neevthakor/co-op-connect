"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";

interface Proof {
  type: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: string | Date;
}

interface ProofGalleryProps {
  proofs: Proof[] | any[];
  className?: string;
}

export function ProofGallery({ proofs, className }: ProofGalleryProps) {
  if (!proofs || proofs.length === 0) return null;

  const beforeProofs = proofs.filter(p => p.type === "BEFORE");
  const duringProofs = proofs.filter(p => p.type === "DURING");
  const afterProofs = proofs.filter(p => p.type === "AFTER");

  const defaultTab = beforeProofs.length > 0 ? "before" : 
                    afterProofs.length > 0 ? "after" : "all";

  return (
    <div className={cn("space-y-4 bg-white p-5 rounded-xl border shadow-xs", className)}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="before">Before Work ({beforeProofs.length})</TabsTrigger>
          <TabsTrigger value="after">After Completion ({afterProofs.length})</TabsTrigger>
          <TabsTrigger value="all">All Photos ({proofs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="before" className="mt-4">
          <GalleryGrid proofs={beforeProofs} />
        </TabsContent>
        <TabsContent value="after" className="mt-4">
          <GalleryGrid proofs={afterProofs} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <GalleryGrid proofs={proofs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GalleryGrid({ proofs }: { proofs: any[] }) {
  if (proofs.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">No photos in this category.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {proofs.map((proof, i) => (
        <Card key={i} className="overflow-hidden border group">
          <div className="aspect-video w-full relative bg-gray-100 flex items-center justify-center">
            {/* Display placeholder image or actual image */}
            <div className="text-xs text-gray-400 font-mono text-center p-2">
              📸 {proof.type} Photo #{i + 1}
            </div>
          </div>
          {proof.caption && (
            <div className="p-2 border-t bg-white">
              <p className="text-[11px] text-gray-600 truncate">{proof.caption}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
