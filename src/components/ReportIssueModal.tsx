"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ISSUE_TYPES, processComplaint } from "@/lib/trust-engine";
import { toast } from "sonner";

interface ReportIssueModalProps {
  show: boolean;
  onClose: () => void;
  listingId: string;
  raisedBy: "ngo" | "volunteer" | "valorization_partner" | "admin";
}

export default function ReportIssueModal({ show, onClose, listingId, raisedBy }: ReportIssueModalProps) {
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issueType || !severity) return;
    setSubmitting(true);

    const { error } = await supabase.from("complaints").insert({
      listing_id: listingId,
      raised_by: raisedBy,
      issue_type: issueType,
      severity,
      description: description || null,
      status: "open",
    });

    if (!error) {
      await processComplaint({ listing_id: listingId, severity }, supabase);
      setSubmitted(true);
      toast.success("Complaint filed. Trust score updated.");
    } else {
      toast.error("Failed to submit complaint");
    }
    setSubmitting(false);
  };

  const resetAndClose = () => {
    setStep(1); setIssueType(""); setSeverity(""); setDescription(""); setSubmitted(false);
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
        onClick={resetAndClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-panel max-w-md w-full rounded-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">{submitted ? "Report Submitted" : "Report a Problem"}</h3>
            <button onClick={resetAndClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6">
            {submitted ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Thanks for reporting</h4>
                <p className="text-slate-400 text-sm mb-6">We'll review within 24 hours. Donor trust score has been updated.</p>
                <button onClick={resetAndClose} className="px-8 py-3 bg-emerald-500 text-[#003824] font-bold rounded-xl">Done</button>
              </motion.div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={"h-1 flex-1 rounded-full " + (s <= step ? "bg-emerald-500" : "bg-white/10")} />
                  ))}
                </div>

                {/* Step 1: Issue Type */}
                {step === 1 && (
                  <div>
                    <p className="text-white font-bold mb-4">What went wrong?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {ISSUE_TYPES.map((t) => (
                        <button key={t.value} onClick={() => { setIssueType(t.value); setStep(2); }}
                          className={"p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 " +
                            (issueType === t.value ? "bg-emerald-500/10 border-emerald-500/50" : "bg-white/5 border-white/10 hover:border-white/20")}>
                          <span className="text-2xl block mb-1">{t.emoji}</span>
                          <span className="text-white text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Severity */}
                {step === 2 && (
                  <div>
                    <p className="text-white font-bold mb-4">How bad is it?</p>
                    <div className="space-y-3">
                      {[
                        { value: "minor", label: "Minor", desc: "Small issue, food was still usable", color: "border-amber-500/30 hover:bg-amber-500/10" },
                        { value: "serious", label: "Serious", desc: "Affected ability to use the food", color: "border-orange-500/30 hover:bg-orange-500/10" },
                        { value: "critical", label: "Critical", desc: "Safety concern - food was unsafe", color: "border-red-500/30 hover:bg-red-500/10" },
                      ].map((s) => (
                        <button key={s.value} onClick={() => { setSeverity(s.value); setStep(3); }}
                          className={"w-full p-4 rounded-xl border text-left transition-all " + s.color + " bg-white/5"}>
                          <p className="text-white font-bold text-sm">{s.label}</p>
                          <p className="text-slate-400 text-xs">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setStep(1)} className="text-slate-500 text-sm mt-4 hover:text-white">Back</button>
                  </div>
                )}

                {/* Step 3: Description */}
                {step === 3 && (
                  <div>
                    <p className="text-white font-bold mb-4">Tell us more (optional)</p>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm resize-none outline-none focus:border-emerald-500/50 mb-4"
                      rows={3} placeholder="Any details that might help..." />
                    <button className="flex items-center gap-2 text-slate-400 text-sm mb-6 hover:text-white">
                      <Camera className="w-4 h-4" /> Add Photo
                    </button>
                    <button onClick={handleSubmit} disabled={submitting}
                      className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-all disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Report"}
                    </button>
                    <button onClick={() => setStep(2)} className="text-slate-500 text-sm mt-3 hover:text-white block mx-auto">Back</button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
