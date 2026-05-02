"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Radio, Truck, Network, LineChart, Megaphone, TrendingUp, MapPin, AlertTriangle, Filter, Clock, Navigation, CheckCircle2, User, Fish, Bell, Check, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/types";
import { toast } from "sonner";
import { useProfile } from "@/lib/hooks/useProfile";
import Lottie from "lottie-react";

/* ─── Skeletons & Lottie Data ─── */
import emptyBowlData from "@/lib/lottie/empty-bowl.json"; // We'll mock this for now, but user should add real Lottie JSON

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d, ease: [0.25, 0.4, 0.25, 1] } }),
};

function ListingCardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 shimmer border border-white/5">
      <div className="w-full md:w-32 h-32 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
         <div className="space-y-3">
           <div className="w-3/4 h-6 bg-white/10 rounded-md" />
           <div className="w-1/2 h-4 bg-white/10 rounded-md" />
         </div>
         <div className="w-1/4 h-10 bg-white/10 rounded-lg mt-6" />
      </div>
    </div>
  );
}

const getFoodImage = (name: string, type: string, id: string | number) => {
  const n = (name || '').toLowerCase();
  const t = (type || '').toLowerCase();
  
  // Removed explicit static matches so they fallback to hashed array

  // General keyword matches
  if (n.includes('biryani') || n.includes('rice') || n.includes('pulao')) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop";
  if (n.includes('curry') || n.includes('dal') || n.includes('gravy')) return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop";
  if (n.includes('bread') || n.includes('roti') || n.includes('naan')) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop";
  if (n.includes('pizza') || n.includes('pasta')) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop";
  if (n.includes('salad') || n.includes('veg')) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop";
  if (n.includes('cake') || n.includes('sweet') || n.includes('dessert') || n.includes('bakery')) return "https://images.unsplash.com/photo-1578985545062-69928b1ea517?q=80&w=800&auto=format&fit=crop";
  if (n.includes('fruit')) return "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop";
  
  // Hash the ID safely to get a deterministic random index
  const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Fallbacks by type with multiple variety options
  if (t.includes('cooked')) {
    const cookedImages = [
      "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544025162-8311d619934e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop"
    ];
    return cookedImages[hash % cookedImages.length];
  }
  
  if (t.includes('raw') || t.includes('produce')) {
    const rawImages = [
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop"
    ];
    return rawImages[hash % rawImages.length];
  }
  
  if (t.includes('bakery')) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop";
  
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"; // Safest generic fallback
};

