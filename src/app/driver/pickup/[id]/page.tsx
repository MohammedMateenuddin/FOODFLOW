"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, CheckCircle, Phone, Recycle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getVerificationBadge } from "@/lib/verification";
import { categorizeForValorization, CategorizationStep } from "@/lib/food-categorizer";
import AIThinkingModal from "@/components/AIThinkingModal";
import ReportIssueModal from "@/components/ReportIssueModal";

export default function PickupPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReroute, setShowReroute] = useState(false);
  const [rerouting, setRerouting] = useState(false);
  const [rerouteResult, setRerouteResult] = useState<any>(null);
  const [showAIThinking, setShowAIThinking] = useState(false);
  const [aiSteps, setAiSteps] = useState<CategorizationStep[]>([]);
  const [showReport, setShowReport] = useState(false);

  const [checks, setChecks] = useState({
    smell: false,
    appearance: false,
    sealed: false,
  });

  const allChecked = checks.smell && checks.appearance && checks.sealed;

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, donor:donors(*)")
        .eq("id", listingId)
        .single();
      if (data) setListing(data);
      setLoading(false);
    };
    fetchListing();
  }, [listingId]);

  const handleConfirmQuality = async () => {
    await supabase.from("listings").update({
      verification_status: "volunteer_verified",
      verification_step: 3,
      volunteer_checklist: checks,
      status: "picked_up",
    }).eq("id", listingId);

    toast.success("Quality confirmed! +15 bonus added to your wallet!", { duration: 5000 });
    setShowChecklist(false);
    router.push("/map");
  };

  const handleReroute = async () => {
    setRerouting(true);
    try {
      // Mark as expired first so valorization can pick it up
      await supabase.from("listings").update({
        status: "expired",
        verification_status: "rejected_by_volunteer",
      }).eq("id", listingId);

      const res = await fetch("/api/valorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await res.json();
      if (data.success) {
        setRerouteResult(data.valorization);
        // Build AI categorization steps for the thinking modal
        const { data: partners } = await supabase.from("valorization_partners").select("type, name");
        const catResult = categorizeForValorization(
          listing.food_type || "cooked_curry",
          partners || []
        );
        setAiSteps(catResult.steps);
        setShowReroute(false);
        setShowAIThinking(true);
      } else {
        toast.error("Rerouting failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Rerouting failed");
    }
    setRerouting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-white">
        <p>Listing not found.</p>
      </div>
    );
  }

  const badge = getVerificationBadge(listing);

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Volunteer Pickup</h1>
          <p className="text-slate-400">Verify food quality before collection</p>
        </motion.div>

        {/* Listing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-2xl border border-white/5"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{listing.food_name}</h2>
              <p className="text-slate-400 text-sm">{listing.quantity_kg} kg - {listing.food_type}</p>
              <p className="text-slate-500 text-xs mt-1">From: {listing.donor?.name || "Donor"}</p>
            </div>
            <div className={"px-3 py-1.5 rounded-full text-xs font-bold " + badge.bgColor + " " + badge.color}>
              {badge.label}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Storage</p>
              <p className="text-white font-bold text-sm">{listing.storage_type || "Room Temp"}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Verification</p>
              <p className="text-white font-bold text-sm">Step {listing.verification_step || 1}/3</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI Flag</p>
              <p className={"font-bold text-sm " + (listing.ai_expiry_flag ? "text-amber-400" : "text-emerald-400")}>
                {listing.ai_expiry_flag ? "Flagged" : "Clear"}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowChecklist(true)}
            className="w-full py-4 bg-emerald-500 text-[#003824] font-bold text-lg rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Start Quality Check
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="w-full py-3 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            {"\uD83D\uDEA8"} Report Issue
          </button>
        </motion.div>

        {/* ════════ CHECKLIST MODAL ════════ */}
        <AnimatePresence>
          {showChecklist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">&#128269;</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Quick Quality Check</h3>
                  <p className="text-slate-400 text-sm">Takes 10 seconds</p>
                </div>

                {/* Toggles */}
                <div className="space-y-4 mb-8">
                  {[
                    { key: "smell", label: "Smell is normal", emoji: "&#128067;" },
                    { key: "appearance", label: "Appearance looks fine", emoji: "&#128064;" },
                    { key: "sealed", label: "Container/packaging is sealed", emoji: "&#128230;" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setChecks({ ...checks, [item.key]: !checks[item.key as keyof typeof checks] })}
                      className={"w-full flex items-center gap-4 p-4 rounded-xl border transition-all " +
                        (checks[item.key as keyof typeof checks]
                          ? "bg-emerald-500/10 border-emerald-500/50"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                        )
                      }
                    >
                      <div className={"w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 transition-all " +
                        (checks[item.key as keyof typeof checks] ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400")
                      }>
                        {checks[item.key as keyof typeof checks] ? "\u2713" : ""}
                      </div>
                      <span className={"font-medium " + (checks[item.key as keyof typeof checks] ? "text-white" : "text-slate-400")}>
                        <span dangerouslySetInnerHTML={{ __html: item.emoji }} /> {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Actions */}
                {allChecked ? (
                  <button
                    onClick={handleConfirmQuality}
                    className="w-full py-4 bg-emerald-500 text-[#003824] font-bold text-lg rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm Quality - Proceed
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-amber-400 text-sm font-medium mb-2">
                      Toggle all checks to green to confirm, or report an issue below.
                    </p>
                    <button
                      onClick={() => { setShowChecklist(false); setShowReroute(true); }}
                      className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all"
                    >
                      <Recycle className="w-4 h-4" /> Reroute to Zero Waste Partner
                    </button>
                    <button
                      onClick={() => setShowChecklist(false)}
                      className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Contact Donor First
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════ REROUTE MODAL ════════ */}
        <AnimatePresence>
          {showReroute && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-panel max-w-md w-full p-8 rounded-2xl border border-amber-500/20"
              >
                {!rerouteResult ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Food Quality Concern</h3>
                    <p className="text-slate-400 text-sm mb-8">
                      This food will not go to waste. Our Valorization Engine will find the best alternative partner.
                    </p>
                    <button
                      onClick={handleReroute}
                      disabled={rerouting}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {rerouting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Smart Rerouting...</>
                      ) : (
                        <><Recycle className="w-5 h-5" /> Reroute to Zero Waste Partner</>
                      )}
                    </button>
                    <button
                      onClick={() => setShowReroute(false)}
                      className="w-full py-3 mt-3 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Successfully Rerouted!</h3>
                    <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 text-left mb-6 mt-4">
                      <p className="text-sm text-slate-400 mb-1">Routed to:</p>
                      <p className="text-lg font-bold text-white">{rerouteResult.partner.name}</p>
                      <p className="text-xs text-slate-500 uppercase">{rerouteResult.partner.type} - {rerouteResult.distance} km away</p>
                      <div className="mt-3 p-3 bg-emerald-500/10 rounded-lg">
                        <p className="text-emerald-400 font-bold text-sm">Output: {rerouteResult.output_generated}</p>
                        <p className="text-emerald-500/70 text-xs mt-1">{rerouteResult.co2_avoided} kg CO2 avoided</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/map")}
                      className="w-full py-3 bg-emerald-500 text-[#003824] font-bold rounded-xl"
                    >
                      View on Live Map
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════ AI THINKING MODAL ════════ */}
        {rerouteResult && (
          <AIThinkingModal
            show={showAIThinking}
            onClose={() => { setShowAIThinking(false); router.push("/map"); }}
            foodName={listing.food_name}
            foodSubType={listing.food_type || "cooked_curry"}
            quantityKg={listing.quantity_kg}
            steps={aiSteps}
            bestPartnerName={rerouteResult.partner?.name || "Partner"}
            bestPartnerType={rerouteResult.partner?.type || "biogas"}
            outputGenerated={rerouteResult.output_generated || ""}
            co2Avoided={rerouteResult.co2_avoided || 0}
          />
        )}

        {/* ════════ REPORT ISSUE MODAL ════════ */}
        <ReportIssueModal
          show={showReport}
          onClose={() => setShowReport(false)}
          listingId={listingId}
          raisedBy="volunteer"
        />
      </div>
    </div>
  );
}
