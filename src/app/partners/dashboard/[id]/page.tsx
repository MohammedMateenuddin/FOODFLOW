"use client";

import React, { useState,  } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, TrendingUp, Zap, Calendar, Download, CreditCard, ChevronRight, Clock, MapPin, Truck, X, Lock } from "lucide-react";
import { useProfile } from "@/lib/hooks/useProfile";
import { toast } from "sonner";

// Mock data based on the request
const MOCK_EXPECTED = [
  { id: 1, type: "Raw vegetables", qty: 20, time: "14:00", from: "Taj Hotel", eta: "15 min away" },
  { id: 2, type: "Bakery items", qty: 25, time: "16:30", from: "The Oberoi", eta: "Scheduled" }
];

export default function PartnerDashboard() {
  const params = useParams();
  const partnerId = params.id as string;
  const { profile } = useProfile();
  
  const [outputVal, setOutputVal] = useState("120");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const totalReceived = 680;
  const tippingFees = 1020;
  const subscription = 5000;
  const totalInvoice = tippingFees + subscription;

  const handleDownloadInvoice = () => {
    // Simple mock for hackathon: open a print dialog
    window.print();
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const processMockRazorpay = () => {
    setProcessingPayment(true);
    // Mock Razorpay API network delay
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      toast.success("Payment Successful!", { description: "Invoice #INV-2026-05 paid." });
      
      // Auto close modal after showing success state
      setTimeout(() => {
         setShowPaymentModal(false);
      }, 2000);
    }, 2500);
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (d: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: d, ease: "easeOut" },
    }),
  };

  return (
    <div className="bg-[#08090A] min-h-screen text-[#e3e2e3] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Partner Dashboard</h1>
            <p className="text-slate-400">{profile?.full_name || "Green Energy Biogas Plant"} • ID: {profile?.id ? profile.id.substring(0, 8) : partnerId.substring(0, 8)}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={handleDownloadInvoice} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors text-white">
                <Download className="w-4 h-4" /> Download Invoice
             </button>
             <button onClick={handlePayment} disabled={paymentSuccess || processingPayment} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${paymentSuccess ? "bg-emerald-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"}`}>
                {processingPayment ? (
                   "Processing..."
                ) : paymentSuccess ? (
                   "Paid Successfully!"
                ) : (
                   <><CreditCard className="w-4 h-4" /> Pay ₹{totalInvoice.toLocaleString()}</>
                )}
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* TODAY'S INTAKE */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-500/20 rounded-lg">
                 <Package className="w-6 h-6 text-blue-400" />
               </div>
               <div>
                 <h2 className="text-lg font-bold text-white">Today's Expected Intake</h2>
                 <p className="text-sm text-blue-400">Total: ~45 kg arriving</p>
               </div>
            </div>
            
            <div className="space-y-4">
              {MOCK_EXPECTED.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="text-xl">{item.type.includes("veg") ? "🥦" : "🍞"}</div>
                    <div>
                      <div className="font-semibold text-white">{item.type} <span className="text-slate-400 font-normal">({item.qty} kg)</span></div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> From: {item.from}</div>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-blue-400 font-bold">{item.time}</div>
                     <div className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1"><Truck className="w-3 h-3" /> {item.eta}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* MONTHLY STATS & BILLING */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.2} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
               <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-slate-400" /> This Month</h2>
               
               <div className="space-y-4 mb-6">
                 <div className="flex justify-between items-end">
                   <span className="text-sm text-slate-400">Total Received</span>
                   <span className="text-xl font-bold text-white">{totalReceived} kg</span>
                 </div>
                 <div className="h-px w-full bg-white/10" />
                 <div className="flex justify-between items-end">
                   <span className="text-sm text-slate-400">Tipping Fees Owed</span>
                   <span className="text-white">₹{tippingFees.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="text-sm text-slate-400">Subscription (Basic)</span>
                   <span className="text-white">₹{subscription.toLocaleString()}</span>
                 </div>
               </div>
            </div>
            
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
              <span className="font-bold text-emerald-400">Total Invoice</span>
              <span className="text-2xl font-bold text-emerald-400">₹{totalInvoice.toLocaleString()}</span>
            </div>
          </motion.div>
        </div>

        {/* OUTPUT TRACKER */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="glass-panel p-6 rounded-2xl border border-white/10">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Output Generation Tracker</h2>
                  <p className="text-sm text-slate-400">Log your yield to earn carbon credits</p>
                </div>
             </div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 rounded-xl border border-white/5">
              <div className="flex-1 w-full text-center md:text-left">
                 <div className="text-sm text-slate-400 mb-1">Input Received Today</div>
                 <div className="text-3xl font-bold text-white">45 <span className="text-lg text-slate-500 font-normal">kg</span></div>
              </div>
              
              <div className="hidden md:block text-slate-600">
                <ChevronRight className="w-8 h-8" />
              </div>

              <div className="flex-1 w-full relative">
                 <div className="text-sm text-purple-400 font-semibold mb-2">Generated Output (kWh)</div>
                 <div className="flex items-center gap-3">
                   <input 
                     type="number" 
                     value={outputVal} 
                     onChange={e => setOutputVal(e.target.value)}
                     className="w-full bg-white/10 border border-purple-500/30 rounded-lg py-3 px-4 text-2xl font-bold text-white focus:outline-none focus:border-purple-500"
                   />
                   <button onClick={() => toast.success(`Successfully logged ${outputVal} kWh of generated output!`, { description: "Carbon credits are being calculated and synced to the global ledger.", icon: '🌱' })} className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg transition-colors active:scale-95">
                     Save
                   </button>
                 </div>
              </div>
           </div>
           
           <p className="text-xs text-slate-500 mt-4 text-center">Output data syncs automatically with FoodFlow's global impact dashboard.</p>
        </motion.div>
      </div>

      {/* RAZORPAY STYLE MOCK MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-0 rounded-2xl max-w-[400px] w-full shadow-2xl relative overflow-hidden">
               
               {/* Modal Header */}
               <div className="bg-[#0A2540] p-6 text-white relative">
                 <button onClick={() => !processingPayment && setShowPaymentModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg tracking-tight">FoodFlow Partner Network</span>
                 </div>
                 <div className="text-3xl font-light mb-1">₹{totalInvoice.toLocaleString()}</div>
                 <div className="text-white/60 text-sm">Invoice #INV-2026-05</div>
               </div>

               {/* Modal Body */}
               <div className="p-6">
                 {paymentSuccess ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                       <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <h3 className="text-xl font-bold text-slate-800">Payment Successful</h3>
                       <p className="text-slate-500 text-sm mt-2">Redirecting back to dashboard...</p>
                    </motion.div>
                 ) : (
                   <div className="space-y-4">
                     <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-colors">
                        <div className="w-10 h-10 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center font-bold text-blue-600">UPI</div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">Pay via UPI</div>
                          <div className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</div>
                        </div>
                     </div>

                     <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50/50 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center"><CreditCard className="w-5 h-5 text-slate-600" /></div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-800">Credit / Debit Card</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                           <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242" className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm" />
                           <div className="flex gap-3">
                             <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm" />
                             <input type="text" placeholder="CVV" defaultValue="123" className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm" />
                           </div>
                        </div>
                     </div>

                     <button onClick={processMockRazorpay} disabled={processingPayment} className="w-full bg-[#0A2540] text-white font-bold py-3.5 rounded-lg mt-4 flex items-center justify-center gap-2 hover:bg-[#123659] transition-colors shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                        {processingPayment ? (
                           <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</>
                        ) : (
                           <><Lock className="w-4 h-4"/> Pay ₹{totalInvoice.toLocaleString()}</>
                        )}
                     </button>
                     <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                        Secured by <span className="font-bold text-slate-600">Razorpay</span>
                     </div>
                   </div>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
