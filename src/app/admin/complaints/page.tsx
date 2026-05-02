"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Search, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getTrustLevel, ISSUE_TYPES } from "@/lib/trust-engine";
import TrustBadge from "@/components/TrustBadge";
import { toast } from "sonner";

type FilterType = "all" | "critical" | "serious" | "minor" | "resolved";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from("complaints")
      .select("*, listing:listings(food_name, donor_id, donor:donors(name, trust_score, total_complaints))")
      .order("created_at", { ascending: false });
    if (data) setComplaints(data);
  };

  useEffect(() => {
    fetchComplaints();
    const ch = supabase.channel("complaints_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, fetchComplaints)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("complaints").update({ status }).eq("id", id);
    toast.success("Complaint " + status);
    fetchComplaints();
  };

  const filtered = complaints.filter((c) => {
    if (filter === "all") return true;
    if (filter === "resolved") return c.status === "resolved";
    return c.severity === filter && c.status !== "resolved";
  });

  const counts = {
    critical: complaints.filter(c => c.severity === "critical" && c.status !== "resolved").length,
    serious: complaints.filter(c => c.severity === "serious" && c.status !== "resolved").length,
    minor: complaints.filter(c => c.severity === "minor" && c.status !== "resolved").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  const severityBadge = (s: string) => {
    if (s === "critical") return "bg-red-500/15 text-red-400 border-red-500/30";
    if (s === "serious") return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  };

  const issueLabel = (type: string) => {
    const found = ISSUE_TYPES.find(i => i.value === type);
    return found ? found.emoji + " " + found.label : type;
  };

  const timeAgo = (date: string) => {
    const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return mins + "m ago";
    if (mins < 1440) return Math.round(mins / 60) + "h ago";
    return Math.round(mins / 1440) + "d ago";
  };

  return (
    <div className="min-h-screen bg-[#08090A] pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-400" /> Complaints Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Monitor food quality issues and donor trust scores</p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
            {"\uD83D\uDD34"} {counts.critical} Critical
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-bold">
            {"\uD83D\uDFE0"} {counts.serious} Serious
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
            {"\uD83D\uDFE1"} {counts.minor} Minor
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
            {"\u2705"} {counts.resolved} Resolved
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "critical", "serious", "minor", "resolved"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={"px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize " +
                (filter === f ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20")}>
              {f}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Severity</th>
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Issue</th>
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Listing</th>
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Donor Trust</th>
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Time</th>
                  <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const donor = c.listing?.donor;
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className={"px-3 py-1 rounded-full text-xs font-bold border " + severityBadge(c.severity)}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{issueLabel(c.issue_type)}</p>
                        {c.description && <p className="text-slate-500 text-xs mt-0.5 max-w-[200px] truncate">{c.description}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm">{c.listing?.food_name || "---"}</p>
                        <p className="text-slate-500 text-xs">by {c.raised_by}</p>
                      </td>
                      <td className="px-6 py-4">
                        {donor ? (
                          <div>
                            <p className="text-white text-sm mb-1">{donor.name}</p>
                            <TrustBadge score={donor.trust_score || 100} totalComplaints={donor.total_complaints || 0} />
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{timeAgo(c.created_at)}</td>
                      <td className="px-6 py-4">
                        {c.status === "resolved" ? (
                          <span className="text-emerald-400 text-xs font-bold">Resolved</span>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(c.id, "resolved")} title="Resolve"
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStatus(c.id, "investigating")} title="Investigate"
                              className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all">
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">No complaints found. Run the SQL seed script first.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
