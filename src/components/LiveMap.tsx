"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing, Donor, Receiver, ValorizationPartner, ValorizationLog } from "@/lib/types";

// Helper to create circular SVG icons
const createIconHtml = (color: string, svg: string) => `
  <div class="relative flex items-center justify-center w-8 h-8 bg-white border-2 rounded-full shadow-[0_0_15px_${color}]" style="border-color: ${color}">
    ${svg}
  </div>
`;

// Badge-tier icons (larger, more prominent)
const createBadgeIconHtml = (color: string, emoji: string, glowColor: string) => `
  <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-[0_0_25px_${glowColor}]" style="background: ${color}; border: 2px solid ${color}">
    <span style="font-size: 18px; line-height: 1;">${emoji}</span>
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30" style="background: ${color}"></span>
  </div>
`;

// Donor (Green Utensils)
const donorHtml = createIconHtml("#10b981", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`);

// Receiver (Orange Home)
const receiverHtml = createIconHtml("#f97316", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`);

// Biogas (Blue Zap)
const biogasHtml = createIconHtml("#3b82f6", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`);

// Farmer (Lime Sprout/Wheat)
const farmerHtml = createIconHtml("#84cc16", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>`);

// Cattle (Purple Heart/Animal)
const cattleHtml = createIconHtml("#a855f7", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`);

// Compost (Teal Leaf)
const compostHtml = createIconHtml("#14b8a6", `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`);

// Badge tier icons
const flagshipHtml = createBadgeIconHtml("#6366f1", "👑", "#6366f1");
const premiumBadgeHtml = createBadgeIconHtml("#f97316", "⭐", "#f97316");
const verifiedBadgeHtml = createBadgeIconHtml("#10b981", "🛡️", "#10b981");

const donorIcon = new L.DivIcon({ html: donorHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const receiverIcon = new L.DivIcon({ html: receiverHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const biogasIcon = new L.DivIcon({ html: biogasHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const farmerIcon = new L.DivIcon({ html: farmerHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const cattleIcon = new L.DivIcon({ html: cattleHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const compostIcon = new L.DivIcon({ html: compostHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const flagshipIcon = new L.DivIcon({ html: flagshipHtml, className: "", iconSize: [40, 40], iconAnchor: [20, 20] });
const premiumBadgeIcon = new L.DivIcon({ html: premiumBadgeHtml, className: "", iconSize: [40, 40], iconAnchor: [20, 20] });
const verifiedBadgeIcon = new L.DivIcon({ html: verifiedBadgeHtml, className: "", iconSize: [40, 40], iconAnchor: [20, 20] });

const urgentDonorHtml = `
  <div class="relative flex items-center justify-center w-8 h-8 bg-white border-2 border-red-500 rounded-full shadow-[0_0_15px_#ef4444]">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="relative z-10"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  </div>
`;
const urgentDonorIcon = new L.DivIcon({ html: urgentDonorHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });

// Badge tier labels and colors
const badgeTierConfig: Record<string, { label: string; emoji: string; color: string }> = {
  flagship: { label: "FLAGSHIP PARTNER", emoji: "👑", color: "#6366f1" },
  premium: { label: "PREMIUM PARTNER", emoji: "⭐", color: "#f97316" },
  verified: { label: "VERIFIED PARTNER", emoji: "🛡️", color: "#10b981" },
};

interface LiveMapProps {
  donors: (Donor & { badge_tier?: string | null; badge_active?: boolean })[];
  receivers: Receiver[];
  listings?: Listing[];
  partners?: ValorizationPartner[];
  valorizationLogs?: ValorizationLog[];
  showEdible?: boolean;
  showValorization?: boolean;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

function AnimatedView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 2, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

function getDonorIcon(donor: Donor & { badge_tier?: string | null; badge_active?: boolean }, hasUrgent: boolean) {
  if (donor.badge_active && donor.badge_tier) {
    switch (donor.badge_tier) {
      case "flagship": return flagshipIcon;
      case "premium": return premiumBadgeIcon;
      case "verified": return verifiedBadgeIcon;
    }
  }
  return hasUrgent ? urgentDonorIcon : donorIcon;
}

export default function LiveMap({
  donors,
  receivers,
  listings = [],
  partners = [],
  valorizationLogs = [],
  showEdible = true,
  showValorization = true,
  center = [20.5937, 78.9629],
  zoom = 5,
  className,
}: LiveMapProps) {
  
  // Edible Matches
  const matches = listings
    .filter(l => l.status === "matched" && l.matched_receiver_id)
    .map(listing => {
      const donor = donors.find(d => d.id === listing.donor_id);
      const receiver = receivers.find(r => r.id === listing.matched_receiver_id);
      return { listing, donor, receiver };
    })
    .filter(m => m.donor && m.receiver);

  // Valorization Matches
  const valMatches = valorizationLogs.map(log => {
    const listing = listings.find(l => l.id === log.listing_id);
    const donor = donors.find(d => d.id === listing?.donor_id);
    const partner = partners.find(p => p.id === log.partner_id);
    return { log, donor, partner };
  }).filter(m => m.donor && m.partner);

  return (
    <>
      <style>{`
        .animated-dashed-line {
          stroke-dasharray: 10, 15;
          animation: dash-animation 2s linear infinite;
        }
        @keyframes dash-animation {
          to { stroke-dashoffset: -50; }
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        className={className || "h-[500px] w-full rounded-xl"}
        style={{ background: "#f8fafc" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <AnimatedView center={center} zoom={zoom} />

        {/* Edible Polylines */}
        {showEdible && matches.map((m, i) => (
          <Polyline
            key={`match-${m.listing.id}-${i}`}
            positions={[
              [m.donor!.lat, m.donor!.lng],
              [m.receiver!.lat, m.receiver!.lng]
            ]}
            pathOptions={{ color: "#c3d000", weight: 3, opacity: 0.8 }}
            className="animated-dashed-line"
          />
        ))}

        {/* Valorization Polylines */}
        {showValorization && valMatches.map((m, i) => (
          <Polyline
            key={`valmatch-${m.log.id}-${i}`}
            positions={[
              [m.donor!.lat, m.donor!.lng],
              [m.partner!.lat, m.partner!.lng]
            ]}
            pathOptions={{ color: "#fbbf24", weight: 3, opacity: 0.8 }}
            className="animated-dashed-line"
          />
        ))}

        {/* Donor markers — with badge tier awareness */}
        {donors.map((donor) => {
          const donorListings = listings.filter(l => l.donor_id === donor.id && l.status === "available");
          const hasUrgent = donorListings.some(l => {
            const hrs = (new Date(l.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);
            return hrs < 2 && hrs > 0;
          });
          const icon = getDonorIcon(donor, hasUrgent);
          const isBadged = donor.badge_active && donor.badge_tier;
          const badgeConfig = isBadged ? badgeTierConfig[donor.badge_tier!] : null;
          
          // Generate mock stats for badged donors
          const mockMeals = isBadged ? Math.floor(Math.random() * 3000) + 500 : 0;
          const mockKg = isBadged ? Math.floor(mockMeals * 0.4) : 0;
          const mockCo2 = isBadged ? Math.floor(mockKg * 2.5) : 0;
          const trustScore = isBadged ? Math.floor(Math.random() * 10) + 90 : 0;

          return (
            <React.Fragment key={`donor-${donor.id}`}>
              <Marker position={[donor.lat, donor.lng]} icon={icon}>
                <Popup>
                  <div className="text-sm bg-[#111] text-white p-3 rounded-lg min-w-[220px]" style={{ border: isBadged ? `1px solid ${badgeConfig!.color}44` : "1px solid rgba(16,185,129,0.2)" }}>
                    {isBadged && badgeConfig ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ fontSize: 16 }}>{badgeConfig.emoji}</span>
                          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: badgeConfig.color }}>{badgeConfig.label}</span>
                        </div>
                        <p className="font-bold text-white text-base mb-0.5">{donor.name}</p>
                        <p className="text-slate-400 text-xs mb-3">{donor.address || donor.type}</p>
                        <div className="w-full h-px bg-white/10 mb-3" />
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2"><span>🍽️</span> <span className="text-slate-300">{mockMeals.toLocaleString()} meals donated</span></div>
                          <div className="flex items-center gap-2"><span>📦</span> <span className="text-slate-300">{mockKg.toLocaleString()} kg food rescued</span></div>
                          <div className="flex items-center gap-2"><span>🌍</span> <span className="text-slate-300">{mockCo2.toLocaleString()} kg CO₂ avoided</span></div>
                          <div className="flex items-center gap-2"><span>✅</span> <span className="text-emerald-400 font-semibold">Trust Score: {trustScore}/100</span></div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={`/verify/${donor.id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-colors" style={{ background: `${badgeConfig.color}22`, color: badgeConfig.color, border: `1px solid ${badgeConfig.color}33` }}>
                            Verify Badge
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-emerald-400">{donor.name}</p>
                        <p className="text-slate-400 text-xs">{donor.type}</p>
                        {hasUrgent && <p className="text-red-400 text-xs font-bold mt-1">URGENT SURPLUS</p>}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Receiver markers */}
        {receivers.map((receiver) => (
          <React.Fragment key={`receiver-${receiver.id}`}>
            <Marker position={[receiver.lat, receiver.lng]} icon={receiverIcon}>
              <Popup>
                <div className="text-sm bg-[#111] text-white p-2 rounded-lg border border-orange-500/20">
                  <p className="font-bold text-orange-400">{receiver.name}</p>
                  <p className="text-slate-400 text-xs">{receiver.type}</p>
                  <p className="text-emerald-400 text-xs mt-1">Needs: {receiver.current_demand} meals</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Valorization Partners markers */}
        {partners.map((partner) => {
          let pIcon = compostIcon;
          if (partner.type === "biogas") pIcon = biogasIcon;
          else if (partner.type === "cattle_feed") pIcon = cattleIcon;
          else if (partner.type === "farmer") pIcon = farmerIcon;

          return (
            <React.Fragment key={`partner-${partner.id}`}>
              <Marker position={[partner.lat, partner.lng]} icon={pIcon}>
                <Popup>
                  <div className="text-sm bg-[#111] text-white p-2 rounded-lg border border-white/20">
                    <p className="font-bold text-white">{partner.name}</p>
                    <p className="text-slate-400 text-xs uppercase">{partner.type}</p>
                    <p className="text-emerald-400 text-xs mt-1">Capacity: {partner.capacity_kg_per_day} kg/day</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </>
  );
}
