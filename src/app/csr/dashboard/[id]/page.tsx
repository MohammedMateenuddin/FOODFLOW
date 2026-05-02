"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Award, Globe, BarChart3, Building2 } from "lucide-react";
import { toast } from "sonner";

// Animated counter hook
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// Demo data
const DEMO = {
  company: "Tata Consultancy Services",
  plan: "enterprise",
  meals: 2847,
  kgRescued: 1138,
  co2: 2845,
  families: 940,
  deliveries: 156,
  dailyData: [42, 38, 55, 61, 48, 39, 72, 58, 44, 50, 67, 53, 41, 60, 75, 49, 36, 58, 63, 47, 52, 69, 45, 57, 71, 40, 54, 62, 48, 56],
};

const SDG_GOALS = [
  { num: 2, title: "Zero Hunger", color: "#DDA63A", desc: "Direct food rescue to vulnerable families" },
  { num: 12, title: "Responsible Consumption", color: "#BF8B2E", desc: "Reducing food waste from commercial kitchens" },
  { num: 13, title: "Climate Action", color: "#3F7E44", desc: "CO\u2082 reduction through waste diversion" },
];

export default function CSRDashboard() {
  const meals = useCountUp(DEMO.meals);
  const kg = useCountUp(DEMO.kgRescued);
  const co2 = useCountUp(DEMO.co2);
  const families = useCountUp(DEMO.families);

  const maxDaily = Math.max(...DEMO.dailyData);

  const handleDownloadPDF = async () => {
    toast.loading("Generating PDF report...", { id: "pdf" });
    try {
      const res = await fetch("/api/generate-csr-report", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: DEMO.company, ...DEMO }) });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "FoodFlow_CSR_Report_May2025.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("PDF generation failed. Ensure @react-pdf/renderer is installed.", { id: "pdf" });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{DEMO.company} <span className="text-slate-500">{"\u00D7"} FoodFlow</span></h1>
              <p className="text-slate-400 text-sm">May 2025 Impact Report</p>
            </div>
          </div>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-[#003824] font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Download className="w-5 h-5" /> Download PDF Report
          </button>
        </motion.div>

        {/* 4 Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "\uD83C\uDF7D\uFE0F", value: meals, label: "Meals Served", color: "text-emerald-400" },
            { emoji: "\uD83D\uDCE6", value: kg, label: "kg Rescued", color: "text-blue-400" },
            { emoji: "\uD83C\uDF0D", value: co2, label: "kg CO\u2082 Avoided", color: "text-amber-400" },
            { emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", value: families, label: "Families Fed", color: "text-purple-400" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
              <span className="text-3xl block mb-2">{s.emoji}</span>
              <p className={"text-3xl font-bold " + s.color} style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {s.value.toLocaleString()}
              </p>
              <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Daily Donations Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-400" /> Daily Donations — May 2025</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {DEMO.dailyData.map((val, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: (val / maxDaily) * 100 + "%" }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 relative group cursor-pointer hover:from-emerald-500 hover:to-emerald-400">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {val} kg
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>May 1</span><span>May 15</span><span>May 30</span>
          </div>
        </motion.div>

        {/* UN SDG Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-blue-400" /> UN Sustainable Development Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SDG_GOALS.map((g, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10" style={{ backgroundColor: g.color }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg mb-3" style={{ backgroundColor: g.color }}>
                  {g.num}
                </div>
                <p className="text-white font-bold text-sm mb-1">{g.title}</p>
                <p className="text-slate-400 text-xs">{g.desc}</p>
                <div className="mt-3 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">FoodFlow Certified</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Certification Statement */}
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <p className="text-white text-sm leading-relaxed max-w-2xl mx-auto">
            This certifies that <strong>{DEMO.company}</strong> has contributed to food rescue operations through FoodFlow
            during the period of <strong>May 1-31, 2025</strong>, resulting in <strong>{DEMO.meals.toLocaleString()} meals served</strong> and{" "}
            <strong>{DEMO.co2.toLocaleString()} kg CO{"\u2082"} avoided</strong>.
          </p>
          <p className="text-emerald-400 text-xs mt-4 font-mono">Certificate ID: FF-CSR-2025-05-TCS-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
