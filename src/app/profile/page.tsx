"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Edit3, Check, X, Loader2, Star, Package, Leaf } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({ ...data, email: user.email });
        setForm({ full_name: data.full_name || "", phone: data.phone || "" });
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const save = async () => {
    if (!profile?.id) { toast.error("Profile not found"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
    }).eq("id", profile.id);
    if (error) { toast.error(error.message); }
    else { setProfile({ ...profile, ...form }); toast.success("Profile updated!"); setEditing(false); }
    setSaving(false);
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return { color: "bg-slate-500/20 text-slate-400 border-slate-500/40", label: "User" };
    const map: Record<string, { color: string; label: string }> = {
      donor: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", label: "Donor" },
      ngo: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", label: "NGO" },
      driver: { color: "bg-amber-500/20 text-amber-400 border-amber-500/40", label: "Driver" },
      valorization_partner: { color: "bg-purple-500/20 text-purple-400 border-purple-500/40", label: "Partner" },
      admin: { color: "bg-red-500/20 text-red-400 border-red-500/40", label: "Admin" },
    };
    return map[role] || { color: "bg-slate-500/20 text-slate-400 border-slate-500/40", label: role };
  };

  if (loading) return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  const badge = getRoleBadge(profile?.role);

  return (
    <div className="min-h-screen bg-[#08090A] text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your FoodFlow account</p>
        </motion.div>

        {/* Avatar + Name Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-2xl font-black text-emerald-400">
                {(profile?.full_name || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="text-xl font-bold text-white">{profile?.full_name || "User"}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
                {profile?.is_onboarded && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Onboarded
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Editable Fields */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Info</h2>

          {/* Email (read-only) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm">
              {profile?.email}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</label>
            {editing ? (
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full bg-white/5 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm">
                {profile?.full_name || "—"}
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</label>
            {editing ? (
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full bg-white/5 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm">
                {profile?.phone || "—"}
              </div>
            )}
          </div>

          {/* Role (read-only) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Role</label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm capitalize">
              {profile?.role?.replace("_", " ")}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ full_name: profile.full_name, phone: profile.phone }); }}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl transition-all text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Donations", value: "—" },
            { icon: Star, label: "Trust Score", value: "100%" },
            { icon: Leaf, label: "CO₂ Saved", value: "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
