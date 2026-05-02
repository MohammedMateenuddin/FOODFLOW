"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, Thermometer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { calculateFreshness, FreshnessResult } from "@/lib/verification";
import { FOOD_CATEGORIES, FOOD_ROUTING_MATRIX } from "@/lib/food-categorizer";
import { useProfile } from "@/lib/hooks/useProfile";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sounds";

/* ─── Schema ─── */
const donateSchema = z.object({
  food_name: z.string().min(2, "Food name is required"),
  food_type: z.string().min(1, "Select food type"),
  quantity_kg: z.coerce.number().min(0.5, "Minimum 0.5 kg"),
  pickup_address: z.string().min(5, "Address is required"),
});

type DonateForm = z.infer<typeof donateSchema>;

/* ─── Animation Variants ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(4px)"
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: "blur(0px)"
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(4px)"
  }),
};

export default function DonatePage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const [loading, setLoading] = useState(false);
  const [expiryHours, setExpiryHours] = useState(12);
  const [showModal, setShowModal] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [storageType, setStorageType] = useState<string>("room_temp");
  const [cookedAt, setCookedAt] = useState<string>("");

  const { profile } = useProfile();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<DonateForm>({
    resolver: zodResolver(donateSchema) as any,
    defaultValues: { food_type: "cooked" },
  });

  const watchedFoodType = watch("food_type");
  const watchedFoodName = watch("food_name");
  const watchedQuantity = watch("quantity_kg");
  const watchedAddress = watch("pickup_address");

  // Live freshness calculation
  const freshness: FreshnessResult | null = useMemo(() => {
    if (!cookedAt) return null;
    return calculateFreshness(
      new Date(cookedAt),
      storageType,
      watchedFoodType || "cooked",
      watchedFoodName || ""
    );
  }, [cookedAt, storageType, watchedFoodType, watchedFoodName]);

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["food_name", "food_type", "quantity_kg", "pickup_address"]);
      if (!valid) return;
    }
    if (step === 2) {
      if (!cookedAt) {
        toast.error("Please enter when the food was prepared.");
        return;
      }
    }
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: DonateForm) => {
    setLoading(true);
    try {
      if (!profile?.id) {
        throw new Error("You must be logged in as a donor to create a listing.");
      }
      const donorId = profile.id;

      // Ensure donor record exists (foreign key requirement)
      const { error: donorError } = await supabase.from("donors").upsert({
        id: donorId,
        name: profile.full_name || "Donor",
        type: "restaurant",
        address: data.pickup_address,
        trust_score: 100,
        lat: 19.0760,
        lng: 72.8777,
      }, { onConflict: "id" });

      if (donorError) {
        console.error("Donor upsert error:", donorError);
        throw new Error("Failed to create donor record: " + donorError.message);
      }

      const aiFlag = freshness?.aiExpiryFlag || false;
      const vStatus = aiFlag ? "ai_flagged" : "donor_approved";

      const expiresAt = freshness
        ? new Date(new Date(cookedAt).getTime() + freshness.maxHours * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          donor_id: donorId,
          food_name: data.food_name,
          food_type: data.food_type,
          quantity_kg: data.quantity_kg,
          meals: Math.ceil(data.quantity_kg * 4),
          expires_at: expiresAt,
          status: "available",
          cooked_at: cookedAt || new Date().toISOString(),
          storage_type: storageType,
          verification_status: vStatus,
          verification_step: aiFlag ? 1 : 2,
          ai_expiry_flag: aiFlag,
          address: data.pickup_address,
          lat: 19.0760,
          lng: 72.8777,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Mock matching API call
      const matchData = {
        success: true,
        bestMatch: {
          receiver: { name: "Hope Foundation", current_demand: 120 },
          distance: "2.4",
          score: 94.5
        }
      };

      sounds.matchSuccess();
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f97316', '#fbbf24']
      });

      setMatchResult(matchData);
      setShowModal(true);

      toast.success("✅ Food posted successfully!", {
        description: `AI matched to ${matchData.bestMatch.receiver.name} in 3.2 seconds`,
        duration: 4000,
        icon: '🍽️'
      });

      reset();
      setStep(1);
    } catch (err: any) {
      toast.error("⚠️ Something went wrong", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#08090A] min-h-screen flex flex-col items-center pt-12 pb-20 px-6">
      <div className="w-full max-w-xl">
        
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-[-0.04em]">
            Donate Surplus Food
          </h1>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === step ? "w-8 bg-emerald-500" : i < step ? "w-4 bg-emerald-500/50" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-[#bbcabf] text-sm mt-4">Step {step} of 3</p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
             <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              
              {/* STEP 1: FOOD DETAILS */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6">What are you donating?</h2>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block transition-transform group-focus-within:-translate-y-1">Food Name</label>
                      <input
                        {...register("food_name")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all py-3 px-4 outline-none text-white placeholder:text-slate-600"
                        placeholder="e.g. Fresh Garden Salad"
                      />
                      {errors.food_name && <p className="text-xs text-red-400 mt-1">{errors.food_name.message}</p>}
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block transition-transform group-focus-within:-translate-y-1">Food Type</label>
                      <select
                        {...register("food_type")}
                        className="w-full bg-[#111111] border border-white/10 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all py-3 px-4 outline-none text-white appearance-none cursor-pointer"
                      >
                        {FOOD_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      {errors.food_type && <p className="text-xs text-red-400 mt-1">{errors.food_type.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block transition-transform group-focus-within:-translate-y-1">Quantity (KG)</label>
                        <input
                          {...register("quantity_kg")}
                          type="number" step="0.1"
                          className="w-full bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all py-3 px-4 outline-none text-white"
                          placeholder="5.0"
                        />
                        {errors.quantity_kg && <p className="text-xs text-red-400 mt-1">{errors.quantity_kg.message}</p>}
                      </div>
                      <div className="group">
                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Est. Meals</label>
                         <div className="w-full bg-white/5 border border-white/5 rounded-lg py-3 px-4 text-emerald-400 font-bold">
                            {Math.ceil((watchedQuantity || 0) * 4)} Meals
                         </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block transition-transform group-focus-within:-translate-y-1">Pickup Address</label>
                      <textarea
                        {...register("pickup_address")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all py-3 px-4 outline-none text-white resize-none"
                        rows={2} placeholder="Full address..."
                      />
                      {errors.pickup_address && <p className="text-xs text-red-400 mt-1">{errors.pickup_address.message}</p>}
                    </div>
                  </div>

                  <button type="button" onClick={nextStep} className="w-full mt-4 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    Continue to Freshness <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: FRESHNESS & STORAGE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <button onClick={prevStep} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4"/> Back</button>
                  <h2 className="text-xl font-bold text-white mb-6">Food Quality Assessment</h2>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block">When was this prepared?</label>
                      <input
                        type="datetime-local"
                        value={cookedAt}
                        onChange={(e) => setCookedAt(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all py-3 px-4 outline-none text-white [color-scheme:dark]"
                      />
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block">How is it stored right now?</label>
                      <div className="flex gap-2">
                        {[
                          { id: "room_temp", label: "Room Temp", emoji: "\uD83C\uDF21\uFE0F" },
                          { id: "fridge", label: "Fridge", emoji: "\u2744\uFE0F" },
                          { id: "freezer", label: "Freezer", emoji: "\uD83E\uDDCA" },
                        ].map((s) => (
                          <button
                            key={s.id} type="button" onClick={() => setStorageType(s.id)}
                            className={`flex-1 py-4 rounded-lg text-sm font-semibold transition-all border ${storageType === s.id ? "bg-emerald-500/20 border-emerald-500 text-white transform scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"}`}
                          >
                            <span className="text-2xl mb-1 block">{s.emoji}</span>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Freshness Meter */}
                    {freshness && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-5 rounded-xl bg-white/5 border border-white/10 mt-4">
                         <div className="flex justify-between items-center mb-3">
                           <span className="text-sm font-semibold text-white flex items-center gap-2"><Thermometer className="w-4 h-4 text-emerald-400"/> AI Freshness Score</span>
                           <span className="text-xl font-bold" style={{ color: freshness.color }}>{Math.round(freshness.freshness)}%</span>
                         </div>
                         <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${freshness.freshness}%` }} transition={{ type: "spring", stiffness: 50, damping: 15 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${freshness.color}, ${freshness.color}80)` }}
                            />
                         </div>
                         <p className="text-xs text-slate-400 text-right">{Math.round(freshness.hoursRemaining)}h remaining</p>
                      </motion.div>
                    )}
                  </div>

                  <button type="button" onClick={nextStep} className="w-full py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    Review Donation <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* STEP 3: PREVIEW & SUBMIT */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6 h-full flex flex-col"
                >
                  <button onClick={prevStep} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4"/> Back</button>
                  <h2 className="text-xl font-bold text-white mb-4">Ready to Match!</h2>

                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 space-y-4 mb-4">
                     <div className="flex justify-between items-start border-b border-white/10 pb-4">
                       <div>
                         <h3 className="text-2xl font-bold text-white mb-1">{watchedFoodName}</h3>
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                           {watchedFoodType} • {watchedQuantity} KG
                         </span>
                       </div>
                       <div className="text-right">
                         <div className="text-3xl font-bold text-emerald-500">{Math.ceil((watchedQuantity || 0) * 4)}</div>
                         <div className="text-xs text-slate-400 uppercase tracking-widest">Meals</div>
                       </div>
                     </div>
                     
                     <div className="space-y-2 pt-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Storage</span>
                         <span className="text-white capitalize">{storageType.replace('_', ' ')}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Freshness</span>
                         <span className="font-bold" style={{ color: freshness?.color || '#fff' }}>{Math.round(freshness?.freshness || 0)}%</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Pickup</span>
                         <span className="text-white truncate max-w-[200px]">{watchedAddress}</span>
                       </div>
                     </div>
                  </div>

                  <button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Logistics...</> : <><Sparkles className="w-5 h-5" /> Confirm & Find Match</>}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && matchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="glass-panel max-w-md w-full p-8 rounded-2xl text-center border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                Matched with {matchResult.bestMatch.receiver.name}!
              </h3>
              <p className="text-sm text-[#bbcabf] mb-8">
                They are {matchResult.bestMatch.distance} km away and need {matchResult.bestMatch.receiver.current_demand} meals. A driver is being assigned.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-emerald-500 text-[#003824] font-bold rounded-lg hover:brightness-110 transition-all active:scale-95"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
