"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

export type BadgeTier = "verified" | "premium" | "flagship";

const TIER = {
  verified: {
    color: "#10b981", label: "FOODFLOW VERIFIED HOTEL",
    bg: "linear-gradient(135deg, #0a1f17, #0d2818, #081c12)",
    accent: "linear-gradient(90deg, transparent, #10b981, transparent)",
  },
  premium: {
    color: "#f97316", label: "FOODFLOW PREMIUM HOTEL",
    bg: "linear-gradient(135deg, #1f160a, #281a0d, #1c1308)",
    accent: "linear-gradient(90deg, transparent, #f97316, transparent)",
  },
  flagship: {
    color: "#6366f1", label: "FOODFLOW FLAGSHIP HOTEL",
    bg: "linear-gradient(135deg, #0f0a1f, #130d28, #0e081c)",
    accent: "linear-gradient(90deg, transparent, #6366f1, transparent)",
  },
};

const SIZES = { web: { w: 400, h: 220, s: 1 }, social: { w: 800, h: 440, s: 2 }, print: { w: 1200, h: 660, s: 3 } };

function TierIcon({ tier, color, size }: { tier: BadgeTier; color: string; size: number }) {
  if (tier === "shield" as string || tier === "verified") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" strokeWidth="2.5" />
    </svg>
  );
  if (tier === "premium") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" fill={color} fillOpacity="0.2" />
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 16h14v3H5z" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

interface BadgeProps {
  tier: BadgeTier;
  name: string;
  since?: string;
  donorId?: string;
  size?: "web" | "social" | "print";
  className?: string;
}

export default function VerifiedBadge({ tier, name, since, donorId, size = "web", className = "" }: BadgeProps) {
  const c = TIER[tier] || TIER.flagship;
  const d = SIZES[size] || SIZES.web;
  const s = d.s;
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const dateStr = mounted 
    ? (since ? new Date(since).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }))
    : "";
    
  const verifyUrl = donorId ? `${mounted && typeof window !== "undefined" ? window.location.origin : ""}/verify/${donorId}` : "https://foodflow.app/verify";

  return (
    <div className={`verified-badge-container ${className}`} style={{ width: d.w, height: d.h, position: "relative", borderRadius: 16, overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, background: c.bg, border: `1.5px solid ${c.color}33`, borderRadius: 16 }} />
      <div className="badge-holographic-shimmer" style={{ position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", zIndex: 1, background: `linear-gradient(105deg, transparent 30%, ${c.color}08 38%, ${c.color}15 42%, ${c.color}08 46%, transparent 54%)`, backgroundSize: "200% 100%", animation: "badge-shimmer 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: 60, height: 60, borderTop: `2px solid ${c.color}66`, borderLeft: `2px solid ${c.color}66`, borderRadius: "16px 0 0 0", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 60, height: 60, borderBottom: `2px solid ${c.color}66`, borderRight: `2px solid ${c.color}66`, borderRadius: "0 0 16px 0", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: `${s * 20}px ${s * 24}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: s * 10 }}>
          <div style={{ width: s * 36, height: s * 36, borderRadius: "50%", background: `${c.color}15`, border: `1.5px solid ${c.color}44`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${c.color}4d`, flexShrink: 0 }}>
            <TierIcon tier={tier} color={c.color} size={s * 24} />
          </div>
          <span style={{ fontSize: s * 11, fontWeight: 800, letterSpacing: "0.15em", color: c.color, textTransform: "uppercase" as const }}>{c.label}</span>
        </div>
        <div style={{ width: "70%", height: 2, background: c.accent, margin: `${s * 12}px 0`, borderRadius: 1 }} />
        <div style={{ fontSize: s * 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{name || "Restaurant Name"}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: s * 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: s * 3 }}>
            <span style={{ fontSize: s * 10, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Est. {dateStr}</span>
            <span style={{ fontSize: s * 10, color: c.color, fontWeight: 600, display: "flex", alignItems: "center", gap: s * 4 }}>
              <svg width={s * 10} height={s * 10} viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              Zero Surplus Waste
            </span>
          </div>
          <div style={{ background: "white", borderRadius: s * 4, padding: s * 4, display: "flex" }}>
            <QRCodeSVG value={verifyUrl} size={s * 44} bgColor="white" fgColor="#111" level="M" />
          </div>
        </div>
      </div>
      <style>{`@keyframes badge-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

export async function downloadBadge(tier: BadgeTier, restaurantName: string, size: "web" | "social" | "print" = "social") {
  const html2canvas = (await import("html2canvas")).default;
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1";
  document.body.appendChild(container);
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);
  root.render(React.createElement(VerifiedBadge, { tier, name: restaurantName, size }));
  await new Promise(r => setTimeout(r, 600));
  const el = container.querySelector(".verified-badge-container") as HTMLElement;
  if (!el) { document.body.removeChild(container); return; }
  const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
  const link = document.createElement("a");
  link.download = `foodflow-${tier}-badge-${restaurantName.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  root.unmount();
  document.body.removeChild(container);
}
