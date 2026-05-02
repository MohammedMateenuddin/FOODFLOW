"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Zap, Calendar, ArrowUpRight, Award } from "lucide-react";
import { useProfile } from "@/lib/hooks/useProfile";

export default function DriverEarnings() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setDriver({
        total_earnings: 12500,
        karma_points: 850,
        total_deliveries: 45,
      });
      setTimeout(() => setLoading(false), 500);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#08090A] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">My Earnings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
            <Wallet className="absolute -right-8 -bottom-8 w-48 h-48 text-emerald-500/5 rotate-[-15deg]" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total INR Earnings</p>
            <h2 className="text-5xl font-black text-emerald-400 font-space tracking-tighter relative z-10">
              ₹{Math.round((driver?.total_earnings || 0) / 30)}
            </h2>
            <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full relative z-10">
              <TrendingUp className="w-3 h-3" /> +14% this week
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden">
             <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-amber-500/5 rotate-[-15deg]" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Karma Points</p>
             <h2 className="text-5xl font-black text-amber-400 font-space tracking-tighter relative z-10">
               {driver?.karma_points || 0}
             </h2>
             <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full relative z-10">
               <Award className="w-3 h-3" /> Top 5% Driver
             </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl border border-white/5 mt-8">
           <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
           <div className="space-y-4">
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                     <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                     <h4 className="text-white font-bold">Delivery Payout</h4>
                     <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Today, 2:30 PM</p>
                   </div>
                 </div>
                 <span className="text-emerald-400 font-bold font-space">+₹{(150 - i * 30)}</span>
               </div>
             ))}
           </div>
        </motion.div>
      </div>
    </div>
  );
}
