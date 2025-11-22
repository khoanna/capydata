"use client";

import dynamic from "next/dynamic";
import { BookOpen, FileText, MessageCircle } from "lucide-react";

const PublishWizard = dynamic(
  () => import("@/components/Publish/PublishWizard"),
  { ssr: false }
);

export default function PublishPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-5xl mx-auto px-6">
        {/* Page Header */}
        <div className="text-center mb-12 reveal">
          <h1 className="text-5xl font-sans font-bold text-white mb-4">
            Publish Your Dataset
          </h1>
          <p className="font-mono text-sm text-gray-400 max-w-2xl mx-auto">
            List your data on CapyData marketplace. Earn SUI tokens while
            maintaining full control and privacy with Seal protocol encryption.
          </p>
        </div>

        {/* Publish Wizard */}
        <PublishWizard />

        {/* Help Section */}
        <div className="mt-16 text-center reveal delay-300">
          <p className="font-mono text-xs text-gray-500 mb-4">
            Need help getting started?
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              className="font-mono text-xs text-hydro hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              Publishing Guide
            </a>
            <a
              href="#"
              className="font-mono text-xs text-hydro hover:underline flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              Data Standards
            </a>
            <a
              href="#"
              className="font-mono text-xs text-hydro hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              Get Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
