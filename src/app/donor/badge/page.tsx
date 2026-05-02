"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Star, Crown, Download, Check, Smartphone, ArrowRight, Utensils, Heart, Leaf, Award, Sparkles } from "lucide-react";
import VerifiedBadge, { BadgeTier } from "@/components/VerifiedBadge";

const tiers: { id: BadgeTier; icon: typeof Shield; label: string; color: string; requirement: string; features: string[] }[] = [
  {
    id: "verified", icon: Shield, label: "Verified Donor", color: "#10b981", requirement: "100+ kg Donated",
    features: ["Digital badge for website", "Social media kit (IG, FB, WhatsApp)", "FoodFlow map listing", "Monthly impact certificate"],
  },
  {
    id: "premium", icon: Star, label: "Premium Donor", color: "#f97316", requirement: "500+ kg Donated",
    features: ["Everything in Verified", "Physical holographic sticker", "Priority map listing", "Quarterly press mention", "Customer trust analytics"],
  },
  {
    id: "flagship", icon: Crown, label: "Flagship Hero", color: "#6366f1", requirement: "2,000+ kg Donated",
    features: ["Everything in Premium", "Homepage feature spotlight", "PR & media mention", "Monthly impact report", "Dedicated account manager", "Zomato/Swiggy badge"],
  },
];

export default function BadgeLandingPage() {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<BadgeTier>("flagship");
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleDownload = async (size: "web" | "social" | "print") => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = previewRef.current?.querySelector(".verified-badge-container") as HTMLElement;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: null, scale: size === "print" ? 4 : size === "social" ? 3 : 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `foodflow-${tier}-badge-${(name || "restaurant").replace(/\s+/g, "-").toLowerCase()}-${size}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  const selectedTier = tiers.find(t => t.id === tier) || tiers[2];

  return (
    <div className="bg-[#08090A] text-[#e3e2e3] min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Donor Recognition Program</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Show Guests You&apos;re <br />
              <span className="gradient-text">A Zero-Waste Hotel</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The FoodFlow Donor Badge tells your guests:{" "}
              <span className="text-white font-medium">We donate our surplus food to those in need. Every meal we serve is fresh, and every surplus is saved.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ LIVE PREVIEW GENERATOR ═══ */}
      <section className="relative py-20 border-t border-white/5" id="preview-generator">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Live Preview Generator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Design Your Badge in Real-Time</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Type your restaurant name and watch your badge come alive instantly.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Controls */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Taj Hotel, Mumbai"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-lg"
                  id="badge-restaurant-name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Select Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {tiers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 ${
                        tier === t.id
                          ? "border-white/20 bg-white/10 shadow-lg"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                      }`}
                      style={tier === t.id ? { boxShadow: `0 0 30px ${t.color}20` } : {}}
                      id={`badge-tier-${t.id}`}
                    >
                      <t.icon className="w-6 h-6 mx-auto mb-2" style={{ color: t.color }} />
                      <span className="text-sm font-bold text-white block">{t.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 uppercase tracking-tighter">{t.requirement}</span>
                      {tier === t.id && (
                        <motion.div layoutId="tier-ring" className="absolute inset-0 rounded-xl border-2" style={{ borderColor: t.color }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download buttons */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Download Badge</label>
                <div className="flex gap-3">
                  {(["web", "social", "print"] as const).map(sz => (
                    <button
                      key={sz}
                      onClick={() => handleDownload(sz)}
                      disabled={downloading}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      id={`badge-download-${sz}`}
                    >
                      <Download className="w-4 h-4" />
                      {sz === "web" ? "Web (400px)" : sz === "social" ? "Social (800px)" : "Print (1200px)"}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Live Badge Preview */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col items-center" ref={previewRef}>
              <div className="relative">
                <div className="absolute -inset-8 rounded-3xl" style={{ background: `radial-gradient(circle, ${selectedTier.color}10, transparent 70%)` }} />
                <div className="relative">
                  <VerifiedBadge tier={tier} name={name || "Your Restaurant Name"} size="web" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-6 text-center">Live preview • Badge updates as you type</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING TABLE ═══ */}
      <section className="py-24 border-t border-white/5" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Earn Your Donation Milestones</h2>
            <p className="text-slate-400 max-w-md mx-auto">Badges are unlocked automatically based on your total donation volume. No subscription required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 border transition-all ${
                  t.id === "flagship"
                    ? "bg-white/[0.06] border-indigo-500/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
                style={t.id === "flagship" ? { boxShadow: `0 0 60px ${t.color}10` } : {}}
              >
                {t.id === "flagship" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-xs font-bold text-white tracking-wider uppercase">
                    Highest Honor
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${t.color}15`, border: `1px solid ${t.color}33` }}>
                    <t.icon className="w-6 h-6" style={{ color: t.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.label}</h3>
                    <span className="text-sm text-slate-400">Status Level</span>
                  </div>
                </div>
                <div className="mb-8">
                  <span className="text-3xl font-bold text-white">{t.requirement}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: t.color }} />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setTier(t.id);
                    document.getElementById('preview-generator')?.scrollIntoView({ behavior: 'smooth' });
                    import('sonner').then((m) => m.toast.success(`Milestone: ${t.label} selected for preview!`));
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: t.id === "flagship" ? t.color : "transparent",
                    color: t.id === "flagship" ? "white" : t.color,
                    border: `1.5px solid ${t.color}${t.id === "flagship" ? "" : "55"}`,
                  }}
                  id={`pricing-cta-${t.id}`}
                >
                  View Requirements
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY IT MATTERS ═══ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Why It Matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Utensils, title: "Your Kitchen", desc: "Your kitchen generates surplus food daily. Today, it might go to waste — or worse, get reused.", color: "#f97316" },
              { icon: Heart, title: "With FoodFlow", desc: "Your surplus feeds families instead of landfills. Every meal counts, and you get certified proof.", color: "#10b981" },
              { icon: Leaf, title: "Your Impact", desc: "Reduce CO₂ emissions, build customer trust, and join India's largest food rescue network.", color: "#6366f1" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${item.color}15`, border: `1px solid ${item.color}33` }}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Zomato/Swiggy integration */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-center">
            <Smartphone className="w-10 h-10 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon: Zomato & Swiggy Integration</h3>
            <p className="text-slate-400 max-w-lg mx-auto">
              Your FoodFlow badge will auto-display on your Zomato & Swiggy listing — letting every customer know you&apos;re a verified zero-waste partner.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Earn Your Badge?</h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto">Join hundreds of restaurants already making a difference. Your first month is on us.</p>
          <a href="#preview-generator" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-[#00422b] rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all">
            Create Your Badge Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
