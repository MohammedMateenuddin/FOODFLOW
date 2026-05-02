"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Trophy, Globe, Award, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BADGE_LEVELS } from "@/lib/driver-matcher";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d } }),
};

export default function DriversJoinPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("drivers").select("*").order("karma_points", { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setLeaderboard(data); });
  }, []);

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* HERO */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm uppercase tracking-widest mb-6">
            <Truck className="w-4 h-4" /> Join the Fleet
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            Deliver Food. <span className="text-emerald-500">Earn Money.</span> Save Lives.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join 500+ drivers rescuing food across Mumbai. Flexible hours, instant payouts, and real impact.
          </p>
        </motion.div>

        {/* 3 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <span className="text-3xl">{"\uD83D\uDCB0"}</span>, title: "Earn", desc: "\u20B9500\u20131,500/day. Flexible hours. Instant UPI payout. Bonus multipliers for urgent deliveries.", color: "border-emerald-500/30" },
            { icon: <span className="text-3xl">{"\uD83C\uDFC6"}</span>, title: "Level Up", desc: "Newcomer \u2192 Helper \u2192 Hero \u2192 Legend. Real perks at each level. Your stats tracked live.", color: "border-amber-500/30" },
            { icon: <span className="text-3xl">{"\uD83C\uDF0D"}</span>, title: "Impact", desc: "Every delivery = meals served + CO\u2082 avoided. Get an official FoodFlow Volunteer Certificate.", color: "border-blue-500/30" },
          ].map((col, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={0.2 + i * 0.1}
              className={"glass-panel p-8 rounded-2xl border " + col.color + " text-center hover:-translate-y-1 transition-transform"}>
              <div className="mb-4">{col.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{col.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{col.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* BADGE PROGRESSION */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          className="glass-panel p-8 rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Badge Progression</h2>
          <div className="flex items-center justify-between gap-2 mb-8">
            {BADGE_LEVELS.map((b, i) => (
              <React.Fragment key={b.key}>
                <div className="flex-1 text-center">
                  <div className="text-4xl mb-2">{b.emoji}</div>
                  <p className="text-white font-bold text-sm">{b.label}</p>
                  <p className="text-slate-500 text-xs">{b.min}+ deliveries</p>
                  <p className="text-emerald-400 text-xs mt-1">{b.perk}</p>
                </div>
                {i < BADGE_LEVELS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "65%" }} viewport={{ once: true }}
              transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500 rounded-full" />
          </div>
        </motion.div>

        {/* VOLUNTEER CERTIFICATE */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          className="glass-panel p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-center">
          <div className="text-5xl mb-4">{"\uD83D\uDCDC"}</div>
          <h3 className="text-2xl font-bold text-white mb-2">Official Volunteer Certificate</h3>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Valid for NSS/NCC credit hours. Auto-generated based on your verified deliveries. Download anytime from your dashboard.
          </p>
          <button className="px-8 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold rounded-xl hover:bg-blue-500/30 transition-all">
            Learn More
          </button>
        </motion.div>

        {/* LEADERBOARD */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          className="glass-panel p-8 rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> This Week&apos;s Leaderboard
          </h2>
          <div className="space-y-3">
            {leaderboard.map((d, i) => (
              <div key={d.id} className={"flex items-center gap-4 p-4 rounded-xl " + (i === 0 ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/5")}>
                <div className={"w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg " +
                  (i === 0 ? "bg-amber-500 text-black" : i === 1 ? "bg-slate-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-white/10 text-slate-400")}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">{d.name}</p>
                  <p className="text-slate-500 text-xs uppercase">{d.driver_type} - {d.badge_level}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">{d.total_deliveries} deliveries</p>
                  <p className="text-slate-500 text-xs">{d.karma_points} karma</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-slate-500 text-sm text-center">Run the SQL seed script to populate drivers.</p>}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-16 py-5 bg-emerald-500 text-[#003824] font-bold text-xl rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            Join as Driver / Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}
