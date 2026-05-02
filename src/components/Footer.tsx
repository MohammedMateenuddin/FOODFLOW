"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fish } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin, dashboard, map, and receiver/driver portals
  const hiddenRoutes = ["/admin", "/receiver", "/driver", "/map"];
  const isHidden = hiddenRoutes.some(route => pathname.startsWith(route));

  if (isHidden) return null;

  return (
    <footer className="bg-[#08090A] w-full border-t border-white/5 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
              <Fish className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">FoodFlow</span>
          </Link>
          <p className="text-sm font-light leading-relaxed text-slate-400 max-w-sm mb-6">
            Air Traffic Control for Surplus Food. We connect hotels, NGOs, and valorization partners in real-time to guarantee zero waste.
          </p>
          <div className="flex items-center gap-4 text-emerald-500">
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded">ISO 22000 Certified</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="/donate" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Donate Food</Link></li>
            <li><Link href="/receiver" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">NGO Portal</Link></li>
            <li><Link href="/zero-waste" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Valorization Engine</Link></li>
            <li><Link href="/impact" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Global Impact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal & Trust</h4>
          <ul className="space-y-2">
            <li><Link href="/trust" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Trust & Safety</Link></li>
            <li><Link href="/csr" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">CSR Compliance</Link></li>
            <li><Link href="/privacy" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} FoodFlow Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
