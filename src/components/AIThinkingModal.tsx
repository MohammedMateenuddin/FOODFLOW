"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import { CategorizationStep } from "@/lib/food-categorizer";

interface AIThinkingModalProps {
  show: boolean;
  onClose: () => void;
  foodName: string;
  foodSubType: string;
  quantityKg: number;
  steps: CategorizationStep[];
  bestPartnerName: string;
  bestPartnerType: string;
  outputGenerated: string;
  co2Avoided: number;
}

export default function AIThinkingModal({
  show, onClose, foodName, foodSubType, quantityKg,
  steps, bestPartnerName, bestPartnerType, outputGenerated, co2Avoided
}: AIThinkingModalProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!show) { setVisibleLines(0); return; }
    setVisibleLines(0);
    // Total lines: header(1) + food info(1) + analyzing(1) + steps(4) + spacing(1) + result(3) = 11
    const totalLines = 4 + steps.length + 3;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= totalLines) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [show, steps.length]);

  if (!show) return null;

  const typeLabel: Record<string, string> = {
    cattle_feed: "Cattle Feed",
    biogas: "Biogas Plant",
    compost: "Compost Unit",
    farmer: "Farmer / Manure",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel max-w-lg w-full rounded-2xl border border-emerald-500/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">FoodFlow AI Routing Engine</h3>
                  <p className="text-emerald-400 text-xs font-mono">Processing valorization route...</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terminal-style output */}
            <div className="p-6 font-mono text-sm space-y-2 min-h-[280px] bg-[#0a0b0c]">
              {/* Line 1: Food info */}
              {visibleLines >= 1 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                  <span className="text-blue-400">Food:</span> {foodName} ({quantityKg} kg)
                </motion.p>
              )}

              {/* Line 2: Sub-type */}
              {visibleLines >= 2 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                  <span className="text-blue-400">Category:</span> {foodSubType.replace(/_/g, " ")}
                </motion.p>
              )}

              {/* Line 3: Analyzing */}
              {visibleLines >= 3 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-500 mt-3">
                  Analyzing compatibility...
                </motion.p>
              )}

              {/* Lines 4+: Each routing step */}
              {steps.map((step, i) => (
                visibleLines >= 4 + i && (
                  <motion.div
                    key={step.partnerType}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <span className={step.allowed ? "text-emerald-400" : "text-red-400"}>
                      {step.allowed ? "\u2705" : "\u274C"}
                    </span>
                    <div>
                      <span className="text-white">{typeLabel[step.partnerType] || step.partnerType}</span>
                      <span className="text-slate-500"> -- {step.reason}</span>
                    </div>
                  </motion.div>
                )
              ))}

              {/* Result lines */}
              {visibleLines >= 4 + steps.length + 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-emerald-400 font-bold flex items-center gap-2">
                    <span className="text-lg">{"\uD83D\uDCCD"}</span> Routing to: {bestPartnerName}
                  </p>
                </motion.div>
              )}

              {visibleLines >= 4 + steps.length + 2 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-amber-400">
                  <span>{"\u26A1"}</span> Will generate: {outputGenerated}
                </motion.p>
              )}

              {visibleLines >= 4 + steps.length + 3 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-blue-400">
                  <span>{"\uD83C\uDF0D"}</span> CO2 avoided: {co2Avoided.toFixed(1)} kg
                </motion.p>
              )}
            </div>

            {/* Footer */}
            {visibleLines >= 4 + steps.length + 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 border-t border-white/10 bg-emerald-500/5"
              >
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-500 text-[#003824] font-bold rounded-xl hover:bg-emerald-400 transition-all"
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
