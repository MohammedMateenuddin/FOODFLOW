"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Star, Crown, Check, ArrowRight, Zap, TrendingUp, BarChart3, Database, Globe, Truck, X, CreditCard, Lock } from "lucide-react";

const plans = [
  {
    id: "basic", icon: Shield, label: "Basic Intake", color: "#10b981", price: "₹2,499", priceNum: 2499,
    features: ["Access to 500kg waste/month", "Standard route optimization", "Monthly impact statement", "Email support"],
  },
  {
    id: "growth", icon: TrendingUp, label: "Growth Partner", color: "#f97316", price: "₹7,999", priceNum: 7999,
    features: ["Access to 2,000kg waste/month", "Priority route optimization", "Real-time intake analytics", "Weekly impact report", "24/7 Priority support"],
  },
  {
    id: "enterprise", icon: Globe, label: "Enterprise Flow", color: "#6366f1", price: "₹19,999", priceNum: 19999,
    features: ["Unlimited waste intake", "Custom API integration", "White-label impact reports", "Dedicated fleet manager", "Marketing spotlight on FoodFlow", "CSR tax benefit certification"],
  },
];

export default function PartnerSubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("growth");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = (plan: any) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setShowCheckout(true);
    setSuccess(false);
  };

  const processPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setCurrentPlan(selectedPlan.id);
        setShowCheckout(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="bg-[#08090A] text-[#e3e2e3] min-h-screen pb-20">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px]" />
        
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">Valorization Business Model</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Fuel Your Production with <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Verified Supply</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Subscribe to FoodFlow to access a consistent, verified stream of organic waste for your biogas or composting units. 
              <span className="text-white font-medium"> Turn surplus into value.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING TABLE ═══ */}
      <section className="relative py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 border transition-all ${
                  currentPlan === plan.id
                    ? "bg-white/[0.06] border-purple-500/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
                style={currentPlan === plan.id ? { boxShadow: `0 0 60px ${plan.color}10` } : {}}
              >
                {plan.id === "growth" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-xs font-bold text-white tracking-wider uppercase">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}33` }}>
                    <plan.icon className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.label}</h3>
                    <span className="text-sm text-slate-400">Intake Plan</span>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                  <p className="text-xs text-slate-500 mt-2">Plus ₹50 per pickup tipping fee</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${
                    currentPlan === plan.id 
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {currentPlan === plan.id ? "Current Plan" : `Upgrade to ${plan.label}`}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHECKOUT MODAL ═══ */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-0 rounded-2xl max-w-[400px] w-full shadow-2xl relative overflow-hidden">
               
               {/* Modal Header */}
               <div className="bg-[#0A2540] p-6 text-white relative">
                 <button onClick={() => !processing && setShowCheckout(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg tracking-tight">FoodFlow Partner Billing</span>
                 </div>
                 <div className="text-3xl font-light mb-1">{selectedPlan?.price}</div>
                 <div className="text-white/60 text-sm">Upgrade to {selectedPlan?.label}</div>
               </div>

               {/* Modal Body */}
               <div className="p-6">
                 {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                       <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <h3 className="text-xl font-bold text-slate-800">Subscription Active</h3>
                       <p className="text-slate-500 text-sm mt-2">Welcome to {selectedPlan?.label}! Enjoy your expanded intake capacity.</p>
                    </motion.div>
                 ) : (
                   <div className="space-y-4">
                     <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-colors">
                        <div className="w-10 h-10 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center font-bold text-blue-600 italic">UPI</div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">Pay via UPI</div>
                          <div className="text-xs text-slate-500">GPay, PhonePe, Paytm</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                     </div>

                     <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50/50 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center"><CreditCard className="w-5 h-5 text-slate-600" /></div>
                              <div className="font-bold text-slate-800">Credit / Debit Card</div>
                           </div>
                           <div className="w-4 h-4 rounded-full border-4 border-blue-500 bg-white" />
                        </div>
                        <div className="space-y-3">
                           <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242" className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                           <div className="flex gap-3">
                             <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                             <input type="text" placeholder="CVV" defaultValue="123" className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={processPayment} 
                       disabled={processing} 
                       className="w-full bg-[#0A2540] text-white font-bold py-3.5 rounded-lg mt-4 flex items-center justify-center gap-2 hover:bg-[#123659] transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                     >
                        {processing ? (
                           <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Securing payment...</>
                        ) : (
                           <><Lock className="w-4 h-4"/> Pay {selectedPlan?.price}</>
                        )}
                     </button>
                     <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                        Powered by <span className="font-bold text-slate-600">Razorpay</span>
                     </div>
                   </div>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══ TIPPING FEE EXPLANATION ═══ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">How Tipping Fees Work</h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  In addition to your monthly subscription, a small "Tipping Fee" is charged per kilogram of intake. 
                  This ensures that the supply chain remains sustainable and incentivizes donors to segregate waste correctly.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Billed per collected metric tonne
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Automated invoicing via intake dashboard
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Shared with logistics and driver network
                  </li>
                </ul>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-[#0F1012] border border-white/10 rounded-2xl p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-1">₹2.50</div>
                  <div className="text-sm text-slate-400 uppercase tracking-widest font-bold">Per Kilogram</div>
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs text-slate-500">Average tipping fee across all categories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═══ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-16">Why Valorize with FoodFlow?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <Database className="w-10 h-10 text-purple-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Consistent Supply</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Stop worrying about seasonal fluctuations. Our network of hotels and restaurants ensures your units run at max capacity.</p>
            </div>
            <div>
              <Truck className="w-10 h-10 text-purple-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Direct Logistics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Integrated driver network delivers waste directly to your facility. Track every gram from source to intake.</p>
            </div>
            <div>
              <TrendingUp className="w-10 h-10 text-purple-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Scalable Revenue</h3>
              <p className="text-sm text-slate-400 leading-relaxed">More waste means more biogas or compost. Scale your business by accessing new geographic zones through our platform.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
