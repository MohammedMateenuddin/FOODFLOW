"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Sparkles, ArrowRight, Building2, BarChart3, Download } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d } }),
};

const PLANS = [
  {
    name: "Basic", price: 299, popular: false,
    features: ["Monthly PDF report", "Basic impact stats", "Email delivery", "Certificate ID"],
    cta: "Get Started", ctaStyle: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
  },
  {
    name: "Professional", price: 999, popular: true,
    features: ["PDF + Live Dashboard", "CSR audit letter", "Email support", "Detailed breakdown", "Daily donation chart"],
    cta: "Get Started", ctaStyle: "bg-emerald-500 text-[#003824] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  },
  {
    name: "Enterprise", price: 4999, popular: false,
    features: ["Custom branding", "UN SDG badges", "Dedicated account manager", "Quarterly strategy call", "API access"],
    cta: "Contact Sales", ctaStyle: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
  },
];

export default function CSRPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("csr_subscriptions").select("company_name").then(({ data }) => {
      if (data) setSubs(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* HERO */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6">
            <FileText className="w-3.5 h-3.5" /> CSR Compliance
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-5 leading-[1.1]">
            Turn Mandatory CSR Spend Into <span className="text-emerald-500">Measurable Impact</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Get a judge-ready PDF certificate every month. Auto-generated. Auditor-approved. Companies Act 2013 compliant.
          </p>
          <Link href="/csr/dashboard/demo"
            className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 text-[#003824] font-bold text-lg rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            Get Your First Report Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* LAW BANNER */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-amber-300 text-sm leading-relaxed">
            <strong>{"\uD83D\uDCCB"} Under Companies Act 2013:</strong> Companies with {"\u20B9"}5Cr+ net profit must spend 2% on CSR yearly.
            FoodFlow generates the documentation you need — auto-calculated impact metrics, audit-ready certificates, and UN SDG alignment.
          </p>
        </motion.div>

        {/* PRICING CARDS */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}
                className={"glass-panel p-8 rounded-2xl border relative " +
                  (plan.popular ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-white/10")}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-[#003824] text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>{"\u20B9"}{plan.price}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={"w-full py-3 rounded-xl font-bold transition-all " + plan.ctaStyle}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TRUST LOGOS */}
        <div className="text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8">
            {(subs.length > 0 ? subs.map(s => s.company_name) : ["TCS", "Reliance", "HDFC", "Infosys"]).map((name, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> {name}
              </motion.div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", emoji: "\uD83D\uDCDD", title: "Donate Through FoodFlow", desc: "Your company restaurants donate surplus food through our platform." },
              { step: "2", emoji: "\uD83E\uDD16", title: "AI Calculates Impact", desc: "Meals served, CO\u2082 avoided, families fed \u2014 all auto-tracked in real-time." },
              { step: "3", emoji: "\uD83D\uDCC4", title: "Download Certified PDF", desc: "Professional audit-ready report delivered on the 1st of every month." },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}
                className="glass-panel p-8 rounded-2xl border border-white/5 text-center">
                <div className="text-4xl mb-4">{s.emoji}</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h4 className="text-white font-bold text-lg mb-2">{s.title}</h4>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Does this count for Companies Act 2013?", a: "Yes \u2014 our certificates include all legally required impact metrics including meals served, CO\u2082 avoided, and beneficiary counts." },
              { q: "What if we don't have restaurants?", a: "We can link any partner restaurants to your CSR account. Your impact gets credited automatically." },
              { q: "How is CO\u2082 calculated?", a: "We use the UNEP standard: 2.5 kg CO\u2082 per kg of food waste diverted from landfill." },
            ].map((faq, i) => (
              <div key={i} className="glass-panel p-6 rounded-xl border border-white/5">
                <p className="text-white font-bold mb-2">{faq.q}</p>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