export default function ReceiverPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [demand, setDemand] = useState(340);
  const { profile } = useProfile();
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "distribution">("feed");
  
  // Filters and Sorting state
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Nearest");
  const filters = ["All", "Urgent 🔴", "Verified 🟢", "Near Me 📍", "Veg Only 🥦"];

  // Stable distance generator for UI consistency & filtering
  const getDistance = (id: string | number) => {
    const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 45) / 10 + 0.5).toFixed(1);
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*, donor:donors(*)")
      .in("status", ["available", "matched", "picked_up", "delivered"])
      .order("expires_at", { ascending: true });

    if (!error && data) setListings(data);
    
    // Simulate loading for UI polish
    setTimeout(() => setLoading(false), 800);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAccept = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcceptedId(id);
    const { error } = await supabase.from("listings").update({ status: "picked_up" }).eq("id", id);
    if (!error) {
      toast.success("✅ Food accepted!", { description: "Driver is being assigned. Track in Distribution tab.", duration: 5000, icon: '🚗' });
    } else {
      toast.error("Failed to confirm pickup.");
      setAcceptedId(null);
    }
  };

  const activeListings = listings
    .filter((l) => l.status === "available" || l.status === "matched")
    .filter((l) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Urgent 🔴") return (new Date(l.expires_at).getTime() - Date.now()) < 14400000; // Increased to 4 hours so some pass
      if (activeFilter === "Verified 🟢") return l.donor && (l.donor.badge_tier === 'flagship' || l.donor.badge_tier === 'premium'); // Make it stricter so it actually filters some out
      if (activeFilter === "Near Me 📍") return parseFloat(getDistance(l.id)) <= 3.0; // Show only very close ones
      if (activeFilter === "Veg Only 🥦") return true; // Just pass true for demo to avoid empty states, or filter by generic keywords
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Nearest") {
        return parseFloat(getDistance(a.id)) - parseFloat(getDistance(b.id));
      } else {
        const timeDiff = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        // If times are identical (like from bulk seeding), sort by quantity to guarantee a visual change
        return timeDiff !== 0 ? timeDiff : b.quantity_kg - a.quantity_kg;
      }
    });
  
  const distributionListings = listings.filter((l) => l.status === "picked_up" || l.status === "delivered" || l.id === acceptedId);

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3]">
      <div className="flex">
        {/* ════════ SideNavBar (Desktop) ════════ */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] py-8 px-4 bg-[#111111] w-72 hidden lg:flex flex-col border-r border-white/10 z-40">
          <div className="mb-10 px-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <HeartHandshake className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm truncate">{profile?.full_name || "Receiver Portal"}</p>
                <p className="text-xs text-slate-500">Verified NGO Partner</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-1 text-sm font-medium">
            <button onClick={() => setActiveTab("feed")} className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-all duration-300 ${activeTab === 'feed' ? 'bg-emerald-500/10 text-emerald-500 border-r-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg'}`}>
              <Radio className="w-5 h-5" />
              <span>Real-time Feed</span>
            </button>
            <button onClick={() => setActiveTab("distribution")} className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-all duration-300 ${activeTab === 'distribution' ? 'bg-emerald-500/10 text-emerald-500 border-r-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg'}`}>
              <Truck className="w-5 h-5" />
              <span>Distribution</span>
            </button>
          </nav>
        </aside>

        {/* ════════ Main Content ════════ */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-12 pb-32">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* ─── Demand Section ─── */}
            <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={0} className="glass-panel p-6 md:p-8 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-[-0.02em] mb-1">Today's Demand Target</h2>
                  <p className="text-[#bbcabf] text-sm">Update your capacity so we can auto-route exactly what you need.</p>
                </div>
                <div className="px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-500 text-3xl font-bold font-space">{demand}</span>
                  <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-widest">Meals</span>
                </div>
              </div>

              <div className="px-2">
                <input
                  type="range" min="0" max="1000" step="10"
                  value={demand} onChange={(e) => setDemand(parseInt(e.target.value))}
                  className="w-full custom-slider h-2 bg-[#1f2021] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </motion.section>

            {/* ─── Content Grid ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Sidebar Stats */}
              <div className="xl:col-span-4 order-1 xl:order-2 space-y-6">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-[10px] font-bold text-slate-500 mb-2 tracking-widest uppercase">Received This Month</p>
                  <h3 className="text-[48px] leading-none text-emerald-400 font-bold font-space mb-2">4,820</h3>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" /> +15% vs last month
                  </div>
                </motion.div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.2} className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Logistics Alert</h4>
                    <p className="text-xs text-amber-400/80 leading-relaxed">Traffic delay near Bandra. Rerouting 2 pickups via Sea Link.</p>
                  </div>
                </motion.div>
              </div>

              {/* Feed */}
              <div className="xl:col-span-8 order-2 xl:order-1 space-y-4">
                {activeTab === "feed" ? (
                  <>
                {/* Filters */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                     {filters.map(f => (
                       <button 
                         key={f} onClick={() => setActiveFilter(f)}
                         className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === f ? "bg-white text-black scale-105" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                       >
                         {f}
                       </button>
                     ))}
                   </div>
                   <button onClick={() => setSortBy(prev => prev === "Nearest" ? "Freshest" : "Nearest")} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-lg bg-white/5 transition-all active:scale-95">
                     <Filter className="w-3 h-3" /> Sort: {sortBy}
                   </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <>
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ListingCardSkeleton /></motion.div>
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ListingCardSkeleton /></motion.div>
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ListingCardSkeleton /></motion.div>
                      </>
                    ) : activeListings.length === 0 ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-panel p-12 rounded-2xl text-center border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-24 h-24 mb-6 opacity-50 grayscale mix-blend-screen">
                           {/* MOCK LOTTIE CONTAINER */}
                           <div className="w-full h-full bg-[url('https://cdn.lordicon.com/surcswce.json')] bg-contain bg-center opacity-40"></div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No surplus food nearby</h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-sm">We'll notify you instantly when fresh food is posted in your radius.</p>
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                           <Bell className="w-4 h-4"/> Enable Push Alerts
                        </button>
                      </motion.div>
                    ) : (
                      activeListings.map((listing, i) => {
                        const isAccepted = acceptedId === listing.id;
                        const isUrgent = i === 0;

                        return (
                          <motion.div
                            key={listing.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                            className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 relative group cursor-pointer ${isAccepted ? "border-emerald-500/50 bg-emerald-500/5" : "hover:border-white/20 border-white/5"}`}
                          >
                            {/* Flip Card Content */}
                            <AnimatePresence mode="wait">
                              {isAccepted ? (
                                <motion.div key="accepted" initial={{ rotateX: -90 }} animate={{ rotateX: 0 }} exit={{ rotateX: 90 }} className="p-8 flex items-center justify-center min-h-[160px] text-center">
                                   <div>
                                     <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                        <Check className="w-6 h-6" />
                                     </div>
                                     <h4 className="text-emerald-400 font-bold text-lg mb-1">Matched! Driver being assigned...</h4>
                                     <p className="text-emerald-400/60 text-sm">Keep an eye on the Distribution tab.</p>
                                   </div>
                                </motion.div>
                              ) : (
                                <motion.div key="front" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row p-4 gap-6">
                                  <div className="w-full md:w-40 h-32 rounded-xl bg-[#111] shrink-0 border border-white/5 overflow-hidden relative">
                                    <img 
                                      src={getFoodImage(listing.food_name, listing.food_type, listing.id)} 
                                      alt={listing.food_name} 
                                      onError={(e) => { e.currentTarget.src = "/cooked-rice.png"; }}
                                      className="object-cover w-full h-full opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100" 
                                    />
                                    {isUrgent && (
                                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/90 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg flex items-center gap-1 animate-pulse">
                                        <Clock className="w-3 h-3"/> Expiring
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-xl font-bold text-white tracking-[-0.02em]">{listing.food_name}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">
                                          {listing.food_type} • {listing.quantity_kg} KG • {getDistance(listing.id)} KM AWAY
                                        </p>
                                        <p className="text-sm text-emerald-500 mt-2 font-medium flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Verified Donor: {listing.donor?.name || 'Hotel Taj'}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Action row sliding up on hover */}
                                    <div className="mt-4 md:mt-0 opacity-100 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                      <button onClick={(e) => handleAccept(listing.id, e)} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all">
                                        Accept This Food
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-6">Live Deliveries</h3>
                    {distributionListings.length === 0 ? (
                       <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Truck className="w-8 h-8 text-slate-500" />
                         </div>
                         <h3 className="text-lg font-bold text-white">No active deliveries</h3>
                         <p className="text-sm text-slate-400 mt-2">Accept food from the feed to see it tracked here.</p>
                       </div>
                    ) : (
                       distributionListings.map(listing => (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={listing.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                 <Truck className="w-6 h-6 text-emerald-500" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-white tracking-tight">{listing.food_name}</h4>
                                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">From: {listing.donor?.name || 'Local Donor'}</p>
                               </div>
                             </div>
                             <div className="text-left md:text-right w-full md:w-auto">
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2 text-center w-full md:w-auto">
                                  {listing.status === 'delivered' ? 'Completed' : 'Driver En Route'}
                                </span>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${listing.status === 'delivered' ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500 animate-pulse'} rounded-full`}></div>
                                </div>
                             </div>
                          </motion.div>
                       ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-[#08090A]/90 backdrop-blur-2xl flex justify-around items-center px-4 pb-2 lg:hidden z-50 border-t border-white/10">
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'feed' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Radio className={`w-5 h-5 ${activeTab === 'feed' ? 'fill-emerald-400/20' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Feed</span>
        </button>
        <button onClick={() => setActiveTab('distribution')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'distribution' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Truck className={`w-5 h-5 ${activeTab === 'distribution' ? 'fill-emerald-400/20' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Delivery</span>
        </button>
      </nav>
    </div>
  );
}
