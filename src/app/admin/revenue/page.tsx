"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, ArrowUpRight, CheckCircle2, AlertTriangle, Users, BookOpen, 
  Play, Pause, RefreshCw, Box, MapPin, Zap, TrendingUp, Shield, Activity
} from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

// Mock Data
const MRR_TREND = [
  { name: 'Jan', MRR: 12000 },
  { name: 'Feb', MRR: 18500 },
  { name: 'Mar', MRR: 24000 },
  { name: 'Apr', MRR: 35600 },
  { name: 'May', MRR: 40532 },
  { name: 'Jun', MRR: 45000 }
];

const REVENUE_STREAMS = [
  { name: 'Jan', CSR: 2000, Badges: 1000, Tipping: 1000, Subs: 8000 },
  { name: 'Feb', CSR: 3000, Badges: 2500, Tipping: 1500, Subs: 11500 },
  { name: 'Mar', CSR: 4500, Badges: 3500, Tipping: 2000, Subs: 14000 },
  { name: 'Apr', CSR: 6000, Badges: 4500, Tipping: 3100, Subs: 22000 },
  { name: 'May', CSR: 7295, Badges: 4997, Tipping: 3240, Subs: 25000 }
];

const INITIAL_FEED = [
  { id: 1, text: "🚗 2 hrs ago — Rahul S. completed delivery — ₹85 paid", time: Date.now() - 7200000 },
  { id: 2, text: "🛡️ 1 hr ago — Hotel Leela upgraded to Flagship — ₹3,999/mo", time: Date.now() - 3600000 },
  { id: 3, text: "♻️ 5 min ago — 45 kg valorized → GreenGas Mumbai — ₹112.50 earned", time: Date.now() - 300000 },
  { id: 4, text: "💰 2 min ago — TCS downloaded CSR report — ₹4,999 plan", time: Date.now() - 120000 }
];

const SUBSCRIPTIONS = {
  CSR: [
    { company: "Tata Consultancy Services", plan: "Enterprise CSR", amount: "₹4,999/mo", since: "Feb 2025", status: "Active" },
    { company: "Infosys", plan: "Basic CSR", amount: "₹2,296/mo", since: "Mar 2025", status: "Active" }
  ],
  Badges: [
    { company: "The Taj Mahal Palace", plan: "Flagship", amount: "₹3,999/mo", since: "Jan 2025", status: "Active" },
    { company: "Bastian", plan: "Premium", amount: "₹998/mo", since: "Apr 2025", status: "Active" }
  ],
  Valorization: [
    { company: "GreenGas Mumbai", plan: "Premium", amount: "₹15,000/mo", since: "Jan 2025", status: "Active" },
    { company: "AgriCompost Plus", plan: "Basic", amount: "₹5,000/mo", since: "Mar 2025", status: "Active" }
  ]
};

