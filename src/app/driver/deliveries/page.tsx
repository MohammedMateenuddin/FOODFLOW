"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/hooks/useProfile";
import { Package, MapPin, Navigation, Clock, CheckCircle } from "lucide-react";

export default function DriverDeliveries() {
  const { profile } = useProfile();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      supabase.from("delivery_assignments")
        .select("*, listing:listings(food_name, quantity_kg, pickup_address)")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setAssignments(data);
          setTimeout(() => setLoading(false), 800);
        });
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#08090A] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">My Deliveries</h1>
        
        {loading ? (
          <div className="space-y-4">
             <div className="w-full h-24 bg-white/5 animate-pulse rounded-xl" />
             <div className="w-full h-24 bg-white/5 animate-pulse rounded-xl" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
             <Package className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">No Deliveries Yet</h3>
             <p className="text-slate-400">Accept a pickup from the dashboard to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{a.listing?.food_name || "Food Delivery"}</h3>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">{a.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400 font-space">₹{a.total_pay || 0}</p>
                    <p className="text-xs text-slate-400">{a.listing?.quantity_kg || 0} kg</p>
                  </div>
                </div>
                
                <div className="space-y-3 bg-[#111] p-4 rounded-xl border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 flex justify-center"><MapPin className="w-4 h-4 text-amber-500" /></div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Pickup</p>
                      <p className="text-sm text-slate-300">{a.listing?.pickup_address || "Hotel Taj"}</p>
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-white/10 ml-[11px]" />
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 flex justify-center"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Dropoff</p>
                      <p className="text-sm text-slate-300">Hope Orphanage</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
