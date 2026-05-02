"use client";

import React from "react";
import VideoBackground from "@/components/VideoBackground";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ─────────── animation variants ─────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: d, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (d: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: d },
  }),
};

export default function LandingPage() {
  const [totalMeals, setTotalMeals] = useState(124567);
  const [activePartners, setActivePartners] = useState(842);
  const [carbonOffset, setCarbonOffset] = useState(12.4);

  useEffect(() => {
    const fetchStatsAndCheckAuth = async () => {
      // 1. Check if logged in - if yes, redirect to their respective dashboard
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) {
          switch (profile.role) {
            case 'donor': window.location.href = '/donate'; return;
            case 'ngo': window.location.href = '/receiver'; return;
            case 'driver': window.location.href = '/driver/dashboard'; return;
            case 'valorization_partner': window.location.href = '/partners/dashboard/me'; return;
            case 'admin': window.location.href = '/admin'; return;
          }
        }
      }

      // 2. Aggregate data from listings for public visitors
      const { data: listings } = await supabase.from("listings").select("*");
      if (listings && listings.length > 0) {
        const dbMeals = listings.reduce((s, l) => s + (l.meals || 0), 0);
        const dbKg = listings.reduce((s, l) => s + (l.quantity_kg || 0), 0);
        if (dbMeals > 100) {
          setTotalMeals(dbMeals);
          setCarbonOffset(dbKg * 0.3 / 1000); // Rough estimate in tonnes
        }
      }
      
      // Count unique donors + receivers
      const { count: donorsCount } = await supabase.from("donors").select("*", { count: "exact", head: true });
      const { count: receiversCount } = await supabase.from("receivers").select("*", { count: "exact", head: true });
      
      if (donorsCount || receiversCount) {
        setActivePartners((donorsCount || 0) + (receiversCount || 0) + 840);
      }
    };

    fetchStatsAndCheckAuth();
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <VideoBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
      <div className="bg-[#08090A]/0 text-[#e3e2e3] overflow-x-hidden">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative pt-24 pb-20 px-8 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)]" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Trust badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <span className="font-semibold text-xs tracking-[0.1em] uppercase text-emerald-500">
              Trusted by 500+ Partners
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.15}
            className="text-5xl md:text-[80px] font-bold text-white max-w-4xl mx-auto leading-none mb-6 tracking-[-0.04em]"
          >
            Save Food.{" "}
            <span className="bg-gradient-to-r from-[#4edea3] to-emerald-600 bg-clip-text text-transparent">
              Feed Hope.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="text-lg text-[#bbcabf] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The intelligent logistics backbone connecting restaurant surplus
            with NGOs in real-time. Eliminating waste, one meal at a time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.45}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link href="/donate">
              <button className="px-20 py-6 bg-emerald-500 text-[#003824] font-semibold text-lg rounded-xl primary-glow transition-all active:scale-95 hover:bg-emerald-400">
                Donate Food
              </button>
            </Link>
            <Link href="/receiver">
              <button className="px-20 py-6 glass-surface text-white border border-white/20 font-semibold text-lg rounded-xl hover:bg-white/5 transition-all active:scale-95">
                Receive Food
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ STATS BAR ════════════════════ */}
      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="glass-surface rounded-2xl p-12 flex flex-col md:flex-row justify-center items-center gap-20 border border-emerald-500/20 bg-emerald-950/10"
          >
            {/* Main stat */}
            <div className="text-center">
              <span className="font-semibold text-xs tracking-[0.1em] uppercase text-[#bbcabf] block mb-2">
                Total Impact
              </span>
              <div className="flex items-center gap-2 justify-center">
                <span
                  className="text-5xl font-medium text-white"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    textShadow: "0 0 20px rgba(78,222,163,0.3)",
                  }}
                >
                  {totalMeals.toLocaleString()}
                </span>
                <span className="text-lg font-semibold text-emerald-500">
                  meals saved
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-16 bg-white/10 hidden md:block" />

            {/* Secondary stats */}
            <div className="flex gap-12">
              <div className="text-center">
                <span className="font-semibold text-xs tracking-[0.1em] uppercase text-[#bbcabf] block mb-2">
                  Active Partners
                </span>
                <span
                  className="text-2xl font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {activePartners}+
                </span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-xs tracking-[0.1em] uppercase text-[#bbcabf] block mb-2">
                  Carbon Offset
                </span>
                <span
                  className="text-2xl font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {carbonOffset.toFixed(1)}t
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header + progress bar */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="max-w-xl"
            >
              <h2 className="text-[32px] font-semibold text-white mb-4 tracking-[-0.03em]">
                How It Works
              </h2>
              <p className="text-base text-[#bbcabf] leading-relaxed">
                Three simple steps to bridge the gap between surplus and
                scarcity using our proprietary logistics engine.
              </p>
            </motion.div>
            <div className="h-1 bg-white/5 flex-grow mx-12 mb-4 rounded-full overflow-hidden hidden md:block">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "33%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_#4edea3]"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "1",
                icon: (
                  <svg className="w-9 h-9 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                  </svg>
                ),
                title: "Post",
                desc: "Restaurants and catering partners list surplus inventory in seconds via our mobile-first interface.",
              },
              {
                num: "2",
                icon: (
                  <svg className="w-9 h-9 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
                title: "AI Match",
                desc: "Our Flow-Algorithm identifies the nearest verified NGOs based on urgency and dietary requirements.",
              },
              {
                num: "3",
                icon: (
                  <svg className="w-9 h-9 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.07-.504 1.07-1.125V14.25M8.25 18.75l-.375-3.375M3.375 14.25h-.375m0 0V6.375c0-.621.504-1.125 1.125-1.125h10.5M2.25 14.25h1.5m13.5 0h-1.5m0 0V9.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.449 1.125-1.07 1.125h-1.43m-10.5 0h10.5" />
                  </svg>
                ),
                title: "Deliver",
                desc: "Optimized delivery routes are dispatched to our logistics network for immediate, safe redistribution.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="glass-card p-6 rounded-xl border-l-4 border-l-emerald-500/50 relative group hover:border-l-emerald-500 transition-all duration-300"
              >
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-lg bg-[#1f2021] flex items-center justify-center border border-white/10 text-emerald-500 font-semibold text-lg">
                  {step.num}
                </div>
                <div className="mb-6">{step.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ ZERO WASTE GUARANTEE ════════════════════ */}
      <section className="py-20 px-8 bg-blue-900/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold tracking-widest text-sm uppercase mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-4.22-7.3A1.82 1.82 0 0 0 14.996 8H9.004a1.82 1.82 0 0 0-1.543 1.035L3.24 16.336"/><path d="m14 15.5 3-5 3 5Z"/></svg> 
            Zero Waste Guarantee
          </div>
          <h2 className="text-[32px] md:text-5xl font-semibold text-white mb-6 tracking-[-0.03em] leading-tight">
            Even when food can't feed people,<br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">it powers the planet.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed">
            Our Valorization Engine ensures 100% landfill diversion. Expired surplus is automatically routed through our 4-tier circular ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              { title: "NGO Receivers", desc: "Top priority: Feeding the hungry with perfectly edible surplus.", color: "border-orange-500/30 bg-orange-500/5", iconColor: "text-orange-500" },
              { title: "Biogas Plants", desc: "Converting organic waste into clean, renewable energy.", color: "border-blue-500/30 bg-blue-500/5", iconColor: "text-blue-500" },
              { title: "Cattle Feed", desc: "Providing nutrition for dairy farms and local goshalas.", color: "border-purple-500/30 bg-purple-500/5", iconColor: "text-purple-500" },
              { title: "Compost Units", desc: "Creating nutrient-rich fertilizer for local farmers.", color: "border-teal-500/30 bg-teal-500/5", iconColor: "text-teal-500" },
            ].map((tier, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${tier.color} backdrop-blur-sm hover:-translate-y-1 transition-transform`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4 ${tier.iconColor} bg-black/40`}>
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                <p className="text-sm text-slate-400">{tier.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ PROBLEM STATS ════════════════════ */}
      <section id="about" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-20 skew-y-3" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Image */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-2xl group"
            >
              <Image
                src="/community-impact.png"
                alt="Community volunteers distributing meals"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            {/* Stats content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.2}
            >
              <span className="font-semibold text-xs tracking-[0.2em] uppercase text-emerald-500 mb-4 block">
                The Global Crisis
              </span>
              <h2 className="text-[32px] font-semibold text-white mb-12 tracking-[-0.03em] leading-tight">
                We are fighting two battles at once.
              </h2>

              <div className="space-y-12">
                {/* Stat 1 */}
                <div className="flex items-start gap-6">
                  <div className="pt-1 shrink-0">
                    <span
                      className="text-[40px] leading-none text-[#c3d000]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      67M
                    </span>
                    <span className="font-semibold text-[10px] tracking-[0.1em] uppercase text-[#bbcabf] block">
                      Tonnes wasted annually
                    </span>
                  </div>
                  <p className="text-base text-[#bbcabf] leading-relaxed">
                    Perfectly edible food ends up in landfills, contributing to
                    methane emissions and massive economic loss for businesses.
                  </p>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* Stat 2 */}
                <div className="flex items-start gap-6">
                  <div className="pt-1 shrink-0">
                    <span
                      className="text-[40px] leading-none text-red-400"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      190M
                    </span>
                    <span className="font-semibold text-[10px] tracking-[0.1em] uppercase text-[#bbcabf] block">
                      Hungry across the region
                    </span>
                  </div>
                  <p className="text-base text-[#bbcabf] leading-relaxed">
                    A significant portion of our population faces daily food
                    insecurity, even as surplus food is discarded nearby.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTIMONIALS ════════════════════ */}
      <section className="py-20 px-8 bg-[#0d0e0f]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-20"
          >
            <h2 className="text-[32px] font-semibold text-white mb-4 tracking-[-0.03em]">
              Voices of Impact
            </h2>
            <p className="text-base text-[#bbcabf]">
              Trusted by global logistics leaders and local community heroes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  '"FoodFlow has completely transformed our operational efficiency. We used to spend hours on phone calls; now it\'s all automated. We\'ve seen a 40% increase in food intake."',
                name: "Sarah Jenkins",
                role: "Director, Urban Harvest NGO",
                initial: "S",
              },
              {
                quote:
                  '"The transparency and real-time tracking give our restaurant partners the tax documentation they need while ensuring every gram of food is accounted for."',
                name: "Marcus Chen",
                role: "COO, Global Logistics Alliance",
                initial: "M",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="glass-card p-12 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Quote icon */}
                  <svg className="w-10 h-10 text-emerald-500 mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                  <p className="text-lg italic text-white mb-12 leading-relaxed">
                    {t.quote}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-semibold text-lg text-emerald-500">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {t.name}
                    </p>
                    <p className="text-sm text-[#bbcabf]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
      </div>
    </div>
  );
}
