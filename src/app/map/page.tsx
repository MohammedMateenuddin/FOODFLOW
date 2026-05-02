"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  HeartHandshake, 
  Gauge, 
  Layers, 
  RefreshCw, 
  Utensils, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Play,
  Recycle,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Donor, Receiver, Listing, ValorizationPartner, ValorizationLog } from "@/lib/types";
import { toast } from "sonner";

// Load LiveMap with no SSR
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#08090A] animate-pulse flex items-center justify-center text-emerald-500">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-8 h-8 animate-bounce" />
        <span className="text-sm font-semibold tracking-widest uppercase">Initializing Live Radar...</span>
      </div>
    </div>
  ),
});

type FilterType = "all" | "available" | "matched" | "picked_up" | "valorized";

export default function MapPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [partners, setPartners] = useState<ValorizationPartner[]>([]);
  const [valorizationLogs, setValorizationLogs] = useState<ValorizationLog[]>([]);
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const simInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [mealsToday, setMealsToday] = useState(1842);
  const [landfillAvoided, setLandfillAvoided] = useState(0);

  const [showEdible, setShowEdible] = useState(true);
  const [showValorization, setShowValorization] = useState(true);

  const fetchData = async () => {
    const [d, r, l, p, vLogs] = await Promise.all([
      supabase.from("donors").select("*, badge_tier, badge_active, badge_since"),
      supabase.from("receivers").select("*"),
      supabase.from("listings").select("*, donor:donors(*)").order("created_at", { ascending: false }),
      supabase.from("valorization_partners").select("*"),
      supabase.from("valorization_logs").select("*")
    ]);
    if (d.data) setDonors(d.data);
    if (r.data) setReceivers(r.data);
    if (l.data) setListings(l.data);
    if (p.data) setPartners(p.data);
    if (vLogs.data) setValorizationLogs(vLogs.data);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("live_map_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "valorization_logs" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    toast.success("Zero-Waste Simulation Started", { description: "Watch the circular economy in real-time." });
    let count = 0;

    simInterval.current = setInterval(async () => {
      if (count >= 12 || !donors.length || !receivers.length || !partners.length) {
        clearInterval(simInterval.current!);
        setIsSimulating(false);
        toast.info("Simulation Complete", { description: "100% of food diverted from landfill." });
        return;
      }

      const randomDonor = donors[Math.floor(Math.random() * donors.length)];
      
      // Determine if this will be a normal match or an expired valorization
      const isValorizationScenario = Math.random() < 0.35; // 35% chance to expire

      // Create fake listing
      const { data: newListing } = await supabase.from("listings").insert({
        donor_id: randomDonor.id,
        food_name: isValorizationScenario ? "Leftover Buffet" : "Fresh Packed Meals",
        food_type: "cooked",
        quantity_kg: Math.floor(Math.random() * 20) + 5,
        meals: Math.floor(Math.random() * 80) + 20,
        expires_at: isValorizationScenario 
          ? new Date(Date.now() - 1000).toISOString() // Already expired
          : new Date(Date.now() + 1000 * 60 * 60 * 1.5).toISOString(),
        status: isValorizationScenario ? "expired" : "available"
      }).select().single();

      if (newListing) {
        toast("Surplus Detected", {
          icon: <AlertTriangle className="text-red-400" />,
          description: `${newListing.quantity_kg}kg from ${randomDonor.name}`,
        });

        // 2 seconds later... route it
        setTimeout(async () => {
          try {
            if (isValorizationScenario) {
              // Valorization Engine
              const valRes = await fetch("/api/valorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listing_id: newListing.id }),
              });
              const valData = await valRes.json();
              if (valData.success) {
                toast.success("♻️ Auto-Valorized", {
                  description: `${newListing.quantity_kg}kg ➝ ${valData.valorization.partner.name}. Generated ${valData.valorization.output_generated}!`,
                });
                setLandfillAvoided(prev => prev + newListing.quantity_kg);
                fetchData();
              }
            } else {
              // Normal Match Engine
              const matchRes = await fetch("/api/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listing_id: newListing.id }),
              });
              const matchData = await matchRes.json();
              if (matchData.success) {
                toast.success("AI Match Found", {
                  description: `Routed to ${matchData.bestMatch.receiver.name}`,
                });
                setMealsToday(prev => prev + newListing.meals);
                fetchData();
              }
            }
          } catch (err) {
            console.error("Simulation API error:", err);
            toast.error("Network Error", { description: "Failed to reach routing engine." });
          }
        }, 2000);
      }
      count++;
    }, 5000);
  };

  const filteredListings = listings.filter(l => filter === "all" || l.status === filter);
  const activeCount = listings.filter(l => l.status === "available").length;
  const _pendingCount = listings.filter(l => l.status === "matched").length;

  return (
    <div className="bg-[#08090A] text-[#e3e2e3] h-screen overflow-hidden flex flex-col font-sans pt-20">
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* ════════ Left Activity Sidebar ════════ */}
        <aside className="w-80 glass-panel border-r border-white/5 flex flex-col z-40 bg-[#08090A]/80 backdrop-blur-xl shrink-0">
          <div className="p-6 border-b border-white/5">
            <span className="text-[12px] font-semibold text-emerald-500 uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              Live Operations
            </span>
            <div className="flex items-center justify-between mt-1">
              <h2 className="text-2xl font-semibold text-white tracking-[-0.02em]">Activity Feed</h2>
              <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-emerald-400">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Simulation Button */}
            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-blue-500 hover:text-[#08090A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Simulating...</>
              ) : (
                <><Recycle className="w-4 h-4 fill-current text-emerald-400" /> Run Zero-Waste Demo</>
              )}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {listings.slice(0, 20).map((listing, i) => {
                const isUrgent = new Date(listing.expires_at).getTime() - Date.now() < 2 * 60 * 60 * 1000;
                const isValorized = listing.status === "valorized";
                return (
                  <motion.div 
                    key={listing.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`p-4 bg-white/5 rounded-xl border transition-colors ${
                      listing.status === "available" && isUrgent ? "border-red-500/50" 
                      : listing.status === "matched" ? "border-[#c3d000]/50"
                      : isValorized ? "border-blue-500/50"
                      : "border-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {listing.status === "available" && isUrgent ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      ) : listing.status === "matched" ? (
                        <Truck className="w-5 h-5 text-[#c3d000] shrink-0 mt-0.5" />
                      ) : isValorized ? (
                        <Recycle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-white leading-tight mb-1">
                          {listing.status === "available" 
                            ? `${isUrgent ? 'URGENT: ' : ''}${listing.meals} meals from ${listing.donor?.name || 'Partner'}`
                            : listing.status === "matched"
                            ? `Matched: ${listing.donor?.name} ➝ Delivery Pending`
                            : isValorized
                            ? `Valorized: ${listing.quantity_kg}kg diverted from landfill`
                            : `Delivered: ${listing.meals} meals successfully rescued.`
                          }
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(listing.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </aside>

        {/* ════════ Main Dashboard Content (Map Area) ════════ */}
        <section className="flex-1 relative bg-[#0d0e0f]">
          {/* Leaflet Map Layer */}
          <div className="absolute inset-0 z-0">
            <LiveMap 
              donors={donors} 
              receivers={receivers} 
              listings={filteredListings} 
              partners={partners}
              valorizationLogs={valorizationLogs}
              showEdible={showEdible}
              showValorization={showValorization}
              className="w-full h-full" 
            />
          </div>

          {/* ════════ Top Left Toggles ════════ */}
          <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
            <button 
              onClick={() => setShowEdible(!showEdible)}
              className={`glass-panel px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${showEdible ? 'bg-white/10' : 'opacity-50'}`}
            >
              {showEdible ? <Eye className="w-4 h-4 text-[#c3d000]" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <span className="text-[11px] font-bold tracking-wider uppercase text-white">Edible Routes</span>
            </button>
            <button 
              onClick={() => setShowValorization(!showValorization)}
              className={`glass-panel px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${showValorization ? 'bg-white/10' : 'opacity-50'}`}
            >
              {showValorization ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <span className="text-[11px] font-bold tracking-wider uppercase text-white">Valorization Routes</span>
            </button>
          </div>

          {/* ════════ Floating Stats Bar ════════ */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-4 z-30 pointer-events-none">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 pointer-events-auto shadow-lg"
            >
              <RefreshCw className="w-5 h-5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
                  Active Donations
                </span>
                <span className="text-xl font-medium text-white leading-none" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {activeCount}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 pointer-events-auto shadow-lg"
            >
              <Utensils className="w-5 h-5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
                  Meals Delivered Today
                </span>
                <span className="text-xl font-medium text-emerald-500 leading-none" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {mealsToday.toLocaleString()}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border-blue-500/20 pointer-events-auto shadow-lg"
            >
              <Recycle className="w-5 h-5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
                  Landfill Avoided (kg)
                </span>
                <span className="text-xl font-medium text-blue-400 leading-none" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {landfillAvoided.toLocaleString()}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ════════ Floating Filter Buttons ════════ */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 shadow-2xl p-1 glass-panel rounded-xl"
          >
            {[
              { id: "all", label: "All", icon: Layers },
              { id: "available", label: "Available", icon: Utensils, color: "text-red-400" },
              { id: "matched", label: "Matched", icon: Truck, color: "text-[#c3d000]" },
              { id: "valorized", label: "Valorized", icon: Recycle, color: "text-blue-400" },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${filter === f.id ? "bg-white/10 shadow-inner" : "hover:bg-white/5"}`}
              >
                <f.icon className={`w-4 h-4 ${f.color || 'text-white'}`} />
                <span className={`text-[12px] font-semibold tracking-[0.1em] uppercase ${filter === f.id ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                  {f.label}
                </span>
              </button>
            ))}
          </motion.div>

          {/* ════════ Map Legends ════════ */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-10 right-10 flex flex-col gap-3 z-30 glass-panel p-4 rounded-xl pointer-events-none"
          >
            {/* Partner Badge Tiers */}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Partner Badges</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="text-sm">👑</span>
              Flagship Partner
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="text-sm">⭐</span>
              Premium Partner
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="text-sm">🛡️</span>
              Verified Partner
            </div>
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nodes</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              Donors (Hotels)
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
              NGOs (Receivers)
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
              Biogas Plants
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#84cc16] shadow-[0_0_8px_#84cc16]"></span>
              Farmers
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]"></span>
              Cattle Feed
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#14b8a6] shadow-[0_0_8px_#14b8a6]"></span>
              Compost Units
            </div>
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-6 h-0.5 border-b-2 border-dashed border-[#c3d000]"></span>
              NGO Logistics Route
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="w-6 h-0.5 border-b-2 border-dashed border-amber-400"></span>
              Zero-Waste Route
            </div>
          </motion.div>
          
        </section>
      </main>
    </div>
  );
}
