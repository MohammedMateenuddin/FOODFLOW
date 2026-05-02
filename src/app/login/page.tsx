"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Utensils, Home, Car, Recycle } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/VideoBackground";


const ROLES = [
  { id: "donor",                icon: Utensils, label: "Donor",   sub: "Restaurant/Hotel" },
  { id: "ngo",                  icon: Home,     label: "NGO",     sub: "Orphanage/Shelter" },
  { id: "driver",               icon: Car,      label: "Driver",  sub: "Volunteer/Paid" },
  { id: "valorization_partner", icon: Recycle,  label: "Partner", sub: "Biogas/Farm" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("donor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const redirectByRole = (role: string) => {
    switch (role) {
      case "donor": router.push("/donate"); break;
      case "ngo": router.push("/receiver"); break;
      case "driver": router.push("/driver/dashboard"); break;
      case "valorization_partner": router.push("/partners/dashboard/me"); break;
      case "admin": router.push("/admin"); break;
      default: router.push("/");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_onboarded, role, is_suspended, full_name")
      .eq("id", data.user.id)
      .single();

    if (profile?.is_suspended) { router.push("/suspended"); return; }
    if (!profile?.is_onboarded) { router.push("/onboarding"); return; }

    // ── ROLE GUARD: reject login if account role doesn't match selected role ──
    if (profile?.role !== selectedRole) {
      await supabase.auth.signOut();
      const selectedLabel = ROLES.find(r => r.id === selectedRole)?.label ?? selectedRole;
      const actualLabel   = ROLES.find(r => r.id === profile?.role)?.label ?? profile?.role;
      setError(`This account is registered as a "${actualLabel}", not a "${selectedLabel}". Please select the correct role.`);
      setLoading(false);
      return;
    }

    if (redirectPath === "/") {
      redirectByRole(profile.role);
    } else {
      router.push(redirectPath);
    }

  };

  const handleGoogleLogin = async () => {
    // Store the role selection so the callback can use it
    if (typeof window !== "undefined") {
      localStorage.setItem("intended_role", selectedRole);
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}&next=${redirectPath}`,
      },
    });
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      <VideoBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[#e3e2e3] py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">FoodFlow</h1>
        <p className="text-emerald-400 font-medium">&quot;Every meal matters&quot;</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome back</h2>

          {/* ─── ROLE SELECTOR ─── */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-400 block mb-3">I am logging in as a:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                    selectedRole === role.id
                      ? "bg-emerald-500/10 border-emerald-500"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}
                >
                  <role.icon className={`w-6 h-6 mb-2 ${selectedRole === role.id ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className={`text-sm font-bold ${selectedRole === role.id ? "text-emerald-400" : "text-white"}`}>{role.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{role.sub}</span>

                  {selectedRole === role.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#003824]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-slate-500 text-sm font-medium">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1 pb-2">
              <label className="text-sm font-semibold text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#003824] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Sign In as ${ROLES.find(r => r.id === selectedRole)?.label}`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
      </div>
    </main>
  );
}
