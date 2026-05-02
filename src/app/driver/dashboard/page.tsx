"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, MapPin, Award, Download, Zap, TrendingUp, Package, Bell, Map, Clock, Navigation, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getBadgeForDeliveries, BADGE_LEVELS } from "@/lib/driver-matcher";
import { toast } from "sonner";
import { useProfile } from "@/lib/hooks/useProfile";
import confetti from "canvas-confetti";

function DriverCardSkeleton() {
  return (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between shimmer border border-white/5 mb-3">
      <div className="space-y-2 flex-1">
        <div className="w-1/2 h-5 bg-white/10 rounded" />
        <div className="w-1/3 h-3 bg-white/10 rounded" />
      </div>
      <div className="w-1/4 h-8 bg-white/10 rounded" />
    </div>
  );
}

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);

  const { profile } = useProfile();

  const handleDownloadCert = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#08090A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 5;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Text Content
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF APPRECIATION', canvas.width / 2, 180);
    
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '30px sans-serif';
    ctx.fillText('This certificate is proudly presented to', canvas.width / 2, 280);

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 70px sans-serif';
    ctx.fillText(profile?.full_name || 'FoodFlow Hero', canvas.width / 2, 400);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px sans-serif';
    ctx.fillText('For outstanding contribution in rescuing surplus food and fighting hunger.', canvas.width / 2, 500);
    
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '28px sans-serif';
    ctx.fillText(`Food Rescued: ${driver?.total_deliveries || 45} Deliveries`, canvas.width / 2, 600);
    ctx.fillText(`Karma Points Earned: ${driver?.karma_points || 850} XP`, canvas.width / 2, 650);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('FoodFlow Initiative', canvas.width / 2, 760);

    // Trigger download
    const link = document.createElement('a');
    link.download = `FoodFlow_Certificate_${profile?.full_name?.replace(/\s+/g, '_') || 'Hero'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success("Certificate successfully downloaded!");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  useEffect(() => {
    if (profile) {
      setDriver({
        id: profile.id,
        name: profile.full_name || "Delivery Partner",
        driver_type: "paid",
        total_deliveries: 45,
        karma_points: 850,
        total_earnings: 12500
      });
      supabase.from("delivery_assignments").select("*, listing:listings(food_name, quantity_kg, pickup_address)")
        .order("created_at", { ascending: false }).limit(5)
        .then(({ data }) => { 
          if (data) setAssignments(data); 
          setTimeout(() => setLoading(false), 800);
        });
    }
  }, [profile]);

  if (!driver && !loading) {
    return (
      <div className="min-h-screen bg-[#08090A] pt-28 flex items-center justify-center">
        <p className="text-slate-400">Loading driver dashboard...</p>
      </div>
    );
  }

  const badge = driver ? getBadgeForDeliveries(driver.total_deliveries) : BADGE_LEVELS[0];
  const nextBadge = BADGE_LEVELS[BADGE_LEVELS.indexOf(badge) + 1];
  const progress = driver && nextBadge
    ? ((driver.total_deliveries - badge.min) / (nextBadge.min - badge.min)) * 100
    : 100;

  const mealsRescued = driver ? driver.total_deliveries * 12 : 0;

  return (
    <div className="min-h-screen bg-[#08090A] pt-20 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mt-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 md:gap-6">
          {loading ? (
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 shimmer shrink-0" />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              {badge.emoji}
            </div>
          )}
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="w-40 h-8 bg-white/10 shimmer rounded" />
                <div className="w-24 h-4 bg-white/10 shimmer rounded" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{driver.name}</h1>
                <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs md:text-sm">{badge.label} Driver</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Top Earnings Card (Mobile Priority) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-white/[0.05]">
          <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">
            <div className="px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Earnings Today</p>
              {loading ? <div className="w-20 h-8 bg-white/10 shimmer rounded" /> : (
                <p className="text-2xl md:text-3xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  ₹{Math.round((driver.total_earnings || 0) / 30)}
                </p>
              )}
            </div>
            <div className="px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Karma Balance</p>
              {loading ? <div className="w-20 h-8 bg-white/10 shimmer rounded" /> : (
                <p className="text-2xl md:text-3xl font-bold text-amber-400" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {driver.karma_points}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Badge Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5">
          {loading ? (
             <div className="space-y-3">
               <div className="flex justify-between"><div className="w-24 h-4 bg-white/10 shimmer rounded"/><div className="w-24 h-4 bg-white/10 shimmer rounded"/></div>
               <div className="w-full h-3 bg-white/10 shimmer rounded-full" />
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-bold text-sm md:text-base">{badge.emoji} {badge.label}</span>
                {nextBadge && <span className="text-slate-400 text-xs md:text-sm">{nextBadge.emoji} {nextBadge.label} in {nextBadge.min - driver.total_deliveries} trips</span>}
              </div>
              <div className="h-3 bg-[#1f2021] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: Math.min(progress, 100) + "%" }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </>
          )}
        </motion.div>

        {/* Active Pickup (Sticky Style) */}
        <div className="glass-panel p-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 sticky top-24 z-30 shadow-2xl">
           <div className="p-4 md:p-5">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                 <h3 className="text-sm font-bold text-white tracking-widest uppercase">Active Delivery</h3>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold font-space border border-amber-500/30 animate-pulse">
                 <Clock className="w-3.5 h-3.5" /> 14m ETA
               </div>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between gap-4">
               <div>
                 <h4 className="text-lg font-bold text-white">{assignments[0] ? `${assignments[0].listing?.quantity_kg || 40}kg ${assignments[0].listing?.food_name || 'Cooked Meals'}` : '40kg Cooked Meals'}</h4>
                 <div className="flex items-center gap-1 text-sm text-slate-400 mt-1"><MapPin className="w-4 h-4"/> {assignments[0]?.listing?.pickup_address ? assignments[0].listing.pickup_address.split(',')[0] : 'Taj Hotel'} ➝ Hope Orphanage</div>
               </div>
               <button 
                 onClick={() => {
                   const origin = assignments[0]?.listing?.pickup_address ? encodeURIComponent(assignments[0].listing.pickup_address) : "Taj+Hotel,+Mumbai";
                   const dest = "Hope+Orphanage,+Mumbai";
                   window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, '_blank');
                 }}
                 className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-[#003824] font-bold rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
               >
                 <Navigation className="w-5 h-5"/> Start Navigation
               </button>
             </div>
           </div>
        </div>

        {/* Recent Assignments Stack */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-bold text-white">Pickup History</h3>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {loading ? (
                <>
                  <DriverCardSkeleton />
                  <DriverCardSkeleton />
                  <DriverCardSkeleton />
                </>
              ) : assignments.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center flex flex-col items-center">
                    <div className="w-24 h-24 mb-4 opacity-50 bg-[url('https://cdn.lordicon.com/qiwjwsnh.json')] bg-contain bg-center mix-blend-screen" />
                    <h4 className="text-lg font-bold text-white mb-2">No pickups yet</h4>
                    <p className="text-sm text-slate-400 mb-6">Complete your first delivery to appear on the leaderboard.</p>
                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2">
                       <Map className="w-4 h-4"/> View Live Map
                    </button>
                 </motion.div>
              ) : (
                assignments.map((a, i) => (
                  <motion.div 
                    key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/5 gap-3"
                  >
                    <div>
                      <p className="text-white font-bold text-sm md:text-base">{a.listing?.food_name || "Food Delivery"}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{a.listing?.quantity_kg || 0} kg • {a.status}</p>
                    </div>
                    <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center">
                      <p className="text-emerald-400 font-bold font-space">{a.total_pay ? "\u20B9" + a.total_pay : "Pending"}</p>
                      {a.bonus_multiplier > 1 && <p className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mt-1">{a.bonus_multiplier}x bonus</p>}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setShowWallet(true)}
            className="glass-panel p-5 md:p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-bold text-base md:text-lg">Redeem Karma</h4>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Convert points to UPI payout</p>
          </button>
          <button onClick={handleDownloadCert}
            className="glass-panel p-5 md:p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all text-left group">
            <Download className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-bold text-base md:text-lg">Download Certificate</h4>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Official volunteer certificate</p>
          </button>
        </div>

      </div>

      <AnimatePresence>
        {showWallet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#111] p-8 rounded-3xl border border-emerald-500/30 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative">
              <button onClick={() => setShowWallet(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Redeem Karma Points</h2>
              <p className="text-slate-400 text-sm mb-8">Convert your earned delivery points directly to your bank account via UPI.</p>
              
              <div className="bg-[#08090a] rounded-xl p-6 border border-white/5 mb-8">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mb-2">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400 font-space">₹{Math.round((driver?.total_earnings || 12500) / 30)}</span>
                  <span className="text-emerald-400/50 text-sm font-bold uppercase">INR</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Enter UPI ID</label>
                  <input type="text" placeholder="example@oksbi" className="w-full bg-[#08090a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Amount to Withdraw</label>
                  <input type="number" placeholder="Enter amount" defaultValue={Math.round((driver?.total_earnings || 12500) / 30)} className="w-full bg-[#08090a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
                </div>
              </div>

              <button onClick={() => {
                toast.success("Withdrawal initiated! Funds will arrive in 2-4 hours.");
                setShowWallet(false);
              }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#08090a] font-bold text-lg py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> Withdraw Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
