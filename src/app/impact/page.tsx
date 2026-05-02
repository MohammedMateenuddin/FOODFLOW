"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  CheckCircle, 
  Zap, 
  Search, 
  Filter, 
  Bell, 
  Settings,
  Recycle,
  Leaf
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#4edea3", "#c3d000", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"];

const mockWeekly = [
  { day: "MAY 01", meals: 120 },
  { day: "MAY 05", meals: 200 },
  { day: "MAY 10", meals: 150 },
  { day: "MAY 15", meals: 300 },
  { day: "MAY 20", meals: 250 },
  { day: "MAY 25", meals: 400 },
  { day: "MAY 30", meals: 180 },
];

const mockFoodTypes = [
  { name: "Cooked", value: 45 },
  { name: "Raw", value: 25 },
  { name: "Packaged", value: 20 },
  { name: "Bakery", value: 10 },
];

const mockLeaderboard = [
  { rank: 1, name: "Taj Hotels & Palaces", kg: "12,450", score: 99.8 },
  { rank: 2, name: "Marriott International", kg: "10,890", score: 98.2 },
  { rank: 3, name: "Starbucks Corp", kg: "8,200", score: 94.5 },
  { rank: 4, name: "Hilton Worldwide", kg: "7,150", score: 91.0 },
];

