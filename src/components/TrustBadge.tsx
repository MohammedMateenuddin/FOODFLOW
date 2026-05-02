"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTrustLevel } from "@/lib/trust-engine";

interface TrustBadgeProps {
  score: number;
  totalDonations?: number;
  totalComplaints?: number;
  memberSince?: string;
  compact?: boolean;
}

export default function TrustBadge({ score, totalDonations = 0, totalComplaints = 0, memberSince, compact = true }: TrustBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const trust = getTrustLevel(score);

  return (
    <div className="relative inline-block">
      {/* Pill Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105"
        style={{ backgroundColor: trust.color + "20", color: trust.color, border: "1px solid " + trust.color + "40" }}
      >
        <span>{trust.emoji}</span>
        {compact ? (
          <span>{score}/100</span>
        ) : (
          <span>{trust.label} &bull; {score}/100</span>
        )}
      </button>

      {/* Expanded Detail Card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 z-50 glass-panel rounded-xl border border-white/10 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{trust.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm">{trust.label}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Trust Score</p>
              </div>
              <span className="ml-auto text-2xl font-bold" style={{ color: trust.color, fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {score}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: score + "%" }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: trust.color }}
              />
            </div>

            {/* Stats */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">{"\u2705"}</span>
                <span>{totalDonations} successful donations</span>
              </div>
              {totalComplaints > 0 && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400">{"\u26A0\uFE0F"}</span>
                  <span>{totalComplaints} complaint{totalComplaints > 1 ? "s" : ""}</span>
                </div>
              )}
              {memberSince && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-blue-400">{"\uD83D\uDCC5"}</span>
                  <span>Member since {memberSince}</span>
                </div>
              )}
            </div>

            {/* Status note */}
            {trust.needsApproval && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400 text-[10px] font-bold">Listings require admin approval</p>
              </div>
            )}
            {!trust.canPost && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-[10px] font-bold">Account suspended - cannot post</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
