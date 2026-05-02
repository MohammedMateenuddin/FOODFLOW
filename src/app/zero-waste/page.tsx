"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Recycle, 
  Zap, 
  Wheat, 
  Leaf, 
  Activity, 
  TrendingDown, 
  CloudRain,
  MapPin
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "@/lib/supabase";
import { ValorizationLog, ValorizationPartner } from "@/lib/types";

const COLORS = ['#3b82f6', '#a855f7', '#84cc16', '#14b8a6'];

export default function ZeroWastePage() {
  const [logs, setLogs] = useState<ValorizationLog[]>([]);
  const [partners, setPartners] = useState<ValorizationPartner[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [pData, lData] = await Promise.all([
        supabase.from("valorization_partners").select("*"),
        supabase.from("valorization_logs").select("*, partner:valorization_partners(*)")
      ]);
      if (pData.data) setPartners(pData.data);
      if (lData.data) setLogs(lData.data);
    };

    fetchStats();

    const channel = supabase
      .channel('zero_waste_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'valorization_logs' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalDiverted = logs.reduce((sum, log) => sum + log.quantity_kg, 0) + 12540;
  const totalCo2 = logs.reduce((sum, log) => sum + log.co2_avoided, 0) + 31350;

  const energyKwh = logs.filter(l => l.partner_type === 'biogas').reduce((sum, l) => sum + (l.quantity_kg * 0.5), 0) + 4200;
  const cattleFeed = logs.filter(l => l.partner_type === 'cattle_feed').reduce((sum, l) => sum + (l.quantity_kg * 0.9), 0) + 8500;
  const compostKg = logs.filter(l => l.partner_type === 'compost' || l.partner_type === 'farmer').reduce((sum, l) => sum + (l.quantity_kg * 0.4), 0) + 3200;

  const pieData = [
    { name: 'Biogas', value: logs.filter(l => l.partner_type === 'biogas').reduce((sum, l) => sum + l.quantity_kg, 0) + 5000 },
    { name: 'Cattle Feed', value: logs.filter(l => l.partner_type === 'cattle_feed').reduce((sum, l) => sum + l.quantity_kg, 0) + 4000 },
    { name: 'Farmers', value: logs.filter(l => l.partner_type === 'farmer').reduce((sum, l) => sum + l.quantity_kg, 0) + 2000 },
    { name: 'Compost', value: logs.filter(l => l.partner_type === 'compost').reduce((sum, l) => sum + l.quantity_kg, 0) + 1540 },
  ];

  const barData = [
    { name: 'Mon', kg: 420 },
    { name: 'Tue', kg: 380 },
    { name: 'Wed', kg: 510 },
    { name: 'Thu', kg: 490 },
    { name: 'Fri', kg: 600 },
    { name: 'Sat', kg: 850 },
    { name: 'Sun', kg: Math.round(logs.reduce((sum, l) => sum + l.quantity_kg, 0) + 400) },
  ];

  const statsData = [
    { label: "Food Diverted", value: totalDiverted.toLocaleString() + " kg", icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Clean Energy", value: energyKwh.toLocaleString() + " kWh", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Cattle Feed", value: cattleFeed.toLocaleString() + " kg", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Organic Compost", value: compostKg.toLocaleString() + " kg", icon: Leaf, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          <div className="flex-1 space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold tracking-widest text-sm uppercase"
            >
              <Recycle className="w-4 h-4" /> The Circular Economy
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
            >
              <span className="text-emerald-500 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">0 kg</span> sent to landfill.
            </motion.h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
              When food expires before it can be eaten, our AI Valorization Engine automatically routes it to alternative partners based on proximity and capacity. Nothing is wasted.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-md relative flex items-center justify-center">
             <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
             <svg viewBox="0 0 400 400" className="w-full h-auto animate-[spin_20s_linear_infinite] relative z-10">
                {/* Outer Dashed Circle */}
                <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" strokeDasharray="8 8" />
                
                {/* Node 1: Surplus Food */}
                <g transform="translate(200, 40)">
                   <circle cx="0" cy="0" r="30" fill="#111" stroke="#10b981" strokeWidth="2" />
                   <path d="M-10 0 L10 0 M0 -10 L0 10" stroke="#10b981" strokeWidth="2" />
                   <text x="0" y="50" fill="#a8b2d1" fontSize="12" textAnchor="middle" fontWeight="bold">SURPLUS</text>
                </g>

                {/* Node 2: Biogas */}
                <g transform="translate(360, 200)">
                   <circle cx="0" cy="0" r="30" fill="#111" stroke="#3b82f6" strokeWidth="2" />
                   <path d="M-10 -5 L10 -5 M-5 5 L5 5" stroke="#3b82f6" strokeWidth="2" />
                   <text x="45" y="5" fill="#a8b2d1" fontSize="12" textAnchor="start" fontWeight="bold">BIOGAS</text>
                </g>

                {/* Node 3: Compost */}
                <g transform="translate(200, 360)">
                   <circle cx="0" cy="0" r="30" fill="#111" stroke="#84cc16" strokeWidth="2" />
                   <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke="#84cc16" strokeWidth="2" />
                   <text x="0" y="-45" fill="#a8b2d1" fontSize="12" textAnchor="middle" fontWeight="bold">COMPOST</text>
                </g>

                {/* Node 4: Cattle Feed */}
                <g transform="translate(40, 200)">
                   <circle cx="0" cy="0" r="30" fill="#111" stroke="#a855f7" strokeWidth="2" />
                   <circle cx="0" cy="0" r="10" fill="none" stroke="#a855f7" strokeWidth="2" />
                   <text x="-45" y="5" fill="#a8b2d1" fontSize="12" textAnchor="end" fontWeight="bold">CATTLE</text>
                </g>
                
                {/* Inner Connecting Arrows */}
                <path d="M 200 70 A 130 130 0 0 1 330 200" fill="none" stroke="url(#grad1)" strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                <path d="M 330 200 A 130 130 0 0 1 200 330" fill="none" stroke="url(#grad2)" strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                <path d="M 200 330 A 130 130 0 0 1 70 200" fill="none" stroke="url(#grad3)" strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                <path d="M 70 200 A 130 130 0 0 1 200 70" fill="none" stroke="url(#grad4)" strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                
                <defs>
                   <linearGradient id="grad1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
                   <linearGradient id="grad2"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#84cc16"/></linearGradient>
                   <linearGradient id="grad3"><stop offset="0%" stopColor="#84cc16"/><stop offset="100%" stopColor="#a855f7"/></linearGradient>
                   <linearGradient id="grad4"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#10b981"/></linearGradient>
                   <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                     <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                   </marker>
                </defs>
             </svg>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsData.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className={"w-12 h-12 rounded-xl flex items-center justify-center " + stat.bg + " mb-4"}>
                <stat.icon className={"w-6 h-6 " + stat.color} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>{stat.value}</h3>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* CHARTS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Valorization Output (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="kg" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Routing Distribution</h3>
              <div className="flex items-center">
                <div className="h-48 w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                      <span className="text-slate-300 font-medium">{entry.name}</span>
                      <span className="text-white ml-auto font-bold">{Math.round((entry.value / totalDiverted) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Live Logs
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border-l-2 border-emerald-500/50 pl-4 py-1">
                    <p className="text-sm text-slate-300">
                      <span className="text-white font-bold">{log.quantity_kg}kg</span>{" -> "}{(log as any).partner?.name || "Partner"}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">{log.output_generated}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{log.routed_at ? new Date(log.routed_at).toLocaleString() : ""}</p>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-slate-500 text-sm">No recent valorization logs. Run the demo simulation from the Live Map to generate data.</p>}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
               <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Active Partners
              </h3>
              <div className="space-y-3">
                {partners.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                    <div>
                      <p className="text-sm text-white font-medium">{p.name}</p>
                      <p className="text-xs text-slate-400 uppercase">{p.type}</p>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      {p.capacity_kg_per_day} kg/d
                    </span>
                  </div>
                ))}
                {partners.length === 0 && <p className="text-slate-500 text-sm">No partners found. Run the SQL seed script in Supabase.</p>}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
