"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { format } from "date-fns";

export default function CertificatePage() {
  const params = useParams();
  const id = params.id as string;
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/verify/certificate/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setCert(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-neutral-500">Loading certificate...</div>;
  if (!cert) return <div className="p-12 text-center text-red-500 font-medium">Certificate not found or revoked.</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8 print:p-0 print:bg-white">
      <div className="bg-white max-w-4xl w-full p-16 border-[12px] border-emerald-900 shadow-2xl relative print:shadow-none print:border-emerald-900 print:w-full">
        {/* Decorative corner pieces */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-emerald-600 m-4" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-emerald-600 m-4" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-emerald-600 m-4" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-emerald-600 m-4" />

        <div className="text-center space-y-8 relative z-10">
          <div className="flex justify-center items-center gap-3">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-lg">
              CC
            </div>
            <h1 className="text-4xl font-black text-emerald-950 uppercase tracking-widest">
              Co-opConnect
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-neutral-500 font-medium tracking-[0.2em] uppercase">
              Platform-Issued Skill Certificate
            </h2>
            <p className="text-sm text-neutral-400">
              (Not a government or third-party trade certification)
            </p>
          </div>

          <div className="py-8">
            <p className="text-xl text-neutral-600 mb-4">This is to certify that</p>
            <h3 className="text-5xl font-serif font-bold text-neutral-900 italic">
              {cert.worker.user.name}
            </h3>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-xl text-neutral-600">
              has successfully completed the Co-opConnect internal skill verification process and has been approved for the trade category of:
            </p>
            <h4 className="text-3xl font-bold text-emerald-800 uppercase tracking-wide">
              {cert.trade}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-12 mt-16 text-left pt-12 border-t border-neutral-200">
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-1">Authorizing Cooperative</p>
              <p className="font-medium text-lg">{cert.cooperative?.name || "Independent Worker"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-1">Issue Date</p>
              <p className="font-medium text-lg">{format(new Date(cert.issuedAt), 'MMMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-neutral-100 flex justify-between items-end text-neutral-400 text-sm">
            <div>
              <p>Certificate ID: <span className="font-mono text-neutral-600">{cert.certificateNo}</span></p>
            </div>
            <div className="text-right">
              <p>Verify at: coopconnect.com/verify/worker/{cert.workerId}</p>
            </div>
          </div>
        </div>

        {/* Print Button (Hidden when printing) */}
        <div className="absolute -top-16 right-0 print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Download / Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