// Counter Component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeOut * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"CSR" | "Badges" | "Valorization">("CSR");
  const [feed, setFeed] = useState(INITIAL_FEED.reverse());
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [mrrTarget, setMrrTarget] = useState(40532);

  // Demo sequence timeout references to allow pausing/canceling
  const timers = useRef<NodeJS.Timeout[]>([]);

  const addFeedItem = (text: string) => {
    setFeed(prev => [{ id: Date.now(), text, time: Date.now() }, ...prev.slice(0, 5)]);
  };

  const runDemoStep = (step: number, delay: number, action: () => void) => {
    const timer = setTimeout(() => {
      if (!isPaused) {
        setDemoStep(step);
        action();
      }
    }, delay);
    timers.current.push(timer);
  };

  const startDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    setIsPaused(false);
    setDemoStep(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    toast("🎬 Initializing FoodFlow Global Simulation...");

    runDemoStep(1, 2000, () => {
      addFeedItem("📦 NEW LISTING: Taj Hotel — 30 kg biryani (Fresh)");
    });

    runDemoStep(2, 4000, () => {
      addFeedItem("🧠 AI ENGINE: Urgency Score 92/100 (High Risk) — Routing to Hope Kitchen");
    });

    runDemoStep(3, 6000, () => {
      addFeedItem("📍 MATCH FOUND: Hope Kitchen accepted. Expanding driver radius (2km → 5km)...");
    });

    runDemoStep(4, 10000, () => {
      addFeedItem("🚗 DRIVER ASSIGNED: Amit Patel (ETA 12 mins). +₹25 urgency bonus applied.");
    });

    runDemoStep(5, 12000, () => {
      addFeedItem("⚠️ EXPIRED LISTING: 40 kg raw vegetables (Marriott) flagged by AI freshness engine.");
    });

    runDemoStep(6, 15000, () => {
      addFeedItem("♻️ AI ROUTING: Redirecting expired veg to GreenGas Mumbai (Biogas Partner).");
    });

    runDemoStep(7, 18000, () => {
      addFeedItem("⚡ VALORIZATION: GreenGas confirmed receipt. +120 kWh potential energy logged.");
      setMrrTarget(prev => prev + 112); // Tipping fee jump
    });

    runDemoStep(8, 22000, () => {
      addFeedItem("📈 CSR UPDATE: Tata Consultancy Services dashboard updated (+30kg, +75 meals, +75 CO₂ saved).");
    });

    runDemoStep(9, 25000, () => {
      toast.success("🏆 FoodFlow Simulation Complete!", {
        description: "Rescued 30 kg. Generated ₹112 revenue. Fed 75 people.",
        duration: 8000
      });
      setIsDemoRunning(false);
      setDemoStep(10);
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast("⏸️ Simulation Paused");
    } else {
      toast("▶️ Simulation Resumed");
      // Note: Re-syncing timers after pause in a real app would require tracking remaining time.
      // For this hackathon demo, we simply prevent state updates while paused.
    }
  };

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3] pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER & GRAND FINALE BUTTONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-emerald-500" />
                Unified Operations & Revenue Command
              </h1>
              <span className="relative flex h-3 w-3 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-slate-400 mt-1">Real-time global logistics and monetization overview. <span className="text-emerald-500 text-xs tracking-widest uppercase ml-2">Live Connection</span></p>
          </div>
          <div className="flex gap-3">
             {isDemoRunning ? (
               <button onClick={togglePause} className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30 font-bold rounded-xl transition-all">
                 {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                 {isPaused ? "Resume Demo" : "Pause Demo"}
               </button>
             ) : (
               <button onClick={startDemo} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                 <Play className="w-5 h-5 fill-current" />
                 Run Full Demo 🎬
               </button>
             )}
          </div>
        </div>

        {/* ROW 1: MRR OVERVIEW CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
            <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Total MRR
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              <AnimatedCounter value={mrrTarget} prefix="₹" />
            </div>
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% vs last month
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> CSR Subscribers
            </div>
            <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter value={4} /></div>
            <div className="text-xs text-slate-500">₹7,295/mo</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" /> Active Badges
            </div>
            <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter value={3} /></div>
            <div className="text-xs text-slate-500">₹4,997/mo</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Paying Partners
            </div>
            <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter value={7} /></div>
            <div className="text-xs text-slate-500">₹28,240/mo</div>
          </div>
        </div>

        {/* ROW 2: CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">MRR Growth Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MRR_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#121315', borderColor: '#ffffff20', color: '#fff' }} />
                  <Line type="monotone" dataKey="MRR" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Streams Breakdown</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_STREAMS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#121315', borderColor: '#ffffff20', color: '#fff' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Subs" stackId="a" fill="#3b82f6" name="Partner Subs" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="CSR" stackId="a" fill="#10b981" name="CSR Reports" />
                  <Bar dataKey="Badges" stackId="a" fill="#a855f7" name="Trust Badges" />
                  <Bar dataKey="Tipping" stackId="a" fill="#f59e0b" name="Tipping Fees" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: LIVE FEED & ACTIONS */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2 flex flex-col h-[300px]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${isDemoRunning && !isPaused ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} /> Live System Feed</span>
              {isDemoRunning && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">Simulation Active</span>}
            </h3>
            <div className="flex-1 overflow-hidden relative">
              {/* Fade out top and bottom */}
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#08090A] to-transparent z-10" />
              <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-[#08090A] to-transparent z-10" />
              
              <div className="flex flex-col gap-3 py-2">
                <AnimatePresence>
                  {feed.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300"
                    >
                      {item.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 h-[300px]">
            <h3 className="text-lg font-bold text-white mb-4">Pending Actions</h3>
            <div className="space-y-4">
               <button className="w-full p-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl flex items-center gap-3 transition-colors text-left">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <div>
                   <div className="font-semibold text-white">2 Overdue Invoices</div>
                   <div className="text-xs text-red-400">Total: ₹3,400 pending</div>
                 </div>
               </button>
               <button className="w-full p-4 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl flex items-center gap-3 transition-colors text-left">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 <div>
                   <div className="font-semibold text-white">3 Badge Renewals</div>
                   <div className="text-xs text-amber-400">Action required this week</div>
                 </div>
               </button>
               <button className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl flex items-center gap-3 transition-colors text-left">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <div>
                   <div className="font-semibold text-white">5 New Partner Apps</div>
                   <div className="text-xs text-emerald-400">Awaiting approval</div>
                 </div>
               </button>
            </div>
          </div>
        </div>

        {/* ROW 4: SUBSCRIPTIONS TABLE */}
        <div className="glass-panel rounded-2xl border border-white/10 mb-8 overflow-hidden">
          <div className="flex border-b border-white/10 bg-white/5">
            {(["CSR", "Badges", "Valorization"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === tab ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5" : "text-slate-400 hover:text-white"}`}
              >
                {tab} {tab === "CSR" ? "Subscribers" : tab === "Badges" ? "Holders" : "Partners"}
              </button>
            ))}
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Plan</th>
                  <th className="p-4 font-semibold">Monthly Rev</th>
                  <th className="p-4 font-semibold">Customer Since</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {SUBSCRIPTIONS[activeTab].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{row.company}</td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2 py-1 bg-white/10 rounded text-xs">{row.plan}</span>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">{row.amount}</td>
                    <td className="p-4 text-slate-400">{row.since}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 font-semibold text-xs transition-colors">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 5: UNIT ECONOMICS (JUDGES) */}
        <div className="glass-panel p-8 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-emerald-500/10">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Unit Economics & Scalability</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-semibold">Revenue Per Kg Rescued</div>
              <div className="text-3xl font-bold text-white mb-1">₹2.84</div>
              <div className="text-xs text-blue-400">Averaged across all streams</div>
            </div>
            <div className="p-4 border-l border-r border-white/10">
              <div className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-semibold">Cost Per Meal Served</div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">₹0.00</div>
              <div className="text-xs text-emerald-500">100% Volunteer / NGO Driven</div>
            </div>
            <div className="p-4">
              <div className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-semibold">Gross Margin</div>
              <div className="text-3xl font-bold text-white mb-1">~85%</div>
              <div className="text-xs text-blue-400">Software + Logistics Coordination</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