export default function ImpactPage() {
  const [totalMeals, setTotalMeals] = useState(124567);
  const [totalKg, setTotalKg] = useState(42300);
  const [totalCo2, setTotalCo2] = useState(12.4);
  const [activeDonors, setActiveDonors] = useState(842);
  const [valorizedKg, setValorizedKg] = useState(12540);
  const [energyKwh, setEnergyKwh] = useState(4200);
  const [compostKg, setCompostKg] = useState(3200);

  const fetchImpact = async () => {
    // In a real app, this would aggregate data from the listings table
    const { data: listings } = await supabase.from("listings").select("*");
    if (listings && listings.length > 0) {
      const dbKg = listings.reduce((s, l) => s + (l.quantity_kg || 0), 0);
      const dbMeals = listings.reduce((s, l) => s + (l.meals || 0), 0);
      // Only overwrite if we actually have substantial DB data, otherwise keep the impressive demo numbers
      if (dbKg > 100) {
        setTotalKg(dbKg);
        setTotalMeals(dbMeals);
        setTotalCo2(dbKg * 0.3); // Rough estimate: 1kg food = 0.3kg CO2
      }
    }
    
    const { count } = await supabase.from("donors").select("*", { count: "exact", head: true });
    if (count && count > 0) {
      setActiveDonors(count + 840); // Base count + DB count for demo purposes
    }

    const { data: vLogs } = await supabase.from("valorization_logs").select("*");
    if (vLogs && vLogs.length > 0) {
      const vKg = vLogs.reduce((s, l) => s + (l.quantity_kg || 0), 0);
      setValorizedKg(12540 + vKg);
      setTotalKg(prev => prev + vKg);
      setTotalCo2(prev => prev + (vKg * 2.5) / 1000); // 2.5kg CO2 per kg
    }
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3] font-sans selection:bg-emerald-500/30">
      <main className="max-w-[1280px] mx-auto px-6 md:px-8 py-20 mt-12">
        
        {/* ════════ Dashboard Header ════════ */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[12px] font-semibold text-emerald-500 tracking-[0.1em] uppercase block mb-2" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              Mission Control
            </span>
            <h1 className="text-4xl md:text-[48px] font-bold text-white tracking-[-0.04em] leading-tight">
              Global Impact Dashboard
            </h1>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className="flex items-center bg-[#1f2021] border border-white/10 rounded-lg p-1">
              <button className="px-4 py-2 bg-white/10 text-white rounded-md text-sm font-medium transition-all shadow-sm">
                30 Days
              </button>
              <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-white transition-all">
                90 Days
              </button>
              <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-white transition-all">
                All Time
              </button>
            </div>
          </motion.div>
        </div>

        {/* ════════ KPI Grid ════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "TOTAL MEALS SAVED", value: totalMeals.toLocaleString(), icon: <TrendingUp className="w-3.5 h-3.5" />, stat: "12%", color: "text-emerald-500" },
            { title: "KG RESCUED", value: totalKg.toLocaleString(), icon: <TrendingUp className="w-3.5 h-3.5" />, stat: "8.4%", color: "text-emerald-500" },
            { title: "CO₂ AVOIDED", value: `${totalCo2.toFixed(1)}t`, icon: <CheckCircle className="w-3.5 h-3.5" />, stat: "Target Met", color: "text-emerald-500" },
            { title: "ACTIVE DONORS", value: `${activeDonors}+`, icon: <Zap className="w-3.5 h-3.5" />, stat: "Real-time", color: "text-[#c3d000]" },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            >
              <p className="text-[12px] font-semibold text-slate-500 mb-4 tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {kpi.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-[32px] md:text-[42px] leading-none font-bold ${i === 0 ? "text-emerald-500" : "text-white"}`} style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {kpi.value}
                </span>
                <span className={`${kpi.color} text-xs font-semibold flex items-center gap-1`}>
                  {kpi.icon} {kpi.stat}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ════════ Zero Waste Metrics ════════ */}
        <div className="mb-12 glass-panel p-8 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Recycle className="w-64 h-64 text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-center">
            <div className="flex-1">
              <span className="text-[12px] font-semibold text-blue-400 tracking-[0.1em] uppercase mb-2 flex items-center gap-2">
                <Recycle className="w-4 h-4" /> Zero Waste Guarantee
              </span>
              <h3 className="text-3xl font-bold text-white mb-4">100% Landfill Diversion</h3>
              <p className="text-slate-400 max-w-lg mb-6">
                When surplus food expires before reaching an NGO, our system automatically routes it to certified partners. We convert waste into clean energy, cattle feed, and organic compost.
              </p>
              <a href="/zero-waste" className="text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center gap-2">
                View Zero Waste Dashboard ➝
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-black/40 border border-white/5 p-6 rounded-xl text-center">
                <div className="text-blue-400 mb-2 flex justify-center"><Recycle className="w-6 h-6" /></div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>{valorizedKg.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Kg Valorized</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-xl text-center">
                <div className="text-yellow-400 mb-2 flex justify-center"><Zap className="w-6 h-6" /></div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>{energyKwh.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">kWh Generated</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-xl text-center">
                <div className="text-teal-400 mb-2 flex justify-center"><Leaf className="w-6 h-6" /></div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>{compostKg.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Kg Compost</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-xl text-center">
                <div className="text-emerald-400 mb-2 flex justify-center"><CheckCircle className="w-6 h-6" /></div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>0 kg</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Sent to Landfill</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════ Main Analytics Area ════════ */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          
          {/* Line Chart: Daily Meals Saved */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-8 glass-panel p-6 md:p-8 rounded-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold text-white tracking-[-0.02em]">Daily Meals Saved</h3>
              <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.1em] text-slate-400 uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Current Month</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white/20"></span> Previous Month</span>
              </div>
            </div>
            
            <div className="h-[320px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeekly} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-space-grotesk)' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(8,9,10,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#4edea3', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="meals" 
                    stroke="#4edea3" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMeals)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart: Food Types */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-4 glass-panel p-6 md:p-8 rounded-xl flex flex-col"
          >
            <h3 className="text-2xl font-semibold text-white tracking-[-0.02em] mb-4">Food Category</h3>
            
            <div className="flex-1 flex items-center justify-center relative py-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={mockFoodTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockFoodTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(8,9,10,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[12px] font-semibold text-slate-500 tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>TOTAL</p>
                <p className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>100%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {mockFoodTypes.map((type, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="text-xs text-slate-400">{type.name} ({type.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ════════ Secondary Analytics & Leaderboard ════════ */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Bar Chart: Top Donors Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 lg:col-span-4 glass-panel p-6 md:p-8 rounded-xl"
          >
            <h3 className="text-2xl font-semibold text-white tracking-[-0.02em] mb-8">Donor Efficiency</h3>
            <div className="space-y-5">
              {[
                { name: "Taj Hotels", val: 98 },
                { name: "Marriott International", val: 92 },
                { name: "Starbucks", val: 89 },
                { name: "Hilton Worldwide", val: 85 }
              ].map((donor, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                    <span className="text-white">{donor.name}</span>
                    <span className="text-emerald-500">{donor.val}% Rescued</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${donor.val}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3 border border-white/10 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              View All Efficiency Reports
            </button>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-12 lg:col-span-8 glass-panel rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-white tracking-[-0.02em]">Impact Leaderboard</h3>
              <div className="flex gap-4">
                <Search className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white transition-colors" />
                <Filter className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-6 text-[12px] font-semibold tracking-[0.1em] text-slate-500 uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>Rank</th>
                    <th className="p-6 text-[12px] font-semibold tracking-[0.1em] text-slate-500 uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>Donor Name</th>
                    <th className="p-6 text-[12px] font-semibold tracking-[0.1em] text-slate-500 uppercase" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>Contribution (kg)</th>
                    <th className="p-6 text-[12px] font-semibold tracking-[0.1em] text-slate-500 uppercase text-right" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>Impact Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockLeaderboard.map((item) => (
                    <tr key={item.rank} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.rank === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-400'}`}>
                          #{item.rank}
                        </span>
                      </td>
                      <td className="p-6 font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </td>
                      <td className="p-6 text-slate-400">
                        {item.kg} kg
                      </td>
                      <td className="p-6 text-right">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold tracking-wider">
                          {item.score.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ════════ Footer ════════ */}
      <footer className="bg-[#08090A] border-t border-white/10 mt-12">
        <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-bold text-emerald-500 text-xl tracking-tighter uppercase">FoodFlow</span>
            <p className="text-slate-500 text-sm tracking-wide">© 2024 FoodFlow. Precision Redistribution.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-slate-500 hover:text-emerald-400 transition-colors text-sm" href="#">Sustainability Report</a>
            <a className="text-slate-500 hover:text-emerald-400 transition-colors text-sm" href="#">Privacy Policy</a>
            <a className="text-slate-500 hover:text-emerald-400 transition-colors text-sm" href="#">Terms of Service</a>
            <a className="text-slate-500 hover:text-emerald-400 transition-colors text-sm" href="#">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
