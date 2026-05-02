"use client";
import Image from "next/image";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, User as UserIcon, LogOut, Settings, ChevronDown, Activity, Trash2, Database, ShieldAlert, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/hooks/useProfile";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);

  const getNotifications = (role?: string) => {
    const base = [
      { id: 1, icon: '🍱', title: 'Welcome to FoodFlow!', msg: 'Your account is set up and ready.', time: 'Just now' },
    ];
    if (role === 'donor') return [
      ...base,
      { id: 2, icon: '✅', title: 'Listing matched!', msg: 'Your food has been matched with an NGO.', time: '2 min ago' },
      { id: 3, icon: '🚗', title: 'Driver assigned', msg: 'Ramesh is picking up your donation.', time: '5 min ago' },
    ];
    if (role === 'ngo') return [
      ...base,
      { id: 2, icon: '🍛', title: 'New food available', msg: '12kg Butter Chicken near you.', time: '1 min ago' },
      { id: 3, icon: '🚗', title: 'Pickup arriving', msg: 'Driver is 10 mins away.', time: '8 min ago' },
    ];
    if (role === 'driver') return [
      ...base,
      { id: 2, icon: '📦', title: 'New delivery request', msg: 'Pickup from Taj Hotel — 2.4km.', time: '30s ago' },
      { id: 3, icon: '💰', title: 'Bonus unlocked!', msg: '1.5× bonus active in your zone.', time: '3 min ago' },
    ];
    if (role === 'admin') return [
      ...base,
      { id: 2, icon: '⚠️', title: 'New complaint filed', msg: 'NGO reported food quality issue.', time: '1 min ago' },
      { id: 3, icon: '📊', title: 'MRR milestone', msg: 'Monthly revenue crossed ₹40,000.', time: '1 hr ago' },
    ];
    return base;
  };
  
  const { profile, loading } = useProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch(role) {
      case 'donor': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ngo': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'driver': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'valorization_partner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Define Links by Role
  const LOGGED_OUT_LINKS = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#about", label: "About" },
  ];

  const DONOR_LINKS = [
    { href: "/donate", label: "Donate" },
    { href: "/map", label: "Live Map" },
    { href: "/donor/badge", label: "Get Badge" },
    { href: "/impact", label: "My Impact" },
    { href: "/csr", label: "CSR" },
  ];

  const NGO_LINKS = [
    { href: "/receiver", label: "Available Food" },
    { href: "/map", label: "Live Map" },
    { href: "/impact", label: "My Requests" },
  ];

  const DRIVER_LINKS = [
    { href: "/driver/dashboard", label: "Available Pickups" },
    { href: "/driver/deliveries", label: "My Deliveries" },
    { href: "/driver/earnings", label: "Earnings" },
  ];

  const PARTNER_LINKS = [
    { href: "/partners/dashboard/me", label: "Intake Dashboard" },
    { href: "/partners/subscription", label: "Billing \u0026 Plans" },
  ];

  const ADMIN_LINKS = [
    { href: "/admin/revenue", label: "Revenue", icon: BarChart },
    { href: "/admin/complaints", label: "Complaints", icon: ShieldAlert },
    { href: "/admin/partners", label: "Partners", icon: Activity },
    { href: "/admin/reset", label: "Reset Demo", icon: Trash2 },
    { href: "/admin/seed", label: "Seed Data", icon: Database },
  ];

  // Pick correct array
  let currentLinks = LOGGED_OUT_LINKS;
  if (profile) {
    if (profile.role === 'donor') currentLinks = DONOR_LINKS;
    else if (profile.role === 'ngo') currentLinks = NGO_LINKS;
    else if (profile.role === 'driver') currentLinks = DRIVER_LINKS;
    else if (profile.role === 'valorization_partner') currentLinks = PARTNER_LINKS;
    else if (profile.role === 'admin') {
      // Admins see everything + admin menu
      currentLinks = [...DONOR_LINKS, ...NGO_LINKS.slice(0, 1), ...PARTNER_LINKS.slice(0,1)];
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-50">
          <span className="text-2xl font-bold tracking-tighter text-white">
            FoodFlow
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {currentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "tracking-tight font-semibold text-sm transition-all duration-300",
                pathname === link.href ? "text-emerald-400" : "text-gray-400 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin Menu Dropdown */}
          {profile?.role === 'admin' && (
            <div className="relative">
              <button 
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                ⚙️ Admin <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {adminOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-48 bg-[#121315] border border-white/10 rounded-xl shadow-xl overflow-hidden py-2"
                  >
                    {ADMIN_LINKS.map(link => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => setAdminOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <link.icon className="w-4 h-4" /> {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && !profile ? (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <button className="bg-emerald-500 text-[#00422b] text-sm px-5 py-2 rounded-xl transition-all duration-300 hover:bg-emerald-400 active:scale-95 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  Sign Up →
                </button>
              </Link>
            </>
          ) : !loading && profile ? (
            <div className="flex items-center gap-5">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative text-slate-400 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {(() => { const unread = getNotifications(profile?.role).filter(n => !readNotifs.includes(n.id)).length; return unread > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black animate-pulse">
                      {unread}
                    </span>
                  ) : null; })()}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-80 bg-[#121315] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                          <span className="text-sm font-bold text-white">Notifications</span>
                          <button
                            onClick={() => setReadNotifs(getNotifications(profile?.role).map(n => n.id))}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                          {getNotifications(profile?.role).map(n => (
                            <div
                              key={n.id}
                              onClick={() => setReadNotifs(prev => [...prev, n.id])}
                              className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${!readNotifs.includes(n.id) ? 'bg-emerald-500/5' : ''}`}
                            >
                              <span className="text-xl mt-0.5">{n.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold text-white truncate">{n.title}</span>
                                  {!readNotifs.includes(n.id) && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{n.msg}</p>
                                <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-white/10 text-center">
                          <span className="text-xs text-slate-500">Realtime notifications coming soon</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                 <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-1.5 pr-4 py-1.5 rounded-full transition-all"
                >
                  {/* Avatar: Google photo OR initials fallback */}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-xs font-bold">
                      {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                    {profile.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[#121315] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">
                            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{profile.full_name}</div>
                          <div className={cn("inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", getRoleBadgeColor(profile.role))}>
                            {profile.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                           <UserIcon className="w-4 h-4" /> My Profile
                        </Link>
                        <Link href="/settings" onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                      </div>
                      
                      <div className="p-2 border-t border-white/10">
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/5 transition-colors text-white z-50"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl overflow-hidden fixed top-20 left-0 w-full"
          >
            <div className="px-8 py-6 flex flex-col h-full space-y-2">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-4 rounded-xl text-lg font-semibold transition-colors",
                    pathname === link.href ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!profile ? (
                <div className="mt-8 space-y-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full py-4 text-center text-white font-bold bg-white/5 rounded-xl">
                    Log In
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block w-full py-4 text-center text-[#003824] font-bold bg-emerald-500 rounded-xl">
                    Sign Up →
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={handleSignOut}
                  className="mt-8 flex items-center justify-center gap-2 w-full py-4 text-red-400 font-bold bg-red-500/10 rounded-xl"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
