"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Bell, Shield,  Trash2, Loader2, Check, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    pushNotifs: true,
    matchAlerts: true,
    weeklyReport: false,
  });

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setNewPassword(""); setChangingPassword(false); }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#08090A] text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your preferences and security</p>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "emailNotifs", label: "Email notifications", desc: "Get updates via email" },
              { key: "pushNotifs", label: "Push notifications", desc: "Browser push alerts" },
              { key: "matchAlerts", label: "Match alerts", desc: "When your food is matched" },
              { key: "weeklyReport", label: "Weekly impact report", desc: "Your weekly impact summary" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
                <Toggle
                  on={prefs[key as keyof typeof prefs]}
                  onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof prefs] }))}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Security</h2>
          </div>

          {!changingPassword ? (
            <button
              onClick={() => setChangingPassword(true)}
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <span className="text-sm text-slate-300 group-hover:text-white">Change Password</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full bg-white/5 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  onClick={() => { setChangingPassword(false); setNewPassword(""); }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">Danger Zone</h2>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all group"
          >
            <span className="text-sm text-red-400">Sign out of FoodFlow</span>
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </motion.div>

        {/* App info */}
        <div className="text-center text-xs text-slate-600 mt-8">
          FoodFlow v0.1.0 — Hackathon Demo Build
        </div>
      </div>
    </div>
  );
}
