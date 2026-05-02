"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Battery, Wheat, Factory, CheckCircle2,  Sparkles, Send } from "lucide-react";

export default function PartnerValorizationPage() {
  const [formState, setFormState] = useState({
    type: "biogas",
    location: "",
    capacity: "",
    foodTypes: "",
    contact: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (d: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: d, ease: "easeOut" },
    }),
  };

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3]">
      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Valorization Partner Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Get Guaranteed, Pre-Sorted <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Organic Input. Daily.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Stop sourcing organic waste manually. FoodFlow delivers sorted, food-type-categorized organic material directly to your facility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═══ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Battery, title: "Biogas Plants", desc: "Receive high-calorie organic input sorted by type. Maximize kWh output. Earn carbon credits.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { icon: Factory, title: "Cattle Centers", desc: "Receive safe, animal-appropriate feed daily. Never cattle-unsafe items (meat/dairy/spices) — AI filtered.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { icon: Wheat, title: "Farmers", desc: "Fresh organic compost material delivered. Know exactly what's coming and when.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
            ].map((prop, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1 + 0.2} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${prop.bg} ${prop.border} border`}>
                  <prop.icon className={`w-7 h-7 ${prop.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{prop.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING TIERS ═══ */}
      <section className="py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Intake Plan</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Scale your organic input seamlessly. Only pay for what you receive.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "₹0", sub: "/mo", tip: "+ ₹2.5/kg tipping fee", features: ["Basic organic intake", "Manual coordination", "Standard delivery SLA"], color: "text-slate-300", glow: "" },
              { name: "Basic", price: "₹5,000", sub: "/mo", tip: "+ ₹1.5/kg tipping fee", features: ["Partner Dashboard", "Daily intake forecast", "Priority routing"], color: "text-indigo-400", glow: "border-indigo-500/30 bg-indigo-500/[0.02]" },
              { name: "Premium", price: "₹15,000", sub: "/mo", tip: "+ ₹1.0/kg tipping fee", features: ["Guaranteed min. daily supply", "Carbon credit reports", "API access for integration", "Dedicated account manager"], color: "text-blue-400", glow: "border-blue-500/40 bg-blue-500/[0.05] shadow-[0_0_30px_rgba(59,130,246,0.1)]", popular: true }
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.15} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${tier.glow || "border-white/10 bg-white/[0.02]"}`}>
                {tier.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Most Popular</div>}
                <h3 className={`text-xl font-bold mb-4 ${tier.color}`}>{tier.name}</h3>
                <div className="flex items-baseline mb-1">
                  <span className="text-4xl font-bold text-white tracking-tight">{tier.price}</span>
                  <span className="text-slate-400 ml-1">{tier.sub}</span>
                </div>
                <div className="text-sm font-medium text-emerald-400 mb-6">{tier.tip}</div>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${tier.popular ? "bg-blue-500 text-white hover:bg-blue-400" : "bg-white/5 text-white hover:bg-white/10"}`}>
                  Select {tier.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTRATION FORM ═══ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
             
             {!submitted ? (
               <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-white mb-2">Partner Application</h2>
                  <p className="text-slate-400 mb-8 text-sm">Join the zero-waste network. Tell us about your facility.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Facility Type</label>
                        <select value={formState.type} onChange={(e) => setFormState({...formState, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500">
                          <option value="biogas">Biogas Plant</option>
                          <option value="cattle">Cattle Feed Center</option>
                          <option value="farmer">Agricultural Farm</option>
                          <option value="compost">Composting Unit</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location / Zone</label>
                        <input type="text" placeholder="e.g. North Mumbai" required value={formState.location} onChange={(e) => setFormState({...formState, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Intake Capacity (kg/day)</label>
                        <input type="number" placeholder="e.g. 500" required value={formState.capacity} onChange={(e) => setFormState({...formState, capacity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Number</label>
                        <input type="tel" placeholder="+91" required value={formState.contact} onChange={(e) => setFormState({...formState, contact: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Food Types Accepted (Optional)</label>
                      <input type="text" placeholder="e.g. Raw veggies only, No dairy" value={formState.foodTypes} onChange={(e) => setFormState({...formState, foodTypes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                    </div>

                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                      Submit Application <Send className="w-4 h-4" />
                    </button>
                  </form>
               </motion.div>
             ) : (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-4">Welcome to FoodFlow!</h2>
                 <p className="text-slate-400 max-w-sm mx-auto">Your application is received. An account manager will contact you. Your first delivery will arrive within 48 hours.</p>
               </motion.div>
             )}
          </div>
        </div>
      </section>
    </div>
  );
}
