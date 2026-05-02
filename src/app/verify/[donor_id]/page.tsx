"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Star, Crown, CheckCircle, Clock, Package, Utensils, Leaf, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import VerifiedBadge, { BadgeTier } from "@/components/VerifiedBadge";

const tierIcons: Record<string, typeof Shield> = { verified: Shield, premium: Star, flagship: Crown };
const tierColors: Record<string, string> = { verified: "#10b981", premium: "#f97316", flagship: "#6366f1" };
const tierLabels: Record<string, string> = { verified: "Verified Partner", premium: "Premium Partner", flagship: "Flagship Partner" };

interface DonorData {
  id: string; name: string; type: string; address: string;
  badge_tier: BadgeTier; badge_active: boolean; badge_since: string;
}

export default function VerifyPage() {
  const params = useParams();
  const donorId = params.donor_id as string;
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [stats, setStats] = useState({ kg: 0, meals: 0, co2: 0 });
  const [lastDonation, setLastDonation] = useState<{ food_name: string; quantity_kg: number; receiver_name: string; time: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: d } = await supabase.from("donors").select("*").eq("id", donorId).single();
      if (d) {
        setDonor(d as DonorData);
        // Fetch impact stats
        const { data: impacts } = await supabase.from("impact_log").select("meals_saved, kg_rescued, co2_avoided");
        if (impacts) {
          const totals = impacts.reduce((acc, i) => ({ kg: acc.kg + (i.kg_rescued || 0), meals: acc.meals + (i.meals_saved || 0), co2: acc.co2 + (i.co2_avoided || 0) }), { kg: 0, meals: 0, co2: 0 });
          setStats(totals);
        }
        // Fetch last donation
        const { data: lastListing } = await supabase.from("listings").select("food_name, quantity_kg, created_at, matched_receiver_id").eq("donor_id", donorId).order("created_at", { ascending: false }).limit(1).single();
        if (lastListing) {
          let receiverName = "Community Partner";
          if (lastListing.matched_receiver_id) {
            const { data: recv } = await supabase.from("receivers").select("name").eq("id", lastListing.matched_receiver_id).single();
            if (recv) receiverName = recv.name;
          }
          setLastDonation({
            food_name: lastListing.food_name,
            quantity_kg: lastListing.quantity_kg,
            receiver_name: receiverName,
            time: lastListing.created_at,
          });
        }
      }
      setLoading(false);
      setTimeout(() => setVerified(true), 800);
    }
    load();
  }, [donorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
      </div>
    );
  }

  if (!donor || !donor.badge_tier || !donor.badge_active) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Badge Not Found</h1>
          <p className="text-slate-400 max-w-md">This badge could not be verified. It may have been deactivated or the ID is invalid.</p>
        </div>
      </div>
    );
  }

  const color = tierColors[donor.badge_tier];
  const TierIcon = tierIcons[donor.badge_tier];
  const certId = `FF-${donor.badge_tier.toUpperCase().slice(0, 3)}-${donor.id.slice(0, 8).toUpperCase()}`;
  const timeSinceLast = lastDonation ? getTimeAgo(lastDonation.time) : "N/A";

  return (
    <div className="min-h-screen bg-[#08090A] text-[#e3e2e3]">
      {/* Verification Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center top, ${color}15, transparent 70%)` }} />
        <div className="relative max-w-2xl mx-auto px-6 pt-12 pb-16 text-center">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={verified ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
            className="mb-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={verified ? { scale: 1 } : {}}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{ background: `${color}15`, border: `2px solid ${color}44` }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={verified ? { scale: 1 } : {}}
                transition={{ delay: 0.7, type: "spring" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckCircle className="w-14 h-14" style={{ color }} />
              </motion.div>
              {/* Ripple */}
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={verified ? { scale: 2.5, opacity: 0 } : {}}
                transition={{ delay: 0.7, duration: 1.5 }}
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${color}` }}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
              <TierIcon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color }}>{tierLabels[donor.badge_tier]}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">This Badge is Authentic</h1>
            <p className="text-slate-400 max-w-md mx-auto">Verified by FoodFlow — India&apos;s trusted food rescue network</p>
          </motion.div>
        </div>
      </div>

      {/* Badge + Info */}
      <div className="max-w-2xl mx-auto px-6 -mt-4 space-y-8 pb-24">
        {/* Badge Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex justify-center">
          <VerifiedBadge tier={donor.badge_tier} name={donor.name} since={donor.badge_since} donorId={donor.id} size="web" />
        </motion.div>

        {/* Restaurant Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
              <TierIcon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{donor.name}</h2>
              <p className="text-sm text-slate-400">{donor.address || donor.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-slate-500 block mb-1">Member Since</span>
              <span className="text-white font-semibold">{new Date(donor.badge_since).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-slate-500 block mb-1">Certificate ID</span>
              <span className="text-white font-mono font-semibold text-xs">{certId}</span>
            </div>
          </div>
        </motion.div>

        {/* Live Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="grid grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Food Rescued", value: `${stats.kg.toLocaleString()} kg`, color: "#10b981" },
            { icon: Utensils, label: "Meals Donated", value: stats.meals.toLocaleString(), color: "#f97316" },
            { icon: Leaf, label: "CO₂ Avoided", value: `${stats.co2.toLocaleString()} kg`, color: "#6366f1" },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <s.icon className="w-6 h-6 mx-auto mb-3" style={{ color: s.color }} />
              <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Last Donation */}
        {lastDonation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-300">Last Donation</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{lastDonation.quantity_kg} kg {lastDonation.food_name}</p>
                <p className="text-sm text-slate-400">→ {lastDonation.receiver_name}</p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">{timeSinceLast}</span>
            </div>
          </motion.div>
        )}

        {/* Watermark / Certificate footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="pt-8 text-center border-t border-white/5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold text-white">FoodFlow</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500">Official Verification Portal • Certificate {certId}</p>
          <p className="text-xs text-slate-600 mt-1">This page is a live, real-time verification of the partner badge.</p>
        </motion.div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}
