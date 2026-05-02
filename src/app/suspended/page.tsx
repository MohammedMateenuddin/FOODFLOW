"use client";

import React from "react";
import Link from "next/link";
import { Ban, ArrowLeft } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center p-4 text-[#e3e2e3]">
      <div className="glass-panel p-10 rounded-3xl border border-slate-700 text-center max-w-md relative overflow-hidden">
        
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-slate-600">
          <Ban className="w-10 h-10 text-slate-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 relative z-10">⚫ Account Under Review</h1>
        <p className="text-slate-400 mb-6 relative z-10">
          Your account has been temporarily suspended due to food quality concerns or policy violations.
        </p>

        <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-8 text-sm text-slate-300 relative z-10">
          Contact support to appeal:<br/>
          <a href="mailto:support@foodflow.in" className="text-emerald-400 font-semibold hover:underline">support@foodflow.in</a>
        </div>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors relative z-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
