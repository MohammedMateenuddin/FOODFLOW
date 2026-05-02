"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, CheckCircle2, AlertTriangle, Users, BookOpen } from "lucide-react";

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState({
    csr: 0,
    badges: 0,
    tipping: 0,
    subscriptions: 0,
    total: 0
  });

  // Animate numbers up on load
  useEffect(() => {
    const target = {
      csr: 7295,
      badges: 4997,
      tipping: 3240,
      subscriptions: 25000,
      total: 40532
    };

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setRevenue({
        csr: Math.floor(target.csr * easeOutQuart),
        badges: Math.floor(target.badges * easeOutQuart),
        tipping: Math.floor(target.tipping * easeOutQuart),
        subscriptions: Math.floor(target.subscriptions * easeOutQuart),
        total: Math.floor(target.total * easeOutQuart),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d } })
  };

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* ═══ LIVE REVENUE TRACKER ═══ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="glass-panel p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02] mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">FoodFlow Revenue</h2>
              <p className="text-emerald-400 text-sm font-semibold">MAY 2025</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            {/* Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-slate-300 font-semibold mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400"/> CSR Reports</div>
                  <div className="text-xs text-slate-500">4 corporate subscribers</div>
                </div>
                <div className="text-xl font-bold text-white">₹{revenue.csr.toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-slate-300 font-semibold mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Trust Badges</div>
                  <div className="text-xs text-slate-500">3 premium restaurants</div>
                </div>
                <div className="text-xl font-bold text-white">₹{revenue.badges.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-slate-300 font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/> Partner Tipping</div>
                  <div className="text-xs text-slate-500">1,296 kg valorized</div>
                </div>
                <div className="text-xl font-bold text-white">₹{revenue.tipping.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-slate-300 font-semibold mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-purple-400"/> Partner Subscriptions</div>
                  <div className="text-xs text-slate-500">4 premium valorization partners</div>
                </div>
                <div className="text-xl font-bold text-white">₹{revenue.subscriptions.toLocaleString()}</div>
              </div>
            </div>

            {/* Total MRR */}
            <div className="flex flex-col justify-center">
               <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/30 text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                 <div className="relative z-10">
                   <p className="text-emerald-400 font-bold uppercase tracking-widest mb-4">Total Monthly Recurring Revenue</p>
                   <div className="text-6xl md:text-7xl font-bold text-white mb-4 flex justify-center items-baseline gap-2">
                     <span className="text-4xl text-emerald-500">₹</span>
                     {revenue.total.toLocaleString()}
                   </div>
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">
                     <ArrowUpRight className="w-4 h-4" /> +14.2% from last month
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* OTHER ADMIN WIDGETS CAN GO HERE */}
        <div className="grid md:grid-cols-2 gap-6">
           <a href="/admin/complaints" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors block">
             <h3 className="text-xl font-bold text-white mb-2">Complaint Resolution Hub</h3>
             <p className="text-slate-400 text-sm">Manage user reports and driver issues.</p>
           </a>
           <a href="/csr" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors block">
             <h3 className="text-xl font-bold text-white mb-2">CSR Report Generator</h3>
             <p className="text-slate-400 text-sm">View or generate corporate sustainability reports.</p>
           </a>
        </div>
      </div>
    </div>
  );
}
