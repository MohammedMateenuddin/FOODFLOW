"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MapPin, Building, Phone, Utensils, Users, Car, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [role, setRole] = useState('donor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check auth session on mount — if no session, redirect to login
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // No session — user hasn't confirmed email or isn't logged in
          router.replace('/login');
          return;
        }

        setUserId(user.id);
        
        // Try to get their role from metadata (set during signup)
        const metaRole = user.user_metadata?.role;
        if (metaRole) setRole(metaRole);

        // Check if they already have a profile and are onboarded
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) setUserProfile(profile);

        if (profile?.is_onboarded) {
          // Already onboarded, send to dashboard
          const dest = {
            donor: '/donate',
            ngo: '/receiver',
            driver: '/driver/dashboard',
            valorization_partner: '/partners/dashboard/me',
            admin: '/admin',
          }[profile.role] || '/';
          window.location.href = dest;
          return;
        }

        // If profile exists but not onboarded, use its role
        if (profile?.role) setRole(profile.role);
        
      } catch (err) {
        console.error('Session check error:', err);
      }
      setPageLoading(false);
    };
    
    checkSession();
  }, [router]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user || authError) {
        setErrorMsg("Your session has expired. Please go back and log in again.");
        setLoading(false);
        return;
      }

      // Upsert profile — creates it if trigger failed, updates if it exists
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: role,
          is_onboarded: true,
          phone: formData.phone || '',
          full_name: formData.name || user.user_metadata?.full_name || ''
        });

      if (error) {
        setErrorMsg("Database error: " + error.message + ". Make sure you've run the auth SQL setup in Supabase.");
        setLoading(false);
        return;
      }

      // Hard redirect to dashboard
      const dest = {
        donor: '/donate',
        ngo: '/receiver',
        driver: '/driver/dashboard',
        valorization_partner: '/partners/dashboard/me',
        admin: '/admin',
      }[role] || '/';
      window.location.href = dest;
      
    } catch (err: any) {
      setErrorMsg("Unexpected error: " + (err?.message || String(err)));
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center p-4 text-[#e3e2e3] py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Complete Profile</h1>
        <p className="text-emerald-400 font-medium capitalize">Welcome, let's setup your {role} account</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form onSubmit={handleCompleteSetup} className="space-y-6">
            
            {/* Error display */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
                <p className="font-bold mb-1">⚠️ Something went wrong</p>
                <p>{errorMsg}</p>
              </div>
            )}
            
            {/* DONOR FORM */}
            {role === 'donor' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Restaurant / Hotel Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="name" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. The Taj Hotel" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Address Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="address" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. Colaba, Mumbai" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Avg Daily Surplus (kg)</label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="number" name="capacity" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="30" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="tel" name="phone" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* NGO FORM */}
            {role === 'ngo' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Organization Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="name" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. Hope Foundation" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="address" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. Andheri East" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Daily Meals Needed</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="number" name="capacity" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="100" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="tel" name="phone" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Food Preferences</label>
                  <select name="preferences" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 transition-colors">
                    <option value="any" className="text-black">Any Food</option>
                    <option value="veg" className="text-black">Vegetarian Only</option>
                    <option value="nonveg" className="text-black">Non-Vegetarian Ok</option>
                  </select>
                </div>
              </>
            )}

            {/* DRIVER FORM */}
            {role === 'driver' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Full Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="name" required onChange={handleChange} defaultValue={userProfile?.full_name || ''} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="tel" name="phone" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Vehicle Type</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <select name="vehicle" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors">
                        <option value="bike" className="text-black">Two Wheeler (Bike/Scooter)</option>
                        <option value="car" className="text-black">Car / Mini Van</option>
                        <option value="truck" className="text-black">Large Truck</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Driver Type</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-white">
                      <input type="radio" name="driver_type" value="volunteer" onChange={handleChange} className="text-emerald-500 bg-white/10 border-white/20" /> Volunteer (NSS/NGO)
                    </label>
                    <label className="flex items-center gap-2 text-white">
                      <input type="radio" name="driver_type" value="paid" onChange={handleChange} className="text-emerald-500 bg-white/10 border-white/20" /> Delivery Partner
                    </label>
                  </div>
                </div>
                {formData.driver_type === 'volunteer' && (
                  <div className="space-y-1 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <label className="text-sm font-semibold text-blue-400 flex items-center gap-2"><Info className="w-4 h-4"/> NSS/NCC Certificate Number (Optional)</label>
                    <input type="text" name="cert" onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-blue-500 transition-colors" placeholder="Cert #..." />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Home Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="address" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. Bandra West" />
                  </div>
                </div>
              </>
            )}

            {/* VALORIZATION PARTNER FORM */}
            {role === 'valorization_partner' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Organization Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="name" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. GreenGas Energy" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Partner Type</label>
                  <select name="partner_type" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 transition-colors">
                    <option value="biogas" className="text-black">Biogas Plant</option>
                    <option value="cattle" className="text-black">Cattle / Animal Farm</option>
                    <option value="compost" className="text-black">Compost Facility</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-400">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" name="address" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="e.g. Navi Mumbai" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Processing Capacity</label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="number" name="capacity" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 transition-colors" placeholder="1000 kg/day" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Subscription Plan</label>
                    <select name="plan" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 transition-colors">
                      <option value="free" className="text-black">Free (Tipping Only)</option>
                      <option value="basic" className="text-black">Basic Plan</option>
                      <option value="premium" className="text-black">Premium Volume</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-[#003824] font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Setup →"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
