"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center p-4 text-[#e3e2e3]">
      <div className="glass-panel p-10 rounded-3xl border border-red-500/20 text-center max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 relative z-10">🚫 Access Denied</h1>
        <p className="text-slate-400 mb-8 relative z-10">
          Your account doesn't have permission to view this page.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors relative z-10"
        >
          Go to your dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
