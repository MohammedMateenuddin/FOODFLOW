"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function FloatingHelp() {
  const pathname = usePathname();

  const handleHelpClick = () => {
    let context = "FoodFlow Support";
    if (pathname.includes("/donate")) context = "Donor Support";
    if (pathname.includes("/receiver")) context = "NGO Logistics Support";
    if (pathname.includes("/driver")) context = "Driver Support";
    if (pathname.includes("/partners")) context = "Valorization Partner Support";

    toast.custom((t) => (
      <div className="bg-[#111111] border border-white/10 p-6 rounded-xl shadow-2xl min-w-[300px]">
        <h3 className="text-lg font-bold text-white mb-2">{context}</h3>
        <p className="text-sm text-slate-400 mb-4">We are here to help you around the clock.</p>
        <div className="space-y-3">
           <a href="tel:18001234567" className="block w-full py-2 px-4 bg-emerald-500/10 text-emerald-500 font-bold rounded text-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
             📞 1800-123-4567
           </a>
           <a href="mailto:support@foodflow.in" className="block w-full py-2 px-4 bg-white/5 text-white font-bold rounded text-center border border-white/10 hover:bg-white/10 transition-colors">
             ✉️ support@foodflow.in
           </a>
        </div>
        <button onClick={() => toast.dismiss(t)} className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-white transition-colors">
          Close
        </button>
      </div>
    ), { duration: Infinity });
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleHelpClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-[#003824] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center cursor-pointer hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-shadow"
    >
      <HelpCircle className="w-6 h-6" />
    </motion.button>
  );
}
